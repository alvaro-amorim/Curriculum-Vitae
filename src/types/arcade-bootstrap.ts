import type { LabGameId, LeaderboardEntry, PlayerLeaderboardResponse } from "@/types/portfolio";

export type ArcadeBootstrapLeaderboards = Record<LabGameId, LeaderboardEntry[]>;

export type ArcadeBootstrapResponse = {
  leaderboards: ArcadeBootstrapLeaderboards;
  partialFailures: {
    leaderboards: LabGameId[];
    playerLeaderboard: boolean;
  };
  playerLeaderboard: PlayerLeaderboardResponse | null;
  session: {
    alias: string | null;
    maxAliasLength: number;
    ready: true;
  };
};
