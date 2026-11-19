import { optimizePrompt } from "../services/prompt.service.js";

export async function optimize(req, res) {
  const data = await optimizePrompt(req.validatedBody, req.promptOwner);
  res.status(201).json({ success: true, data });
}
