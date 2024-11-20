import { Server as SocketIoServer } from "socket.io";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { Player } from "./player";
import { types } from "./types";

export class Game {
  static MAX_PLAYERS = 4;
  private players: Player[] = [];
  private id: string;
  private winner: string | undefined;
  private running = false;
  private io: SocketIoServer;

  constructor(params: z.infer<typeof types.gameConstructorParams>) {
    this.id = uuid();
    const checkedParams = types.gameConstructorParams.safeParse(params);

    if (!checkedParams.success) {
      throw new Error(
        "Les paramètres de création de la partie sont invalides."
      );
    }

    const { players, io } = checkedParams.data;

    for (const player of players) {
      this.addPlayer({ name: player });
    }

    this.io = io;
  }

  isRunning() {
    return this.running;
  }

  getId() {
    return this.id;
  }

  getPlayers() {
    return this.players;
  }

  run() {}

  addPlayer(params: z.infer<typeof types.gameAddPlayer>) {
    const checkedParams = types.gameAddPlayer.safeParse(params);

    if (!checkedParams.success) {
      throw new Error("Les paramètres pour ajouter un joueur sont invalides.");
    }

    const { name } = checkedParams.data;

    this.players.push(new Player(name));
    this.sendPlayersUpdate();
  }

  addPlayerProgress(params: z.infer<typeof types.gameAddPlayerProgressParams>) {
    const checkedParams = types.gameAddPlayerProgressParams.safeParse(params);

    if (!checkedParams.success) {
      throw new Error(
        "Les paramètres pour augmenter la progression d'un joueur dans la partie sont invalides."
      );
    }

    const { playerIndex, increment } = checkedParams.data;

    if (playerIndex + 1 > this.players.length || playerIndex < 0) {
      throw new Error(
        "Le joueur auquel vous essayez d'augmenter la progression n'existe pas"
      );
    }

    this.players[playerIndex].addProgress({ increment });
    this.sendPlayersUpdate();
  }

  private sendPlayersUpdate() {
    this.io.to(`play-${this.id}`).emit(
      "players update",
      this.players.map((player) => ({
        name: player.getName(),
        progress: player.getProgress(),
      }))
    );
  }
}
