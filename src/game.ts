import { z } from "zod";
import { Player } from "./player";
import { types } from "./types";

export class Game {
  private players: Player[];
  private winner: string | undefined;

  constructor(params: z.infer<typeof types.gameConstructorParams>) {
    const checkedParams = types.gameConstructorParams.safeParse(params);

    if (!checkedParams.success) {
      throw new Error(
        "Les paramètres de création de la partie sont invalides."
      );
    }

    const { players } = checkedParams.data;

    this.players = [
      new Player(players[0]),
      new Player(players[1]),
      new Player(players[2]),
      new Player(players[3]),
    ];
  }

  getGameStatus() {
    return this.players;
  }

  addPlayerProgress(params: z.infer<typeof types.gamePlayerProgressParams>) {
    const checkedParams = types.gamePlayerProgressParams.safeParse(params);

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
  }
}
