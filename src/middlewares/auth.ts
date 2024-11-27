import { NextFunction, Request, Response } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    res.status(401).json({ message: "Vous n'êtes pas connecté" });
    return;
  }
  next();
};
