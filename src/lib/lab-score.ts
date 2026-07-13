import type { GameDeviceType, GameScorePayloadV2, LabGameId, ScoreSubmitResponse } from "../types/portfolio.ts";

export type LabScoreState = Record<LabGameId, number | null>;

export const GAME_SCORE_CONTRACT_VERSION = "v3";

export const GAME_VERSIONS = {
  runtime: "runtime@3.0.0",
  "bug-maze": "bug-maze@3.0.0",
  "code-snake": "code-snake@3.0.0",
  "stack-tetris": "stack-tetris@3.0.0",
} as const satisfies Record<LabGameId, GameScorePayloadV2["gameVersion"]>;

export const GAME_SCORE_LIMITS = {
  runtime: 100_000,
  "bug-maze": 2_000,
  "code-snake": 100_000,
  "stack-tetris": 1_000_000,
} as const satisfies Record<LabGameId, number>;

const SESSION_SCORE_TARGETS = {
  runtime: 1_200,
  "bug-maze": 180,
  "code-snake": 3_000,
  "stack-tetris": 25_000,
} as const satisfies Record<LabGameId, number>;

export const initialLabScores: LabScoreState = {
  runtime: null,
  "bug-maze": null,
  "code-snake": null,
  "stack-tetris": null,
};

function clampSessionScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function normalizeSessionScore(game: LabGameId, rawGameScore: number) {
  return clampSessionScore((rawGameScore / SESSION_SCORE_TARGETS[game]) * 100);
}

export function calculateSessionScore(scores: LabScoreState) {
  const completedScores = Object.entries(scores)
    .filter((entry): entry is [LabGameId, number] => typeof entry[1] === "number")
    .map(([game, rawGameScore]) => normalizeSessionScore(game, rawGameScore));

  if (completedScores.length === 0) {
    return null;
  }

  return clampSessionScore(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length);
}

export function detectGameDeviceType(): GameDeviceType {
  if (typeof window === "undefined") {
    return "unknown";
  }

  return window.matchMedia("(max-width: 640px)").matches ? "mobile" : "desktop";
}

type ApiSuccessEnvelope<T> = {
  data: T;
  ok: true;
};

export async function submitLabScore(payload: GameScorePayloadV2): Promise<ScoreSubmitResponse> {
  const response = await fetch("/api/score", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Score API rejected the payload.");
  }

  const body = (await response.json()) as ApiSuccessEnvelope<ScoreSubmitResponse>;

  if (!body.ok || body.data.mode !== "persistent") {
    throw new Error("Score API returned an invalid response.");
  }

  return body.data;
}
