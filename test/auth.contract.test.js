import assert from "node:assert/strict";
import { after, before, test } from "node:test";

process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.ACCESS_TOKEN_SECRET = Buffer.alloc(32, 1).toString("base64url");
process.env.ACCESS_TOKEN_EXPIRATION = "15m";
process.env.REFRESH_TOKEN_EXPIRATION = "7d";
process.env.SESSION_EXPIRATION = "30d";

const { app } = await import("../src/app.js");
const { getRefreshCookieBaseOptions } = await import(
  "../src/modules/auth/auth.controller.js"
);
const { createAccessToken, verifyAccessToken } = await import(
  "../src/modules/auth/auth.tokens.js"
);
const { signupSchema } = await import(
  "../src/modules/auth/auth.validation.js"
);

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("access tokens contain the required claims and expire after 15 minutes", () => {
  const accessToken = createAccessToken({
    userId: "11111111-1111-4111-8111-111111111111",
    sessionId: "22222222-2222-4222-8222-222222222222",
  });
  const decoded = verifyAccessToken(accessToken);

  assert.equal(decoded.sub, "11111111-1111-4111-8111-111111111111");
  assert.equal(decoded.sid, "22222222-2222-4222-8222-222222222222");
  assert.equal(decoded.typ, "access");
  assert.equal(decoded.exp - decoded.iat, 15 * 60);
});

test("production refresh cookies are secure and cross-site", () => {
  assert.deepEqual(getRefreshCookieBaseOptions("production", false), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
    path: "/",
  });
});

test("signup validation requires a valid email, name, and password", () => {
  const result = signupSchema.safeParse({
    email: "invalid",
    name: "x",
    password: "short",
  });

  assert.equal(result.success, false);
  assert.deepEqual(
    new Set(result.error.issues.map((issue) => issue.path[0])),
    new Set(["email", "name", "password"]),
  );
});

test("refresh without a cookie returns the standard authentication error", async () => {
  const response = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.deepEqual(body, {
    error: "Invalid or expired session.",
    code: "INVALID_SESSION",
  });
});

test("project routes reject requests without an access token", async () => {
  const response = await fetch(`${baseUrl}/api/projects`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.code, "INVALID_ACCESS_TOKEN");
});
