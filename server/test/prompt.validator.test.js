import test from "node:test";
import assert from "node:assert/strict";
import { optimizePromptSchema } from "../src/validators/prompt.validator.js";

test("optimization input applies defaults and trims user input", () => {
  const result = optimizePromptSchema.parse({ originalInput: "  Build an app  " });

  assert.equal(result.originalInput, "Build an app");
  assert.equal(result.category, "development");
  assert.equal(result.targetModel, "gemini");
  assert.equal(result.outputStyle, "structured");
});

test("optimization input rejects empty input and unknown fields", () => {
  assert.equal(optimizePromptSchema.safeParse({ originalInput: " " }).success, false);
  assert.equal(optimizePromptSchema.safeParse({
    originalInput: "Build an app",
    ownerId: "untrusted",
  }).success, false);
});
