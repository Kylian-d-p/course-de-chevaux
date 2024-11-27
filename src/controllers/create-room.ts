import { Request, Response } from "express";
import { Game } from "../game";
import { games, io } from "..";

export const createRoomController = (req: Request, res: Response) => {
  if (!req.session.user) {
    res.status(401).json({ message: "Vous devez être connecté pour lancer une partie" });
    return;
  }
  const game = new Game({ players: [], io });
  games.push(game);

  res.json({ data: { gameId: game.getId() } });
}