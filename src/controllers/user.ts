import { Request, Response } from "express";

export const userController = async (req: Request, res: Response) => {
  if (!req.session.user) {
    res.status(401).json({ message: "Vous n'êtes pas connecté" });
    return;
  }

  res.json({ user: req.session.user });
}