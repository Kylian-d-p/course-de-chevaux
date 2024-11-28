import { Request, Response } from "express";
import { games } from "..";
import { types } from "../types";

export const runRoomController = (req: Request, res: Response) => {
  const checkedBody = types.appRunBody.safeParse(req.body);

  if (!checkedBody.success) {
    res.status(400).json({ message: "Requête invalide" });
    return;
  }

  const { gameId } = checkedBody.data;

  const game = games.find((game) => game.getId() === gameId);

  if (!game) {
    res.status(404).json({ message: "Partie introuvable" });
    return;
  }

  const player = game.getPlayers().find((player) => player.getId() === req.session.user!.id);

  if (!player) {
    res.status(403).json({ message: "Vous ne participez pas à cette partie" });
    return;
  }

  game.run();

  res.json({ message: "Partie lancée" });
};
