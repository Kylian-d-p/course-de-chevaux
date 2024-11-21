import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express, { Request } from "express";
import session from "express-session";
import http from "http";
import { Server as SocketIoServer } from "socket.io";
import { z } from "zod";
import { prisma } from "./database";
import { Game } from "./game";
import { types } from "./types";

dotenv.config();

const checkedEnv = types.env.safeParse(process.env);

if (!checkedEnv.success) {
  throw new Error(checkedEnv.error.errors.map((err) => err.message).join(", "));
}

const env = checkedEnv.data;

declare module "express-session" {
  interface SessionData {
    user: {
      id: string;
      pseudo: string;
    };
  }
}

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIoServer(httpServer);
const sessionMiddleware = session({
  secret: env.SESSION_SECRET,
  name: "course-de-chevaux.SID",
  resave: true,
  saveUninitialized: true,
});

const games: Game[] = [];

app.use(express.json());
app.set("trust proxy", 1);
app.use(sessionMiddleware);
app.use("/", express.static("static"));

app.get("/api/leaderboard", async (req, res) => {
  const leaderboard = await prisma.players.findMany({
    where: {
      bestTime: {
        not: null,
      },
    },
    take: 15,
    orderBy: {
      bestTime: "asc",
    },
  });
  res.json({ leaderboard: leaderboard.map((player) => ({ name: player.pseudo, time: player.bestTime })) });
  return;
});

app.post("/api/room/create", (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ message: "Vous devez être connecté pour lancer une partie" });
    return;
  }
  const game = new Game({ players: [], io });
  games.push(game);

  res.json({ data: { gameId: game.getId() } });
});

app.post("/api/room/run", (req, res) => {
  if (!req.session.user) {
    res.status(403).json({ message: "Vous devez être connecté pour lancer une partie" });
    return;
  }

  const checkedBody = types.appRunBody.safeParse(req.body);

  if (!checkedBody.success) {
    res.status(400).json({ message: "Requête invalide" });
    return;
  }

  const { gameId } = checkedBody.data;

  const game = games.find((game) => game.getId() === gameId);

  if (!game) {
    res.status(404).json({ message: "Partie introuvable" });
    return;
  }

  const player = game.getPlayers().find((player) => player.getName() === req.session.user!.pseudo);

  if (!player) {
    res.status(403).json({ message: "Vous ne participez pas à cette partie" });
    return;
  }

  game.run();

  res.json({ message: "Partie lancée" });
});

app.post("/api/auth/login", async (req, res) => {
  if (req.session.user) {
    res.status(403).json({ message: "Vous êtes déjà connecté" });
    return;
  }

  const checkedBody = types.appLoginBody.safeParse(req.body);

  if (!checkedBody.success) {
    res.status(400).json({ message: "Requête invalide" });
    return;
  }

  const { pseudo, password } = checkedBody.data;

  const user = await prisma.players.findUnique({
    where: {
      pseudo,
    },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.players.create({
      data: {
        pseudo,
        password: hashedPassword,
      },
    });

    req.session.user = { id: newUser.id, pseudo: newUser.pseudo };
  } else {
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      res.status(401).json({ message: "Mot de passe incorrect" });
      return;
    }

    req.session.user = { id: user.id, pseudo: user.pseudo };
  }

  res.json({ message: "Vous êtes connecté" });
});

io.engine.use(sessionMiddleware);
io.on("connection", (socket) => {
  const req = socket.request as Request;
  socket.use((__, next) => {
    req.session.reload((err) => {
      if (err) {
        socket.disconnect();
      } else {
        next();
      }
    });
  });

  socket.on("request room access", (params: z.infer<typeof types.socketRequestRoomAccess>) => {
    if (!req.session.user) {
      return socket.emit("info", { message: "Vous devez être connecté", needAuth: true });
    }
    const checkedParams = types.socketRequestRoomAccess.safeParse(params);

    if (!checkedParams.success) {
      return socket.emit("info", {
        message: "Impossible de rejoindre cette partie",
      });
    }

    const { id } = checkedParams.data;

    for (const room of socket.rooms) {
      if (room.startsWith("play-")) {
        return socket.emit("info", {
          message: "Vous ne pouvez pas rejoindre plusieurs parties depuis la même fenêtre",
        });
      }
    }

    const room = io.sockets.adapter.rooms.get(`play-${id}`);

    if (room && room.size >= Game.MAX_PLAYERS) {
      return socket.emit("info", {
        message: `Cette partie est pleine : ${Game.MAX_PLAYERS} joueurs maximum`,
      });
    }

    let game = games.find((game) => game.getId() === id);
    if (!game) {
      return socket.emit("info", {
        message: "Cette partie n'existe pas",
      });
    } else {
      for (const player of game.getPlayers()) {
        if (player.getName() === req.session.user.pseudo) {
          return socket.emit("info", {
            message: `Vous êtes déjà dans cette partie`,
          });
        }
      }
    }

    socket.data.name = req.session.user.pseudo;
    socket.join(`play-${game.getId()}`);
    game.addPlayer({ name: req.session.user.pseudo });
  });

  socket.on("add progress", (params: z.infer<typeof types.socketAddProgress>) => {
    const checkedParams = types.socketAddProgress.safeParse(params);

    if (!checkedParams.success) {
      return socket.emit("info", { message: "Les paramètres d'ajout de progrès du joueurs sont incorrects" });
    }

    const { gameId } = checkedParams.data;

    const game = games.find((game) => game.getId() === gameId);
    if (game && req.session.user) {
      game.addPlayerProgress({ increment: 0.5, playerPseudo: req.session.user.pseudo });
    }
  });

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        const temp = room.split("play-");
        if (temp.length !== 2) {
          return;
        }
        const gameIndex = games.findIndex((game) => game.getId() === temp[1]);
        if (gameIndex !== -1) {
          games[gameIndex].removePlayer({ name: socket.data.name });
          if (games[gameIndex].getPlayers().length === 0) {
            setTimeout(() => {
              if (games[gameIndex].getPlayers().length === 0) {
                games.splice(gameIndex, 1);
              }
            }, 5000);
          }
        }
      }
    }
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT} : http://localhost:${env.PORT}`);
});
