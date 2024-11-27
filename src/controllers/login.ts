import { Request, Response } from "express";
import { prisma } from "../database";
import { types } from "../types";
import bcrypt from "bcrypt";

export const loginController = async (req: Request, res: Response) => {
  if (req.session.user) {
    res.status(403).json({ message: "Vous êtes déjà connecté" });
    return;
  }

  const checkedBody = types.appLoginBody.safeParse(req.body);

  if (!checkedBody.success) {
    res.status(400).json({ message: "Requête invalide" });
    return;
  }

  const { pseudo, password } = checkedBody.data;

  const user = await prisma.players.findUnique({
    where: {
      pseudo,
    },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.players.create({
      data: {
        pseudo,
        password: hashedPassword,
      },
    });

    req.session.user = { id: newUser.id, pseudo: newUser.pseudo };
  } else {
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      res.status(401).json({ message: "Mot de passe incorrect" });
      return;
    }

    req.session.user = { id: user.id, pseudo: user.pseudo };
  }

  res.json({ message: "Vous êtes connecté" });
}