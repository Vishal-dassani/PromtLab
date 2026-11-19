import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema } from "../src/validators/auth.validator.js";

test("registration trims user fields and normalizes email", () => {
  const result = registerSchema.parse({
    name: "  Sam Rivera ",
    email: " SAM@example.com ",
    password: "correct horse battery",
  });

  assert.equal(result.name, "Sam Rivera");
  assert.equal(result.email, "sam@example.com");
  assert.equal(result.password, "correct horse battery");
});

test("registration rejects short passwords and unexpected fields", () => {
  assert.equal(registerSchema.safeParse({
    name: "Sam",
    email: "sam@example.com",
    password: "short",
  }).success, false);

  assert.equal(registerSchema.safeParse({
    name: "Sam",
    email: "sam@example.com",
    password: "long-enough-password",
    plan: "pro",
  }).success, false);
});

test("login requires a valid email and a non-empty password", () => {
  assert.equal(loginSchema.safeParse({
    email: "not-an-email",
    password: "password",
  }).success, false);

  assert.equal(loginSchema.safeParse({
    email: "sam@example.com",
    password: "",
  }).success, false);
});
