"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const types_1 = require("./types");
dotenv_1.default.config();
const app = (0, express_1.default)();
const checkedEnv = types_1.types.env.safeParse(process.env);
if (!checkedEnv.success) {
    throw new Error(checkedEnv.error.errors.join(", "));
}
console.log("cc");
