import mongoose from "mongoose";
import { settings } from "./settings";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(settings.MONGODB as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
