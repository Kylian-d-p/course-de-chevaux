"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const types_1 = require("./types");
class Player {
    constructor(name) {
        this.progress = 0;
        this.name = name;
    }
    getName() {
        return this.name;
    }
    getProgress() {
        return this.progress;
    }
    addProgress(params) {
        const checkedParams = types_1.types.playerAddProgressParams.safeParse(params);
        if (!checkedParams.success) {
            throw new Error("Les paramètres d'ajout du progrès d'un joueur sont invalides");
        }
        const { increment } = checkedParams.data;
        this.progress += increment;
    }
}
exports.Player = Player;
