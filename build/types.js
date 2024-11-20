"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
const zod_1 = require("zod");
exports.types = {
    env: zod_1.z.object({
        PORT: zod_1.z.string({ required_error: "La variable d'environnement PORT est requise", invalid_type_error: "La variable d'environnement PORT est requise" }).min(1).refine(str => !Number.isNaN(str), "La variable d'environnement PORT est requise")
    })
};
