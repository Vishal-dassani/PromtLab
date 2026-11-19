import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function requireAuthConfiguration(req, res, next) {
  if (Buffer.byteLength(env.jwtSecret, "utf8") < 32) {
    return next(new ApiError(
      503,
      "AUTH_UNAVAILABLE",
      "Authentication is not configured. Set JWT_SECRET to at least 32 characters.",
    ));
  }

  if (mongoose.connection.readyState !== 1) {
    return next(new ApiError(503, "DATABASE_UNAVAILABLE", "Database is not connected"));
  }

  next();
}

export function authenticate(req, res, next) {
  const token = req.cookies?.auth;
  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
      issuer: env.jwtIssuer,
    });

    if (typeof payload.sub !== "string" || !mongoose.isValidObjectId(payload.sub)) {
      throw new Error("Invalid token subject");
    }

    req.auth = { userId: payload.sub };
    next();
  } catch {
    res.clearCookie("auth", getAuthCookieOptions());
    next(new ApiError(401, "UNAUTHORIZED", "Authentication session is invalid or expired"));
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production" || env.cookieSameSite === "none",
    sameSite: env.cookieSameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function clearAuthCookie(res) {
  const { maxAge, ...options } = getAuthCookieOptions();
  res.clearCookie("auth", options);
}
