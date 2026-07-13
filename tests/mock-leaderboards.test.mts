import assert from "node:assert/strict";
import test from "node:test";

import { ARCADE_GAME_IDS } from "../src/lib/arcade/constants.ts";
import {
  getDisplayLeaderboard,
  isMockLeaderboard,
  MOCK_ARCADE_LEADERBOARDS,
} from "../src/components/lab/mock-leaderboards.ts";

test("provides three mock leaderboard entries for every Arcade game", () => {
  for (const game of ARCADE_GAME_IDS) {
    const entries = MOCK_ARCADE_LEADERBOARDS[game];

    assert.equal(entries.length, 3);
    assert.ok(entries.every((entry) => entry.alias.length > 0));
    assert.ok(entries.every((entry) => Number.isInteger(entry.score) && entry.score >= 0));
  }
});

test("uses mock leaderboard only when real rankings are empty", () => {
  const realLeaderboard = [
    {
      alias: "Real Player",
      createdAt: "2026-07-13T13:00:00.000Z",
      score: 4321,
    },
  ];

  assert.equal(isMockLeaderboard([]), true);
  assert.equal(isMockLeaderboard(realLeaderboard), false);
  assert.deepEqual(getDisplayLeaderboard("runtime", []), MOCK_ARCADE_LEADERBOARDS.runtime);
  assert.deepEqual(getDisplayLeaderboard("runtime", realLeaderboard), realLeaderboard);
});
