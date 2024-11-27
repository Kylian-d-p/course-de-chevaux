import { Server as SocketIoServer } from "socket.io";
import { z } from "zod";

export const types = {
  env: z.object({
    PORT: z
      .string({
        required_error: "La variable d'environnement PORT est requise",
        invalid_type_error: "La variable d'environnement PORT est requise",
      })
      .min(1)
      .refine((str) => !Number.isNaN(Number(str)), {
        message: "La variable d'environnement PORT doit être un nombre",
      }),
    SESSION_SECRET: z.string({
      required_error: "La variable d'environnement SESSION_SECRET est requise",
      invalid_type_error: "La variable d'environnement SESSION_SECRET est requise",
    }),
    DATABASE_URL: z.string({
      required_error: "La variable d'environnement DATABASE_URL est requise",
      invalid_type_error: "La variable d'environnement DATABASE_URL est requise",
    }),
  }),
  gameConstructorParams: z.object({
    players: z.array(z.string()),
    io: z.custom<SocketIoServer>(),
  }),
  gameAddPlayerProgressParams: z.object({
    playerPseudo: z.string(),
    increment: z.number(),
  }),
  playerAddProgressParams: z.object({ increment: z.number() }),
  socketRequestRoomAccess: z.object({
    id: z.string(),
  }),
  socketAddProgress: z.object({
    gameId: z.string(),
  }),
  socketBetCoins: z.object({
    gameId: z.string(),
    amount: z.number(),
  }),
  gameAddPlayer: z.object({ name: z.string() }),
  gameRemovePlayer: z.object({ name: z.string() }),
  appLoginBody: z.object({ pseudo: z.string(), password: z.string() }),
  appRunBody: z.object({
    gameId: z.string(),
  }),
};
