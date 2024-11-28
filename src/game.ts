import dayjs from "dayjs";
import { Server as SocketIoServer } from "socket.io";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { prisma } from "./database";
import { Player } from "./player";
import { types } from "./types";

export class Game {
  static MAX_PLAYERS = 4;
  private players: Player[] = [];
  private id: string;
  private status: "running" | "preparing" | "stopped" = "stopped";
  private readyForNext = true;
  private io: SocketIoServer;
  private startTime = new Date();
  private bets: {playerId: string, bettors: {bettorId: string, amount: number}[]}[] = [];

  constructor(params: z.infer<typeof types.gameConstructorParams>) {
    this.id = uuid();
    const checkedParams = types.gameConstructorParams.safeParse(params);

    if (!checkedParams.success) {
      throw new Error("Les paramètres de création de la partie sont invalides.");
    }

    const { players, io } = checkedParams.data;

    for (const player of players) {
      this.addPlayer({ id: player });
    }

    this.io = io;
  }

  getId() {
    return this.id;
  }

  getPlayers() {
    return this.players;
  }

  betCoins(bettorId: string, playerId: string, amount: number) {
    // let betIndex = this.bets.findIndex(bet => bet.playerId === playerId)
    // if (!bet) {
    //   bet = 
    // }
  }

  run() {
    if (this.status === "stopped" && this.readyForNext == true) {
      this.changeStatus("preparing");
      this.players.forEach((player) => {
        player.resetProgress();
      });
      this.sendPlayersUpdate();

      this.io.to(`play-${this.id}`).emit("game status", { status: "preparing" });

      setTimeout(() => {
        this.changeStatus("running");
        this.startTime = new Date();
        this.io.to(`play-${this.id}`).emit("game status", { status: "running" });
      }, 3000);
    }
  }

  async addPlayer(params: z.infer<typeof types.gameAddPlayer>) {
    const checkedParams = types.gameAddPlayer.safeParse(params);

    if (!checkedParams.success) {
      throw new Error("Les paramètres pour ajouter un joueur sont invalides.");
    }

    const { id } = checkedParams.data;

    const dbPlayer = await prisma.players.findUnique({
      where: {
        id
      }
    })

    if (!dbPlayer) {
      return false
    }

    this.players.push(new Player(dbPlayer.pseudo, dbPlayer.id));
    this.sendPlayersUpdate();
    this.sendStatus();
    return true
  }

  async addPlayerProgress(params: z.infer<typeof types.gameAddPlayerProgressParams>) {
    const checkedParams = types.gameAddPlayerProgressParams.safeParse(params);

    if (!checkedParams.success) {
      throw new Error("Les paramètres pour augmenter la progression d'un joueur dans la partie sont invalides.");
    }

    if (this.status === "running") {
      const { playerId, increment } = checkedParams.data;

      const player = this.players.find((player) => player.getId() === playerId);

      if (player) {
        player.addProgress({ increment });
        this.sendPlayersUpdate();

        if (player.getProgress() >= 100) {
          const currentTime = dayjs().diff(this.startTime);
          this.changeStatus("stopped");
          this.io.to(`play-${this.id}`).emit("game status", { status: "stopped" });

          const dbPlayer = await prisma.players.findUnique({
            where: {
              id: player.getId(),
            },
          });

          if (dbPlayer && (typeof dbPlayer.bestTime !== "number" || currentTime < dbPlayer.bestTime)) {
            await prisma.players.update({
              where: {
                id: player.getId()
              },
              data: {
                bestTime: currentTime,
              },
            });
          }
        }
      }
    }
  }

  removePlayer(params: z.infer<typeof types.gameRemovePlayer>) {
    const checkedParams = types.gameRemovePlayer.safeParse(params);

    if (!checkedParams.success) {
      throw new Error("Les paramètres pour supprimer un joueur sont invalides.");
    }

    const { id } = checkedParams.data;

    const playerIndex = this.players.findIndex((player) => player.getId() === id);

    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);
    }

    this.sendPlayersUpdate();
  }

  private sendPlayersUpdate() {
    this.io.to(`play-${this.id}`).emit(
      "players update",
      this.players.map((player) => ({
        pseudo: player.getPseudo(),
        progress: player.getProgress(),
        id: player.getId()
      }))
    );
  }

  private changeStatus(newStatus: typeof this.status) {
    this.status = newStatus;
    this.sendStatus();
    if (newStatus === "stopped") {
      this.readyForNext = false;
      setTimeout(() => {
        this.readyForNext = true;
      }, 3000);
    }
  }

  private sendStatus() {
    this.io.to(`play-${this.id}`).emit("game status", { status: this.status });
  }
}
