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

io.of("/room").on("connection", (socket) => {
  socket.on(
    "request room access",
    (params: z.infer<typeof types.socketRequestRoomAccess>) => {
      const checkedParams = types.socketRequestRoomAccess.safeParse(params);

      if (!checkedParams.success) {
        return socket.emit("info", {
          message: "Impossible de rejoindre cette partie",
        });
      }

      const { id, playerPseudo } = checkedParams.data;
      // if (Array(socket.rooms).find()) { VERIFIER QUE LE JOUEUR N'AI REJOINT QU'UNE PARTIE
      //   return socket.emit("info", {
      //     message: "Vous ne pouvez pas rejoindre plusieurs parties"
      //   })
      // }

      const room = io.sockets.adapter.rooms.get(`play-${id}`);

      if (room && room.size < Game.MAX_PLAYERS) {
        return socket.emit("info", {
          message: `Cette partie est pleine : ${Game.MAX_PLAYERS} joueurs maximum`,
        });
      }

      let game = games.find((game) => game.getId() === id);
      if (!game) {
        games.push(new Game({ players: [], io }));
        game = games[games.length - 1];
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
      socket.join(`play-${id}`);
      game.addPlayer({ name: playerPseudo });
    }
  );

  socket.on("disconnecting", () => {
    console.log("disc");
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        console.log(socket.data.name);
        // games.find(game => game.getId() === room)?.removePlayer(socket)
      }
    }
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
