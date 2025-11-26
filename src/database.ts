import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client";

dotenv.config();

// Parse DATABASE_URL to extract connection details
const databaseUrl = process.env.DATABASE_URL || "mysql://courseuser:coursepassword@localhost:3306/course_de_chevaux";
const url = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // Remove leading slash
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
