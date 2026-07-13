import assert from "node:assert/strict";
import test from "node:test";

import {
  ARCADE_LAST_SEEN_REFRESH_INTERVAL_MS,
  shouldRefreshArcadeSessionLastSeen,
  validatePlayerAlias,
} from "../src/lib/arcade/session.ts";

test("keeps recent Arcade sessions read-only", () => {
  const now = Date.parse("2026-07-13T12:00:00.000Z");
  const recent = new Date(now - ARCADE_LAST_SEEN_REFRESH_INTERVAL_MS + 1).toISOString();

  assert.equal(shouldRefreshArcadeSessionLastSeen(recent, now), false);
});

test("refreshes stale or invalid Arcade session activity", () => {
  const now = Date.parse("2026-07-13T12:00:00.000Z");
  const stale = new Date(now - ARCADE_LAST_SEEN_REFRESH_INTERVAL_MS).toISOString();

  assert.equal(shouldRefreshArcadeSessionLastSeen(stale, now), true);
  assert.equal(shouldRefreshArcadeSessionLastSeen("invalid-date", now), true);
});

test("normalizes a valid player alias", () => {
  assert.deepEqual(validatePlayerAlias("  Álvaro   Dev  "), {
    alias: "Álvaro Dev",
    ok: true,
  });
});

test("allows clearing an alias", () => {
  assert.deepEqual(validatePlayerAlias("   "), {
    alias: null,
    ok: true,
  });
});

test("rejects contact information and unsupported characters in aliases", () => {
  assert.equal(validatePlayerAlias("dev@example.com").ok, false);
  assert.equal(validatePlayerAlias("https://example.com").ok, false);
  assert.equal(validatePlayerAlias("31999999999").ok, false);
  assert.equal(validatePlayerAlias("dev<script>").ok, false);
});
