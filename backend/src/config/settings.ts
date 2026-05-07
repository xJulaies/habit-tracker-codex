import { config } from "dotenv";

config();

export const settings = {
  PORT: process.env.PORT,
  BASE_URL: process.env.BASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
