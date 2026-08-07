import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const labSource = await readFile(
  new URL("../src/components/lab/developer-lab-v2.tsx", import.meta.url),
  "utf8",
);

const transitionStyles = await readFile(
  new URL("../src/components/lab/arcade-transition.module.css", import.meta.url),
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

test("Arcade preloads game modules behind a visible loading transition", () => {
  assert.match(labSource, /gamePreloaders/);
  assert.match(labSource, /runTransition\("game", game, gamePreloaders\[game\]\)/);
  assert.match(labSource, /MIN_TRANSITION_MS/);
  assert.match(labSource, /ArcadeTransition/);
  assert.match(transitionStyles, /position:\s*fixed/);
  assert.match(transitionStyles, /cursor:\s*wait/);
});

test("alias flow has loading states before the dialog and before the arena", () => {
  assert.match(labSource, /runTransition\("alias", game\)/);
  assert.match(labSource, /aliasStatus === "saving"/);
  assert.match(labSource, /runTransition\("alias-to-game", gameToOpen, gamePreloaders\[gameToOpen\]\)/);
  assert.match(labSource, /aliasSaving/);
});
