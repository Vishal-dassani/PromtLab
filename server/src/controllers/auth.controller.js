import {
  authenticateUser,
  getUserById,
  registerUser,
} from "../services/auth.service.js";
import {
  clearAuthCookie,
  getAuthCookieOptions,
} from "../middlewares/auth.middleware.js";
import { generateAuthToken } from "../utils/generateToken.js";

export async function register(req, res) {
  const user = await registerUser(req.validatedBody);
  res.cookie("auth", generateAuthToken(user.id), getAuthCookieOptions());
  res.status(201).json({ success: true, data: user });
}

export async function login(req, res) {
  const { user, userId } = await authenticateUser(req.validatedBody);
  res.cookie("auth", generateAuthToken(userId), getAuthCookieOptions());
  res.json({ success: true, data: user });
}

export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ success: true, data: { loggedOut: true } });
}

export async function me(req, res) {
  const user = await getUserById(req.auth.userId);
  res.json({ success: true, data: user });
}
