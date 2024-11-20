"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
const zod_1 = require("zod");
exports.types = {
    env: zod_1.z.object({
        PORT: zod_1.z
            .string({
            required_error: "La variable d'environnement PORT est requise",
            invalid_type_error: "La variable d'environnement PORT est requise",
        })
            .min(1)
            .refine((str) => !Number.isNaN(Number(str)), {
            message: "La variable d'environnement PORT doit être un nombre",
        }),
    }),
    gameConstructorParams: zod_1.z.object({ players: zod_1.z.array(zod_1.z.string()).length(4) }),
    gamePlayerProgressParams: zod_1.z.object({
        playerIndex: zod_1.z.number(),
        increment: zod_1.z.number(),
    }),
    playerAddProgressParams: zod_1.z.object({ increment: zod_1.z.number() }),
};
