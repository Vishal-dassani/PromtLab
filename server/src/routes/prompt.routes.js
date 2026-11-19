import { Router } from "express";
import { optimize } from "../controllers/prompt.controller.js";
import { identifyPromptOwner, requirePromptConfiguration } from "../middlewares/prompt.middleware.js";
import { optimizeRateLimit } from "../middlewares/optimizeRateLimit.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { optimizePromptSchema } from "../validators/prompt.validator.js";

const router = Router();

router.post(
  "/optimize",
  optimizeRateLimit,
  validateBody(optimizePromptSchema),
  requirePromptConfiguration,
  identifyPromptOwner,
  optimize,
);

export default router;
