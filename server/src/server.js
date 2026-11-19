import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

async function startServer() {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`PromtLab API listening on http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exitCode = 1;
});
