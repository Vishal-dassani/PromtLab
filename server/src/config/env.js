import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "",
  requestyApiKey: process.env.REQUESTY_API_KEY || "",
  requestyBaseUrl: process.env.REQUESTY_BASE_URL || "https://router.requesty.ai/v1",
  requestyModel: process.env.REQUESTY_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b",
  requestyTimeoutMs: Number(process.env.REQUESTY_TIMEOUT_MS || 30000),
  requestyMaxOutputTokens: Number(process.env.REQUESTY_MAX_OUTPUT_TOKENS || 4096),
  jwtSecret: process.env.JWT_SECRET || "",
  jwtIssuer: "promtlab-api",
  cookieSameSite: process.env.COOKIE_SAME_SITE || "lax",
};
