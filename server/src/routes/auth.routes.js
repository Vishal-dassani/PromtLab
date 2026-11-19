import { Router } from "express";
import {
  login,
  logout,
  me,
  register,
} from "../controllers/auth.controller.js";
import {
  authenticate,
  requireAuthConfiguration,
} from "../middlewares/auth.middleware.js";
import { authRateLimit } from "../middlewares/authRateLimit.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  authRateLimit,
  requireAuthConfiguration,
  validateBody(registerSchema),
  register,
);
router.post(
  "/login",
  authRateLimit,
  requireAuthConfiguration,
  validateBody(loginSchema),
  login,
);
router.post("/logout", logout);
router.get(
  "/me",
  requireAuthConfiguration,
  authenticate,
  me,
);

export default router;
