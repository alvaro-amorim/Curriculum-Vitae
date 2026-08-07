import assert from "node:assert/strict";
import test from "node:test";

import {
  RUNTIME_SCORE_REWARDS,
  calculateRuntimeScore,
  runtimeDifficulty,
  runtimeSpawnDelay,
  runtimeStageProgress,
  runtimeStageReached,
} from "../src/lib/games/runtime-runner-engine.ts";

test("Runtime Runner stage thresholds progress deterministically", () => {
  assert.equal(runtimeStageReached(0), "dev-server");
  assert.equal(runtimeStageReached(17.99), "dev-server");
  assert.equal(runtimeStageReached(18), "staging");
  assert.equal(runtimeStageReached(38), "production");
  assert.equal(runtimeStageReached(62), "incident-mode");
  assert.equal(runtimeStageReached(90), "zero-downtime");
});

test("Runtime Runner stage progress exposes the next checkpoint", () => {
  const staging = runtimeStageProgress(28);
  assert.equal(staging.nextStage, "production");
  assert.ok(staging.progress > 0 && staging.progress < 1);
  assert.equal(Math.round(staging.secondsRemaining), 10);

  const maxStage = runtimeStageProgress(120);
  assert.equal(maxStage.nextStage, null);
  assert.equal(maxStage.progress, 1);
  assert.equal(maxStage.secondsRemaining, 0);
});

test("Runtime Runner scoring rewards survival, clears, and near misses consistently", () => {
  const score = calculateRuntimeScore({
    cleared: 3,
    elapsed: 10,
    nearMisses: 2,
  });

  assert.equal(
    score,
    10 * RUNTIME_SCORE_REWARDS.survivalPerSecond +
      3 * RUNTIME_SCORE_REWARDS.cleared +
      2 * RUNTIME_SCORE_REWARDS.nearMiss,
  );
});

test("Runtime Runner never collapses obstacle cadence below the calibrated safe floor", () => {
  const desktopLate = runtimeDifficulty(300, false, false);
  const mobileLate = runtimeDifficulty(300, true, false);
  const reducedLate = runtimeDifficulty(300, false, true);

  assert.ok(desktopLate.minCadence >= 1.38);
  assert.ok(mobileLate.minCadence >= 1.48);
  assert.ok(reducedLate.minCadence >= 1.58);

  assert.ok(runtimeSpawnDelay(300, false, false, 0) >= desktopLate.minCadence);
  assert.ok(runtimeSpawnDelay(300, true, false, 0) >= mobileLate.minCadence);
  assert.ok(runtimeSpawnDelay(300, false, true, 0) >= reducedLate.minCadence);
});

test("Runtime Runner spawn jitter stays bounded and deterministic when random input is injected", () => {
  const low = runtimeSpawnDelay(70, false, false, 0);
  const high = runtimeSpawnDelay(70, false, false, 1);
  const difficulty = runtimeDifficulty(70, false, false);

  assert.ok(high >= low);
  assert.ok(high - low <= difficulty.jitter + Number.EPSILON);
});
