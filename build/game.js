"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const player_1 = require("./player");
const types_1 = require("./types");
class Game {
    constructor(params) {
        const checkedParams = types_1.types.gameConstructorParams.safeParse(params);
        if (!checkedParams.success) {
            throw new Error("Les paramètres de création de la partie sont invalides.");
        }
        const { players } = checkedParams.data;
        this.players = [
            new player_1.Player(players[0]),
            new player_1.Player(players[1]),
            new player_1.Player(players[2]),
            new player_1.Player(players[3]),
        ];
    }
    getGameStatus() {
        return this.players;
    }
    addPlayerProgress(params) {
        const checkedParams = types_1.types.gamePlayerProgressParams.safeParse(params);
        if (!checkedParams.success) {
            throw new Error("Les paramètres pour augmenter la progression d'un joueur dans la partie sont invalides.");
        }
        const { playerIndex, increment } = checkedParams.data;
        if (playerIndex + 1 > this.players.length || playerIndex < 0) {
            throw new Error("Le joueur auquel vous essayez d'augmenter la progression n'existe pas");
        }
        this.players[playerIndex].addProgress({ increment });
    }
}
exports.Game = Game;
