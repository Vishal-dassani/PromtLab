import Prompt from "../models/prompt.model.js";
import PromptVersion from "../models/promptVersion.model.js";
import { RequestyProvider } from "../providers/requesty.provider.js";
import { ApiError } from "../utils/ApiError.js";

const aiProvider = new RequestyProvider();

function createTitle(originalInput) {
  const title = originalInput.replace(/\s+/g, " ").trim();
  return title.length > 60 ? `${title.slice(0, 57).trimEnd()}...` : title;
}

function createPromptResponse(prompt, version) {
  return {
    promptId: String(prompt._id),
    version: {
      id: String(version._id),
      versionNumber: version.versionNumber,
      status: version.clarificationQuestions.length > 0 ? "needs_clarification" : "ready",
      optimizedPrompt: version.optimizedPrompt,
      clarificationQuestions: version.clarificationQuestions,
      assumptions: version.assumptions,
      improvements: version.improvements,
      action: version.action,
      createdAt: version.createdAt,
    },
    title: prompt.title,
    owner: prompt.userId ? "authenticated" : "guest",
  };
}

export async function optimizePrompt(input, owner) {
  await Prompt.init();

  let prompt;
  try {
    prompt = await Prompt.create({
      userId: owner.userId,
      guestSessionHash: owner.guestSessionHash,
      title: createTitle(input.originalInput),
      originalInput: input.originalInput,
      context: input.context || "",
      category: input.category,
      targetModel: input.targetModel,
      outputStyle: input.outputStyle,
    });
  } catch (error) {
    if (error.code === 11000 && owner.guestSessionHash) {
      throw new ApiError(
        429,
        "GUEST_LIMIT_REACHED",
        "Guest users can optimize one prompt. Sign in to create more.",
      );
    }
    throw error;
  }

  try {
    const result = await aiProvider.optimizePrompt({
      originalInput: input.originalInput,
      context: input.context,
      category: input.category,
      targetModel: input.targetModel,
      outputStyle: input.outputStyle,
    });

    const version = await PromptVersion.create({
      promptId: prompt._id,
      versionNumber: 1,
      optimizedPrompt: result.optimizedPrompt,
      clarificationQuestions: result.clarificationQuestions,
      assumptions: result.assumptions,
      improvements: result.improvements,
      action: "initial",
      createdBy: owner.userId,
      provider: result.provider,
      model: result.model,
    });

    prompt.currentVersionId = version._id;
    await prompt.save();

    return createPromptResponse(prompt, version);
  } catch (error) {
    try {
      await PromptVersion.deleteMany({ promptId: prompt._id });
      await prompt.deleteOne();
    } catch (cleanupError) {
      console.error("Failed to clean up an incomplete prompt optimization", cleanupError);
    }
    throw error;
  }
}
