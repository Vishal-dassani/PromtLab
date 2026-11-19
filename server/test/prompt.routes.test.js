import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

test("optimization endpoint validates request before provider or database access", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once("listening", resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/prompts/optimize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ originalInput: "   ", extra: true }),
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.error.code, "VALIDATION_ERROR");
  assert.ok(payload.error.details.length >= 1);
});
