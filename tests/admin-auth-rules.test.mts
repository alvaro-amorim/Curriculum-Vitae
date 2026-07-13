import assert from "node:assert/strict";
import test from "node:test";

import {
  isAdminApiPath,
  isAdminLoginPath,
  isAllowedAdminEmail,
  isSafeAdminNextPath,
  isSameOriginAdminRequest,
  normalizeAdminEmail,
} from "../src/lib/admin/auth-rules.ts";

test("normalizes and matches the configured Admin email exactly", () => {
  assert.equal(normalizeAdminEmail("  Admin@Example.COM "), "admin@example.com");
  assert.equal(isAllowedAdminEmail("ADMIN@example.com", "admin@example.com"), true);
  assert.equal(isAllowedAdminEmail("other@example.com", "admin@example.com"), false);
  assert.equal(isAllowedAdminEmail("", "admin@example.com"), false);
  assert.equal(isAllowedAdminEmail("admin@example.com", ""), false);
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
