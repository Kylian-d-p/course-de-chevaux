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
  }),
  gameConstructorParams: z.object({
    players: z.array(z.string()),
    io: z.custom<SocketIoServer>(),
  }),
  gameAddPlayerProgressParams: z.object({
    playerIndex: z.number(),
    increment: z.number(),
  }),
  playerAddProgressParams: z.object({ increment: z.number() }),
  socketRequestRoomAccess: z.object({
    id: z.string(),
    playerPseudo: z.string().min(1).max(15),
  }),
  gameAddPlayer: z.object({ name: z.string() }),
};
