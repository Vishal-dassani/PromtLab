import test from "node:test";
import assert from "node:assert/strict";
import { env } from "../src/config/env.js";
import { RequestyProvider } from "../src/providers/requesty.provider.js";

const requestInput = {
  originalInput: "Write a short prompt for a rain haiku",
  category: "writing",
  targetModel: "gemini",
  outputStyle: "concise",
};

function providerResponse(content, options = {}) {
  return new Response(JSON.stringify({
    model: "nvidia/nemotron-3.5-lightning-30b-a3b",
    choices: [{ message: { content } }],
    usage: { prompt_tokens: 23, completion_tokens: 31 },
  }), { status: 200, ...options });
}

function validResult() {
  return JSON.stringify({
    status: "needs_clarification",
    optimizedPrompt: "Write a concise haiku about rain.",
    clarificationQuestions: [{
      question: "Should it evoke a particular mood?",
      reason: "Mood guides the imagery and word choice.",
    }],
    assumptions: [],
    improvements: ["Clarified the requested output as a haiku."],
  });
}

test("Requesty provider requests schema-constrained JSON and maps its result", async (t) => {
  const previousKey = env.requestyApiKey;
  const previousFetch = globalThis.fetch;
  env.requestyApiKey = "test-key-not-a-credential";
  let requestUrl;
  let requestOptions;
  globalThis.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return providerResponse(validResult());
  };
  t.after(() => {
    env.requestyApiKey = previousKey;
    globalThis.fetch = previousFetch;
  });

  const result = await new RequestyProvider().optimizePrompt(requestInput);
  const body = JSON.parse(requestOptions.body);

  assert.equal(requestUrl, `${env.requestyBaseUrl}/chat/completions`);
  assert.equal(body.model, "nvidia/nemotron-3.5-lightning-30b-a3b");
  assert.equal(body.response_format.json_schema.strict, true);
  assert.equal(result.status, "needs_clarification");
  assert.equal(result.clarificationQuestions[0].id, "q1");
  assert.deepEqual(result.usage, { inputTokens: 23, outputTokens: 31 });
});

test("Requesty provider retries malformed model JSON once", async (t) => {
  const previousKey = env.requestyApiKey;
  const previousFetch = globalThis.fetch;
  env.requestyApiKey = "test-key-not-a-credential";
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return providerResponse(calls === 1 ? "not-json" : validResult());
  };
  t.after(() => {
    env.requestyApiKey = previousKey;
    globalThis.fetch = previousFetch;
  });

  await new RequestyProvider().optimizePrompt(requestInput);

  assert.equal(calls, 2);
});

test("Requesty authentication failures do not expose upstream details", async (t) => {
  const previousKey = env.requestyApiKey;
  const previousFetch = globalThis.fetch;
  env.requestyApiKey = "test-key-not-a-credential";
  globalThis.fetch = async () => new Response("sensitive upstream message", { status: 401 });
  t.after(() => {
    env.requestyApiKey = previousKey;
    globalThis.fetch = previousFetch;
  });

  await assert.rejects(
    new RequestyProvider().optimizePrompt(requestInput),
    (error) => error.statusCode === 503
      && error.code === "AI_PROVIDER_UNAVAILABLE"
      && !error.message.includes("sensitive"),
  );
});
