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
  gameConstructorParams: z.object({ players: z.array(z.string()).length(4) }),
  gamePlayerProgressParams: z.object({
    playerIndex: z.number(),
    increment: z.number(),
  }),
  playerAddProgressParams: z.object({ increment: z.number() }),
};
