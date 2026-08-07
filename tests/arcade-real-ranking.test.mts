import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const labSource = await readFile(
  new URL("../src/components/lab/developer-lab-v2.tsx", import.meta.url),
  "utf8",
);

test("Arcade leaderboard renders persisted data without mock fallbacks", () => {
  assert.equal(labSource.includes("mock-leaderboards"), false);
  assert.equal(labSource.includes("getDisplayLeaderboard"), false);
  assert.match(labSource, /leaderboards\[rankingGame\]\.slice\(0, 3\)/);
});

test("Arcade keeps the player's full ranking position visible outside the Top 3", () => {
  assert.match(labSource, /playerLeaderboard\?\.rankings/);
  assert.match(labSource, /selectedRanking\?\.rank/);
  assert.match(labSource, /rankExplanation/);
});

test("opening a game requires an alias when the session has none", () => {
  assert.match(labSource, /session\?\.alias\?\.trim\(\)/);
  assert.match(labSource, /setPendingGame\(game\)/);
  assert.match(labSource, /aliasDialogOpen/);
  assert.match(labSource, /aliasGateContinue/);
});
