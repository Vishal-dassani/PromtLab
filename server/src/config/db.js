import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI is not configured; database-backed routes are unavailable");
    return false;
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
  return true;
}
