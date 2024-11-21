import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server as SocketIoServer } from "socket.io";
import { z } from "zod";
import { Game } from "./game";
import { types } from "./types";

dotenv.config();

const checkedEnv = types.env.safeParse(process.env);

if (!checkedEnv.success) {
  throw new Error(checkedEnv.error.errors.map((err) => err.message).join(", "));
}

const env = checkedEnv.data;

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIoServer(httpServer);

const games: Game[] = [];

app.use("/", express.static("static"));
app.post("/api/room/create", (_, res) => {
  const game = new Game({ players: [], io });
  games.push(game);

  res.json({ data: { gameId: game.getId() } });
});

io.on("connection", (socket) => {
  socket.on("request room access", (params: z.infer<typeof types.socketRequestRoomAccess>) => {
    const checkedParams = types.socketRequestRoomAccess.safeParse(params);

    if (!checkedParams.success) {
      return socket.emit("info", {
        message: "Impossible de rejoindre cette partie",
      });
    }

    const { id, playerPseudo } = checkedParams.data;

    for (const room of socket.rooms) {
      if (room.startsWith("play-")) {
        return socket.emit("info", {
          message: "Vous ne pouvez pas rejoindre plusieurs parties",
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
        if (player.getName() === playerPseudo) {
          return socket.emit("info", {
            message: `Cette partie a déjà un joueur avec le pseudo ${playerPseudo}`,
          });
        }
      }
    }

    socket.data.name = playerPseudo;
    socket.join(`play-${game.getId()}`);
    game.addPlayer({ name: playerPseudo });
  });

  socket.emit("player progress", (params: z.infer<typeof types.socketAddProgress>) => {
    const checkedParams = types.socketAddProgress.safeParse(params);

    if (!checkedParams.success) {
      return socket.emit("info", { message: "Les paramètres d'ajout de progrès du joueurs sont incorrects" });
    }

    const { playerPseudo, gameId } = checkedParams.data;

    games.find(game => game.getId() === gameId)?.addPlayerProgress({increment: 4, name: playerPseudo})
  });

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        const temp = room.split("play-");
        if (temp.length !== 2) {
          return;
        }
        const gameId = temp[1];
        const gameIndex = games.findIndex((game) => game.getId() === gameId);
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
  console.log(`Server listening on port ${env.PORT}`);
});
