import assert from "node:assert/strict";
import test from "node:test";

import {
  consumeArcadeRateLimit,
  resetArcadeRateLimitStoreForTests,
} from "../src/lib/arcade/rate-limit.ts";

test.beforeEach(() => {
  resetArcadeRateLimitStoreForTests();
});

test("allows requests until the configured limit", () => {
  const first = consumeArcadeRateLimit({ key: "score:player", limit: 2, nowMs: 1_000, windowMs: 10_000 });
  const second = consumeArcadeRateLimit({ key: "score:player", limit: 2, nowMs: 1_001, windowMs: 10_000 });
  const blocked = consumeArcadeRateLimit({ key: "score:player", limit: 2, nowMs: 1_002, windowMs: 10_000 });

  assert.equal(first.allowed, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 10);
});

test("starts a fresh bucket after the window expires", () => {
  consumeArcadeRateLimit({ key: "score:player", limit: 1, nowMs: 1_000, windowMs: 1_000 });

  const refreshed = consumeArcadeRateLimit({ key: "score:player", limit: 1, nowMs: 2_000, windowMs: 1_000 });

  assert.equal(refreshed.allowed, true);
  assert.equal(refreshed.remaining, 0);
  assert.equal(refreshed.resetAt, 3_000);
});

test("keeps independent buckets for different sessions", () => {
  consumeArcadeRateLimit({ key: "score:first", limit: 1, nowMs: 1_000, windowMs: 10_000 });

  const secondPlayer = consumeArcadeRateLimit({ key: "score:second", limit: 1, nowMs: 1_000, windowMs: 10_000 });

  assert.equal(secondPlayer.allowed, true);
});
