import { z } from "zod";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { AIProvider } from "./aiProvider.interface.js";

const questionSchema = z.object({
  question: z.string().trim().min(1),
  reason: z.string().trim().min(1),
}).strict();

export const optimizationResultSchema = z.object({
  status: z.enum(["needs_clarification", "ready"]),
  optimizedPrompt: z.string().trim().min(1),
  clarificationQuestions: z.array(questionSchema).max(3),
  assumptions: z.array(z.string().trim()),
  improvements: z.array(z.string().trim()),
}).strict().superRefine((result, context) => {
  if (result.status === "ready" && result.clarificationQuestions.length > 0) {
    context.addIssue({
      code: "custom",
      message: "Ready prompts cannot contain clarification questions",
      path: ["clarificationQuestions"],
    });
  }
  if (result.status === "needs_clarification" && result.clarificationQuestions.length === 0) {
    context.addIssue({
      code: "custom",
      message: "Prompts needing clarification must include at least one question",
      path: ["clarificationQuestions"],
    });
  }
});

const responseJsonSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["needs_clarification", "ready"] },
    optimizedPrompt: { type: "string" },
    clarificationQuestions: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          reason: { type: "string" },
        },
        required: ["question", "reason"],
        additionalProperties: false,
      },
    },
    assumptions: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
  },
  required: [
    "status",
    "optimizedPrompt",
    "clarificationQuestions",
    "assumptions",
    "improvements",
  ],
  additionalProperties: false,
};

const systemPrompt = `You are PromtLap, an expert prompt-optimization assistant. Improve the user's instructions; never execute the task they describe.
Preserve the user's objective and every explicit requirement. Do not invent requirements or present assumptions as confirmed facts.
Create a clear, useful prompt in the requested output style and for the requested target model family.
Ask zero to three concise clarification questions, only for important missing decisions. If clarification is unnecessary, return status "ready" and an empty question list. If you ask questions, return status "needs_clarification".
Return only JSON matching the provided response schema.`;

function providerError(status) {
  if (status === 401 || status === 403) {
    return new ApiError(503, "AI_PROVIDER_UNAVAILABLE", "Requesty rejected the configured API credentials");
  }
  if (status === 429) {
    return new ApiError(429, "RATE_LIMITED", "Requesty rate limit reached. Try again later.");
  }
  if (status === 402) {
    return new ApiError(503, "AI_PROVIDER_UNAVAILABLE", "Requesty account quota or billing does not allow this request");
  }
  return new ApiError(502, "AI_PROVIDER_ERROR", "Requesty could not complete the optimization request");
}

export class RequestyProvider extends AIProvider {
  constructor() {
    super();
    this.name = "requesty";
  }

  async optimizePrompt(input) {
    if (!env.requestyApiKey) {
      throw new ApiError(503, "AI_PROVIDER_UNAVAILABLE", "REQUESTY_API_KEY is not configured");
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response;
      try {
        response = await fetch(`${env.requestyBaseUrl.replace(/\/+$/, "")}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.requestyApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": env.clientUrl,
            "X-Title": "PromtLap",
          },
          signal: AbortSignal.timeout(env.requestyTimeoutMs),
          body: JSON.stringify({
            model: env.requestyModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: JSON.stringify(input) },
            ],
            temperature: 0.2,
            max_tokens: env.requestyMaxOutputTokens,
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "prompt_optimization",
                strict: true,
                schema: responseJsonSchema,
              },
            },
          }),
        });
      } catch (error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
          throw new ApiError(504, "AI_PROVIDER_TIMEOUT", "Requesty did not respond before the timeout");
        }
        throw new ApiError(503, "AI_PROVIDER_UNAVAILABLE", "Could not connect to Requesty");
      }

      if (!response.ok) {
        throw providerError(response.status);
      }

      let payload;
      try {
        payload = await response.json();
      } catch {
        if (attempt === 1) {
          throw new ApiError(502, "AI_PROVIDER_ERROR", "Requesty returned an invalid response");
        }
        continue;
      }

      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        if (attempt === 1) {
          throw new ApiError(502, "AI_PROVIDER_ERROR", "Requesty returned an empty optimization response");
        }
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        if (attempt === 1) {
          throw new ApiError(502, "AI_PROVIDER_ERROR", "Requesty returned malformed optimization JSON");
        }
        continue;
      }

      const validated = optimizationResultSchema.safeParse(parsed);
      if (!validated.success) {
        if (attempt === 1) {
          throw new ApiError(
            502,
            "AI_PROVIDER_ERROR",
            "Requesty returned an optimization that did not match the required response contract",
            validated.error.issues.map(({ path, message }) => ({ path, message })),
          );
        }
        continue;
      }

      const result = validated.data;
      return {
        ...result,
        clarificationQuestions: result.clarificationQuestions.map((question, index) => ({
          id: `q${index + 1}`,
          ...question,
        })),
        provider: this.name,
        model: payload.model || env.requestyModel,
        usage: {
          inputTokens: payload.usage?.prompt_tokens || 0,
          outputTokens: payload.usage?.completion_tokens || 0,
        },
      };
    }
  }
}
