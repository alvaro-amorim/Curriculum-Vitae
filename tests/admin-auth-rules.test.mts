import assert from "node:assert/strict";
import test from "node:test";

import {
  adminSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  isAdminApiPath,
  isAdminLoginPath,
  isSafeAdminNextPath,
  isSameOriginAdminRequest,
  isValidAdminEmail,
  normalizeAdminEmail,
} from "../src/lib/admin/auth-rules.ts";

test("normalizes and validates Admin email values", () => {
  assert.equal(normalizeAdminEmail("  Admin@Example.COM "), "admin@example.com");
  assert.equal(isValidAdminEmail("ADMIN@example.com"), true);
  assert.equal(isValidAdminEmail("other@example.com"), true);
  assert.equal(isValidAdminEmail(""), false);
  assert.equal(isValidAdminEmail("not-an-email"), false);
});

test("recognizes public login and protected Admin API paths", () => {
  assert.equal(isAdminLoginPath("/admin/login"), true);
  assert.equal(isAdminLoginPath("/api/admin/login"), true);
  assert.equal(isAdminLoginPath("/admin"), false);
  assert.equal(isAdminApiPath("/api/admin/logout"), true);
  assert.equal(isAdminApiPath("/api/score"), false);
});

test("accepts only internal Admin redirect targets", () => {
  assert.equal(isSafeAdminNextPath("/admin"), true);
  assert.equal(isSafeAdminNextPath("/admin/projects"), true);
  assert.equal(isSafeAdminNextPath("https://evil.example/admin"), false);
  assert.equal(isSafeAdminNextPath("//evil.example"), false);
  assert.equal(isSafeAdminNextPath("/api/admin/projects"), false);
  assert.equal(isSafeAdminNextPath("/projetos"), false);
});

test("accepts same-origin Admin mutations and rejects foreign origins", () => {
  assert.equal(
    isSameOriginAdminRequest("https://portfolio.example/api/admin/login", "https://portfolio.example"),
    true,
  );
  assert.equal(
    isSameOriginAdminRequest("https://portfolio.example/api/admin/login", "https://evil.example"),
    false,
  );
  assert.equal(
    isSameOriginAdminRequest("https://portfolio.example/api/admin/login", null),
    true,
  );
  assert.equal(
    isSameOriginAdminRequest("invalid-url", "https://portfolio.example"),
    false,
  );
});

test("builds the Admin session cookie policy", () => {
  assert.equal(ADMIN_SESSION_COOKIE, "alvaro_admin_session");
  assert.equal(ADMIN_SESSION_MAX_AGE_SECONDS, 60 * 60 * 8);
  assert.deepEqual(adminSessionCookieOptions(60, "development"), {
    httpOnly: true,
    maxAge: 60,
    path: "/",
    sameSite: "lax",
    secure: false,
  });
  assert.equal(adminSessionCookieOptions(60, "production").secure, true);
});
