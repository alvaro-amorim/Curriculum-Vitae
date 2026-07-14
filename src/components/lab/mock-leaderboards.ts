import type { LabGameId, LeaderboardEntry } from "../../types/portfolio.ts";

const DISPLAY_LEADERBOARD_LIMIT = 3;

export const MOCK_ARCADE_LEADERBOARDS: Record<LabGameId, LeaderboardEntry[]> = {
  runtime: [
    { alias: "Demo Runner", createdAt: "2026-07-13T12:00:00.000Z", score: 1180 },
    { alias: "Pipeline Pro", createdAt: "2026-07-13T12:01:00.000Z", score: 1014 },
    { alias: "Build Pilot", createdAt: "2026-07-13T12:02:00.000Z", score: 890 },
  ],
  "bug-maze": [
    { alias: "Patch Hunter", createdAt: "2026-07-13T12:03:00.000Z", score: 172 },
    { alias: "Deploy Scout", createdAt: "2026-07-13T12:04:00.000Z", score: 149 },
    { alias: "Bug Tamer", createdAt: "2026-07-13T12:05:00.000Z", score: 136 },
  ],
  "code-snake": [
    { alias: "Token Flow", createdAt: "2026-07-13T12:06:00.000Z", score: 3260 },
    { alias: "Cache Pilot", createdAt: "2026-07-13T12:07:00.000Z", score: 2890 },
    { alias: "Type Guard", createdAt: "2026-07-13T12:08:00.000Z", score: 2410 },
  ],
  "stack-tetris": [
    { alias: "Stack Lead", createdAt: "2026-07-13T12:09:00.000Z", score: 24420 },
    { alias: "Module Ops", createdAt: "2026-07-13T12:10:00.000Z", score: 19980 },
    { alias: "CI Builder", createdAt: "2026-07-13T12:11:00.000Z", score: 16340 },
  ],
};

export function getDisplayLeaderboard(game: LabGameId, leaderboard: LeaderboardEntry[]) {
  return [...MOCK_ARCADE_LEADERBOARDS[game], ...leaderboard]
    .sort((left, right) => right.score - left.score || Date.parse(left.createdAt) - Date.parse(right.createdAt))
    .slice(0, DISPLAY_LEADERBOARD_LIMIT);
}
