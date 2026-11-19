import { env } from "./env.js";

export const corsOptions = {
  origin: env.clientUrl,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
