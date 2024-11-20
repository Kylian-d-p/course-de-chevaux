import dotenv from "dotenv";
import express from "express";
import { types } from "./types";

dotenv.config();
const app = express();

const checkedEnv = types.env.safeParse(process.env);

if (!checkedEnv.success) {
  throw new Error(checkedEnv.error.errors.map((err) => err.message).join(", "));
}

const env = checkedEnv.data;
