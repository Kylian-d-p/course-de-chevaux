import { Request, Response } from "express";
import { Game } from "../game";
import { games, io } from "..";

export const createRoomController = (req: Request, res: Response) => {
  const game = new Game({ players: [], io });
  games.push(game);

  res.json({ data: { gameId: game.getId() } });
}