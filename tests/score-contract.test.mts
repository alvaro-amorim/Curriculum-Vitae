import assert from "node:assert/strict";
import test from "node:test";

import { ScorePayloadSchema } from "../src/lib/validators.ts";

const base = {
  deviceType: "desktop" as const,
  durationMs: 12_000,
  score: 82,
};

test("accepts each final Arcade score contract", () => {
  const payloads = [
    {
      ...base,
      game: "runtime",
      gameVersion: "runtime@2.0.0",
      metadata: {
        cleared: 14,
        collisions: 1,
        distance: 940,
        maxSpeed: 12.5,
        nearMisses: 3,
        stageReached: "staging",
      },
    },
    {
      ...base,
      game: "bug-maze",
      gameVersion: "bug-maze@2.0.0",
      metadata: {
        damageTaken: 1,
        deployStage: 4,
        livesRemaining: 2,
        tokensCollected: 5,
        totalTokens: 8,
        virusesActive: 2,
      },
    },
    {
      ...base,
      game: "code-snake",
      gameVersion: "code-snake@2.0.0",
      metadata: {
        hazardsHit: 1,
        length: 12,
        maxCombo: 4,
        tokensCollected: 9,
        wallsEnabled: true,
        wrapAround: false,
      },
    },
    {
      ...base,
      game: "stack-tetris",
      gameVersion: "stack-tetris@2.0.0",
      metadata: {
        hardDrops: 8,
        level: 3,
        linesCleared: 6,
        maxCombo: 2,
        piecesPlaced: 28,
      },
    },
  ];

  for (const payload of payloads) {
    assert.equal(ScorePayloadSchema.safeParse(payload).success, true);
  }
});

test("rejects fabricated score bounds and game versions", () => {
  const invalidScore = {
    ...base,
    game: "runtime",
    gameVersion: "runtime@2.0.0",
    score: 101,
    metadata: {
      cleared: 1,
      collisions: 0,
      distance: 100,
      maxSpeed: 5,
      stageReached: "dev-server",
    },
  };
  const invalidVersion = {
    ...invalidScore,
    score: 80,
    gameVersion: "runtime@1.0.0",
  };

  assert.equal(ScorePayloadSchema.safeParse(invalidScore).success, false);
  assert.equal(ScorePayloadSchema.safeParse(invalidVersion).success, false);
});

test("rejects inconsistent game metadata", () => {
  const tooManyTokens = {
    ...base,
    game: "bug-maze",
    gameVersion: "bug-maze@2.0.0",
    metadata: {
      damageTaken: 0,
      deployStage: 2,
      livesRemaining: 3,
      tokensCollected: 9,
      totalTokens: 4,
      virusesActive: 1,
    },
  };
  const incompatibleSnakeRules = {
    ...base,
    game: "code-snake",
    gameVersion: "code-snake@2.0.0",
    metadata: {
      hazardsHit: 0,
      length: 8,
      tokensCollected: 5,
      wallsEnabled: true,
      wrapAround: true,
    },
  };

  assert.equal(ScorePayloadSchema.safeParse(tooManyTokens).success, false);
  assert.equal(ScorePayloadSchema.safeParse(incompatibleSnakeRules).success, false);
});
