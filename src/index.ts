import dotenv from "dotenv";
import express, { Request } from "express";
import session from "express-session";
import http from "http";
import { Server as SocketIoServer } from "socket.io";
import { z } from "zod";
import { createRoomController } from "./controllers/create-room";
import { leaderboardController } from "./controllers/leaderboard";
import { loginController } from "./controllers/login";
import { logoutController } from "./controllers/logout";
import { runRoomController } from "./controllers/run-room";
import { userController } from "./controllers/user";
import { Game } from "./game";
import { authMiddleware } from "./middlewares/auth";
import { Player } from "./player";
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
export const io = new SocketIoServer(httpServer);
const sessionMiddleware = session({
  secret: env.SESSION_SECRET,
  name: "course-de-chevaux.SID",
  resave: true,
  saveUninitialized: true,
});

export const games: Game[] = [];

app.use(express.json());
app.set("trust proxy", 1);
app.use(sessionMiddleware);
app.use("/", express.static("static"));

app.get("/api/leaderboard", leaderboardController);
app.post("/api/room/create", authMiddleware, createRoomController);
app.post("/api/room/run", authMiddleware, runRoomController);
app.post("/api/auth/login", loginController);
app.get("/api/auth/user", authMiddleware, userController);
app.post("/api/auth/logout", logoutController);

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

  socket.on("request room play access", (params: z.infer<typeof types.socketRequestRoomAccess>) => {
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
        if (player.getPseudo() === req.session.user.pseudo) {
          return socket.emit("info", {
            message: `Vous êtes déjà dans cette partie`,
          });
        }
      }
    }

    socket.join(`play-${game.getId()}`);
    game.addPlayer({ id: req.session.user.id });
  });

  socket.on("request room spectate access", (params: z.infer<typeof types.socketRequestRoomAccess>) => {
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

    let game = games.find((game) => game.getId() === id);
    if (!game) {
      return socket.emit("info", {
        message: "Cette partie n'existe pas",
      });
    } else {
      for (const player of game.getPlayers()) {
        if (player.getId() === req.session.user.id) {
          return socket.emit("info", {
            message: "Vous ne pouvez pas rejoindre une partie en tant que spectateur si vous êtes joueur de cette même partie",
          });
        }
      }
    }

    socket.join(`spectate-${game.getId()}`);
    game.sendPlayersUpdate();
    game.sendJackpot();
    Player.sendCoins(req.session.user.id, socket);
  });

  socket.on("add progress", async (params: z.infer<typeof types.socketAddProgress>) => {
    const checkedParams = types.socketAddProgress.safeParse(params);

    if (!checkedParams.success) {
      return socket.emit("info", { message: "Les paramètres d'ajout de progrès du joueurs sont incorrects" });
    }

    const { gameId } = checkedParams.data;

    const game = games.find((game) => game.getId() === gameId);
    if (game && req.session.user) {
      await game.addPlayerProgress({ increment: 0.5, playerId: req.session.user.id });
    }
  });

  socket.on("bet coins", async (params: z.infer<typeof types.socketBetCoins>) => {
    const checkedParams = types.socketBetCoins.safeParse(params);

    if (!checkedParams.success) {
      return socket.emit("info", { message: "Les paramètres de pari de pièces sont incorrects" });
    }

    const { gameId, amount, playerId } = checkedParams.data;

    const game = games.find((game) => game.getId() === gameId);
    if (game && req.session.user) {
      if (!(await game.betCoins(req.session.user.id, playerId, amount))) {
        socket.emit("info", { message: "Impossible de parier sur ce joueur" });
        return;
      }
      Player.sendCoins(req.session.user.id, socket);
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
          if (!req.session.user) return;
          games[gameIndex].removePlayer({ id: req.session.user.id });
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
