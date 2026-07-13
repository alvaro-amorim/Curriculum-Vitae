import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_LOGIN_ATTEMPT_LIMIT,
  ADMIN_LOGIN_WINDOW_MS,
  consumeAdminLoginAttempt,
  resetAdminLoginAttempts,
  resetAdminLoginRateLimitForTests,
} from "../src/lib/admin/rate-limit.ts";

test.beforeEach(() => {
  resetAdminLoginRateLimitForTests();
});

test("blocks Admin login attempts after the configured threshold", () => {
  const key = "admin:login";

  for (let attempt = 0; attempt < ADMIN_LOGIN_ATTEMPT_LIMIT; attempt += 1) {
    assert.equal(consumeAdminLoginAttempt(key, 1_000 + attempt).allowed, true);
  }

  const blocked = consumeAdminLoginAttempt(key, 2_000);

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test("resets a successful Admin login bucket", () => {
  const key = "admin:success";
  consumeAdminLoginAttempt(key, 1_000);
  resetAdminLoginAttempts(key);

  const next = consumeAdminLoginAttempt(key, 1_001);

  assert.equal(next.allowed, true);
  assert.equal(next.remaining, ADMIN_LOGIN_ATTEMPT_LIMIT - 1);
});

test("starts a fresh Admin login window after expiry", () => {
  const key = "admin:expired";

  for (let attempt = 0; attempt < ADMIN_LOGIN_ATTEMPT_LIMIT; attempt += 1) {
    consumeAdminLoginAttempt(key, 1_000 + attempt);
  }

  const refreshed = consumeAdminLoginAttempt(key, 1_000 + ADMIN_LOGIN_WINDOW_MS);

  assert.equal(refreshed.allowed, true);
  assert.equal(refreshed.remaining, ADMIN_LOGIN_ATTEMPT_LIMIT - 1);
});
