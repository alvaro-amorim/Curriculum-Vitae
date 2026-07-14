import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";

import { ADMIN_SESSION_COOKIE } from "../src/lib/admin/auth-rules.ts";
import { proxy } from "../src/proxy.ts";

test("redirects private Admin pages without an Admin session cookie", () => {
  const response = proxy(new NextRequest("https://portfolio.example/admin/projects"));

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://portfolio.example/admin/login?next=%2Fadmin%2Fprojects");
});

test("returns 401 JSON for private Admin APIs without an Admin session cookie", async () => {
  const response = proxy(new NextRequest("https://portfolio.example/api/admin/projects"));
  const body = await response.json() as { ok: boolean };

  assert.equal(response.status, 401);
  assert.equal(body.ok, false);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("protects Admin media APIs at the proxy boundary before route validation", async () => {
  const response = proxy(new NextRequest("https://portfolio.example/api/admin/media/signature", {
    method: "POST",
  }));
  const body = await response.json() as { ok: boolean };

  assert.equal(response.status, 401);
  assert.equal(body.ok, false);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("allows public Admin auth routes and cookie-bearing private routes through", () => {
  const loginResponse = proxy(new NextRequest("https://portfolio.example/admin/login"));
  assert.equal(loginResponse.status, 200);

  const request = new NextRequest("https://portfolio.example/admin");
  request.cookies.set(ADMIN_SESSION_COOKIE, "opaque-token");
  const privateResponse = proxy(request);

  assert.equal(privateResponse.status, 200);
});
