import express from "express";
import helmet from "helmet";
import corsPackage from "cors";
import mongoose from "mongoose";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { apiRateLimit } from "./middlewares/rateLimit.middleware.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import promptRoutes from "./routes/prompt.routes.js";

const app = express();

app.use(helmet());
app.use(corsPackage(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api", apiRateLimit);

app.get("/api/v1/health", (req, res) => {
  const databaseStatus = !env.mongoUri
    ? "not_configured"
    : mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  res.json({
    success: true,
    data: {
      status: "ok",
      environment: env.nodeEnv,
      database: databaseStatus,
      aiProvider: "requesty",
      aiConfigured: Boolean(env.requestyApiKey),
    },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/prompts", promptRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
