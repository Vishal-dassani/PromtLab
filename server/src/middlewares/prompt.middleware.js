import { createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const GUEST_COOKIE = "promtlab_guest";

export function requirePromptConfiguration(req, res, next) {
  if (!env.requestyApiKey) {
    return next(new ApiError(503, "AI_PROVIDER_UNAVAILABLE", "REQUESTY_API_KEY is not configured"));
  }
  if (mongoose.connection.readyState !== 1) {
    return next(new ApiError(503, "DATABASE_UNAVAILABLE", "Database is not connected"));
  }
  next();
}

export function identifyPromptOwner(req, res, next) {
  const authToken = req.cookies?.auth;

  if (authToken) {
    if (Buffer.byteLength(env.jwtSecret, "utf8") < 32) {
      return next(new ApiError(503, "AUTH_UNAVAILABLE", "Authentication is not configured"));
    }

    try {
      const payload = jwt.verify(authToken, env.jwtSecret, {
        algorithms: ["HS256"],
        issuer: env.jwtIssuer,
      });
      if (typeof payload.sub !== "string" || !mongoose.isValidObjectId(payload.sub)) {
        throw new Error("Invalid token subject");
      }
      req.promptOwner = { userId: payload.sub, guestSessionHash: null };
      return next();
    } catch {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication session is invalid or expired"));
    }
  }

  let guestSession = req.cookies?.[GUEST_COOKIE];
  if (!guestSession || !/^[A-Za-z0-9_-]{40,}$/.test(guestSession)) {
    guestSession = randomBytes(32).toString("base64url");
    res.cookie(GUEST_COOKIE, guestSession, {
      httpOnly: true,
      secure: env.nodeEnv === "production" || env.cookieSameSite === "none",
      sameSite: env.cookieSameSite,
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  req.promptOwner = {
    userId: null,
    guestSessionHash: createHash("sha256").update(guestSession).digest("hex"),
  };
  next();
}
