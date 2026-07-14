import assert from "node:assert/strict";
import test from "node:test";

import { ARCADE_GAME_IDS } from "../src/lib/arcade/constants.ts";
import {
  getDisplayLeaderboard,
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

test("keeps mock scores as permanent targets in the displayed ranking", () => {
  const lowRealLeaderboard = [
    {
      alias: "Learning Player",
      createdAt: "2026-07-13T13:00:00.000Z",
      score: 120,
    },
  ];

  assert.deepEqual(getDisplayLeaderboard("runtime", []), MOCK_ARCADE_LEADERBOARDS.runtime);
  assert.deepEqual(getDisplayLeaderboard("runtime", lowRealLeaderboard), MOCK_ARCADE_LEADERBOARDS.runtime);
});

test("shows a real player only after they beat the mock cutoff", () => {
  const strongRealLeaderboard = [
    {
      alias: "Real Player",
      createdAt: "2026-07-13T13:00:00.000Z",
      score: 1020,
    },
  ];
  const displayLeaderboard = getDisplayLeaderboard("runtime", strongRealLeaderboard);

  assert.equal(displayLeaderboard.length, 3);
  assert.deepEqual(displayLeaderboard.map((entry) => entry.alias), [
    "Demo Runner",
    "Real Player",
    "Pipeline Pro",
  ]);
  assert.equal(displayLeaderboard.some((entry) => entry.alias === "Build Pilot"), false);
});
