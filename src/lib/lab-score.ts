import type { GameDeviceType, GameScorePayloadV2, LabGameId, ScoreSubmitResponse } from "@/types/portfolio";

export type LabScoreState = Record<LabGameId, number | null>;

export const GAME_SCORE_CONTRACT_VERSION = "v2";

export const GAME_VERSIONS = {
  runtime: "runtime@2.0.0",
  "bug-maze": "bug-maze@2.0.0",
  "code-snake": "code-snake@2.0.0",
  "stack-tetris": "stack-tetris@2.0.0",
} as const satisfies Record<LabGameId, GameScorePayloadV2["gameVersion"]>;

export const initialLabScores: LabScoreState = {
  runtime: null,
  "bug-maze": null,
  "code-snake": null,
  "stack-tetris": null,
};

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateSessionScore(scores: LabScoreState) {
  const completedScores = Object.values(scores).filter((score): score is number => typeof score === "number");

  if (completedScores.length === 0) {
    return null;
  }

  return clampScore(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length);
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
    body: JSON.stringify({
      ...payload,
      score: clampScore(payload.score),
    }),
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
