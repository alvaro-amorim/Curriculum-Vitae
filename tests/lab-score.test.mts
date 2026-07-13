import assert from "node:assert/strict";
import test from "node:test";

import { calculateSessionScore, initialLabScores } from "../src/lib/lab-score.ts";

test("starts with an empty Lab session", () => {
  assert.equal(calculateSessionScore(initialLabScores), null);
});

test("averages only completed games", () => {
  assert.equal(
    calculateSessionScore({
      runtime: 80,
      bugMaze: null,
      codeSnake: 60,
      stackTetris: null,
    }),
    70,
  );
});

test("rounds the final session average", () => {
  assert.equal(
    calculateSessionScore({
      runtime: 83,
      bugMaze: 74,
      codeSnake: 92,
      stackTetris: 67,
    }),
    79,
  );
});
