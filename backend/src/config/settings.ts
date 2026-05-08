import { config } from "dotenv";

config();

const defaultFrontendUrls = ["http://localhost:5173", "http://127.0.0.1:5173"];
const frontendUrls =
  process.env.FRONTEND_URL?.split(",")
    .map((url) => url.trim())
    .filter(Boolean) || defaultFrontendUrls;

export const settings = {
  PORT: process.env.PORT,
  MONGODB: process.env.MONGODB,
  BASE_URL: process.env.BASE_URL,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  FRONTEND_URLS: frontendUrls,
};

export const validateRuntimeSettings = (): void => {
  const missingSettings = [
    ["MONGODB", settings.MONGODB],
    ["CLERK_SECRET_KEY", settings.CLERK_SECRET_KEY],
  ].filter(([, value]) => !value);

  if (missingSettings.length > 0) {
    const missingNames = missingSettings.map(([name]) => name).join(", ");

    throw new Error(`Missing required backend env values: ${missingNames}`);
  }
};
