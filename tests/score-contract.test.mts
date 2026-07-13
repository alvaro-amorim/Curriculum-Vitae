import assert from "node:assert/strict";
import test from "node:test";

import { submitLabScore } from "../src/lib/lab-score.ts";
import { ScorePayloadSchema } from "../src/lib/validators.ts";

const base = {
  deviceType: "desktop" as const,
  durationMs: 12_000,
};

test("accepts each final Arcade score contract", () => {
  const payloads = [
    {
      ...base,
      game: "runtime",
      gameVersion: "runtime@3.0.0",
      metadata: {
        cleared: 14,
        collisions: 1,
        distance: 940,
        maxSpeed: 12.5,
        nearMisses: 3,
        stageReached: "staging",
      },
      score: 890,
    },
    {
      ...base,
      game: "bug-maze",
      gameVersion: "bug-maze@3.0.0",
      metadata: {
        damageTaken: 1,
        deployStage: 4,
        livesRemaining: 2,
        tokensCollected: 5,
        totalTokens: 8,
        virusesActive: 2,
      },
      score: 138,
    },
    {
      ...base,
      game: "code-snake",
      gameVersion: "code-snake@3.0.0",
      metadata: {
        hazardsHit: 1,
        length: 12,
        maxCombo: 4,
        tokensCollected: 9,
        wallsEnabled: true,
        wrapAround: false,
      },
      score: 1_420,
    },
    {
      ...base,
      game: "stack-tetris",
      gameVersion: "stack-tetris@3.0.0",
      metadata: {
        hardDrops: 8,
        level: 3,
        linesCleared: 6,
        maxCombo: 2,
        piecesPlaced: 28,
      },
      score: 8_900,
    },
  ];

  for (const payload of payloads) {
    assert.equal(ScorePayloadSchema.safeParse(payload).success, true);
  }
});

test("rejects fabricated score bounds and game versions", () => {
  const runtimePayload = {
    ...base,
    game: "runtime",
    gameVersion: "runtime@3.0.0",
    metadata: {
      cleared: 1,
      collisions: 0,
      distance: 100,
      maxSpeed: 5,
      stageReached: "dev-server",
    },
    score: 80,
  };
  const invalidScore = {
    ...runtimePayload,
    score: 100_001,
  };
  const negativeScore = {
    ...runtimePayload,
    score: -1,
  };
  const decimalScore = {
    ...runtimePayload,
    score: 890.5,
  };
  const invalidVersion = {
    ...runtimePayload,
    score: 80,
    gameVersion: "runtime@1.0.0",
  };

  assert.equal(ScorePayloadSchema.safeParse(invalidScore).success, false);
  assert.equal(ScorePayloadSchema.safeParse(negativeScore).success, false);
  assert.equal(ScorePayloadSchema.safeParse(decimalScore).success, false);
  assert.equal(ScorePayloadSchema.safeParse(invalidVersion).success, false);
});

test("rejects inconsistent game metadata", () => {
  const tooManyTokens = {
    ...base,
    game: "bug-maze",
    gameVersion: "bug-maze@3.0.0",
    metadata: {
      damageTaken: 0,
      deployStage: 2,
      livesRemaining: 3,
      tokensCollected: 9,
      totalTokens: 4,
      virusesActive: 1,
    },
    score: 96,
  };
  const incompatibleSnakeRules = {
    ...base,
    game: "code-snake",
    gameVersion: "code-snake@3.0.0",
    metadata: {
      hazardsHit: 0,
      length: 8,
      tokensCollected: 5,
      wallsEnabled: true,
      wrapAround: true,
    },
    score: 640,
  };

  assert.equal(ScorePayloadSchema.safeParse(tooManyTokens).success, false);
  assert.equal(ScorePayloadSchema.safeParse(incompatibleSnakeRules).success, false);
});

test("submitLabScore preserves the raw Runtime score", async () => {
  const originalFetch = globalThis.fetch;
  let capturedScore: number | null = null;

  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.method, "POST");
    const payload = JSON.parse(String(init?.body)) as { game: "runtime"; score: number };
    capturedScore = payload.score;

    return new Response(
      JSON.stringify({
        data: {
          accepted: true,
          contractVersion: "v3",
          game: payload.game,
          mode: "persistent",
          score: payload.score,
        },
        ok: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 202,
      },
    );
  }) as typeof fetch;

  try {
    const result = await submitLabScore({
      ...base,
      game: "runtime",
      gameVersion: "runtime@3.0.0",
      metadata: {
        cleared: 14,
        collisions: 1,
        distance: 940,
        maxSpeed: 12.5,
        nearMisses: 3,
        stageReached: "staging",
      },
      score: 890,
    });

    assert.equal(capturedScore, 890);
    assert.equal(result.score, 890);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
