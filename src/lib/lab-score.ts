import type { LabGameId } from "@/types/portfolio";

export type LabScoreState = Record<LabGameId, number | null>;

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

export async function submitLabScore(game: LabGameId, score: number) {
  const response = await fetch("/api/score", {
    body: JSON.stringify({
      game,
      score: clampScore(score),
      metadata: {
        source: "developer-lab",
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Score API rejected the payload.");
  }
}
