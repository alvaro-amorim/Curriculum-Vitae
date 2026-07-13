import assert from "node:assert/strict";
import test from "node:test";

import {
  AnalyticsPayloadSchema,
  ContactPayloadSchema,
  LeaderboardLimitSchema,
  PlayerSessionPayloadSchema,
} from "../src/lib/validators.ts";

test("normalizes a valid contact payload and rejects extra fields", () => {
  const valid = ContactPayloadSchema.safeParse({
    email: "  dev@example.com  ",
    message: "  Quero conversar sobre um projeto.  ",
    name: "  Álvaro  ",
    source: "  portfolio  ",
  });
  const invalid = ContactPayloadSchema.safeParse({
    email: "dev@example.com",
    extra: true,
    message: "Quero conversar sobre um projeto.",
    name: "Álvaro",
  });

  assert.equal(valid.success, true);
  assert.deepEqual(valid.success ? valid.data : null, {
    email: "dev@example.com",
    message: "Quero conversar sobre um projeto.",
    name: "Álvaro",
    source: "portfolio",
  });
  assert.equal(invalid.success, false);
});

test("limits analytics metadata and known event names", () => {
  const valid = AnalyticsPayloadSchema.safeParse({
    event: "project_view",
    metadata: {
      slug: "margem-app",
    },
  });
  const invalidEvent = AnalyticsPayloadSchema.safeParse({ event: "unknown_event" });
  const tooManyKeys = AnalyticsPayloadSchema.safeParse({
    event: "page_view",
    metadata: Object.fromEntries(Array.from({ length: 21 }, (_, index) => [`key-${index}`, index])),
  });

  assert.equal(valid.success, true);
  assert.equal(invalidEvent.success, false);
  assert.equal(tooManyKeys.success, false);
});

test("coerces and bounds leaderboard limits", () => {
  assert.equal(LeaderboardLimitSchema.parse("3"), 3);
  assert.equal(LeaderboardLimitSchema.safeParse("0").success, false);
  assert.equal(LeaderboardLimitSchema.safeParse("51").success, false);
});

test("accepts an optional alias but rejects unknown session fields", () => {
  assert.equal(PlayerSessionPayloadSchema.safeParse({ alias: "dev" }).success, true);
  assert.equal(PlayerSessionPayloadSchema.safeParse({ alias: null }).success, true);
  assert.equal(PlayerSessionPayloadSchema.safeParse({ alias: "dev", role: "admin" }).success, false);
});
