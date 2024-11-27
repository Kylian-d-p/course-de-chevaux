import { Request, Response } from "express";
import { prisma } from "../database";

export const leaderboardController = async (req: Request, res: Response) => {
  const leaderboard = await prisma.players.findMany({
    where: {
      bestTime: {
        not: null,
      },
    },
    take: 15,
    orderBy: {
      bestTime: "asc",
    },
  });
  res.json({ leaderboard: leaderboard.map((player) => ({ name: player.pseudo, time: player.bestTime })) });
  return;
};
