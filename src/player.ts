import { z } from "zod";
import { types } from "./types";

export class Player {
  private progress = 0;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  getProgress() {
    return this.progress;
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
}
