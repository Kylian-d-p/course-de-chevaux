import { Request, Response } from "express";

export const logoutController = (req: Request, res: Response) => {
  req.session.destroy(() => {})
}