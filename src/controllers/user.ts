import { Request, Response } from "express";

export const userController = async (req: Request, res: Response) => {
  res.json({ user: req.session.user });
};
