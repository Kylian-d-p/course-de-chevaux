import { z } from "zod";
import { prisma } from "./database";
import { types } from "./types";
import { Socket } from "socket.io";

export class Player {
  private progress = 0;
  private pseudo: string;
  private id: string;
  private bets: { bettorId: string; amount: number }[];

  constructor(pseudo: string, id: string) {
    this.pseudo = pseudo;
    this.id = id;
    this.bets = [];
  }

  getId() {
    return this.id;
  }

  getPseudo() {
    return this.pseudo;
  }

  getProgress() {
    return this.progress;
  }

  getBets() {
    return this.bets;
  }

  async bet(bettorId: string, amount: number) {
    const betIndex = this.bets.findIndex((bet) => bet.bettorId === bettorId);
    if (betIndex < 0) {
      this.bets.push({ bettorId, amount });
      return;
    }
    const playerUpdate = await prisma.players.update({
      where: {
        id: bettorId,
      },
      data: {
        coins: {
          decrement: amount,
        },
      },
    });

    if (playerUpdate) {
      this.bets[betIndex] = { bettorId, amount: this.bets[betIndex].amount + amount };
    }
  }

  addProgress(params: z.infer<typeof types.playerAddProgressParams>) {
    const checkedParams = types.playerAddProgressParams.safeParse(params);

    if (!checkedParams.success) {
      throw new Error("Les paramètres d'ajout du progrès d'un joueur sont invalides");
    }

    const { increment } = checkedParams.data;

    this.progress += increment;
  }

  resetProgress() {
    this.progress = 0;
  }

  static async sendCoins(playerId: string, socket: Socket) {
    const player = await prisma.players.findUnique({
      where: {
        id: playerId
      }
    })
    if (player) {
      socket.emit("my coins", player.coins)
    }
  }
}
