import assert from "node:assert/strict";
import test from "node:test";

import { calculateSessionScore, initialLabScores } from "../src/lib/lab-score.ts";

test("starts with an empty Lab session", () => {
  assert.equal(calculateSessionScore(initialLabScores), null);
});

test("averages only completed games", () => {
  assert.equal(
    calculateSessionScore({
      runtime: 600,
      "bug-maze": null,
      "code-snake": 3_000,
      "stack-tetris": null,
    }),
    75,
  );
});

test("rounds the final session average", () => {
  assert.equal(
    calculateSessionScore({
      runtime: 960,
      "bug-maze": 142,
      "code-snake": 2_370,
      "stack-tetris": 19_750,
    }),
    79,
  );
});
