import { z } from "zod";

export const optimizePromptSchema = z.object({
  originalInput: z.string().trim().min(1).max(20_000),
  category: z.enum(["development", "writing", "design", "research", "business"])
    .optional()
    .default("development"),
  targetModel: z.string().trim().min(1).max(100).optional().default("gemini"),
  outputStyle: z.enum(["detailed", "concise", "structured"])
    .optional()
    .default("structured"),
  context: z.string().trim().max(10_000).optional(),
}).strict();
