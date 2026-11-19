import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAuthToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "7d",
    issuer: env.jwtIssuer,
  });
}
