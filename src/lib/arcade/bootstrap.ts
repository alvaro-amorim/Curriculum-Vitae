import { getLeaderboardEntries, getPlayerLeaderboard } from "@/lib/arcade/leaderboard";
import type { LabGameId, LeaderboardEntry, PlayerLeaderboardResponse } from "@/types/portfolio";

export const ARCADE_BOOTSTRAP_GAME_IDS = ["runtime", "bug-maze", "code-snake", "stack-tetris"] as const satisfies readonly LabGameId[];

export type ArcadeBootstrapLeaderboards = Record<(typeof ARCADE_BOOTSTRAP_GAME_IDS)[number], LeaderboardEntry[]>;

export type ArcadeBootstrapResult = {
  leaderboards: ArcadeBootstrapLeaderboards;
  partialFailures: {
    leaderboards: LabGameId[];
    playerLeaderboard: boolean;
  };
  playerLeaderboard: PlayerLeaderboardResponse | null;
};

const emptyLeaderboards: ArcadeBootstrapLeaderboards = {
  runtime: [],
  "bug-maze": [],
  "code-snake": [],
  "stack-tetris": [],
};

export async function getArcadeBootstrapData({
  alias,
  leaderboardLimit = 3,
  sessionHash,
}: {
  alias: string | null;
  leaderboardLimit?: number;
  sessionHash: string;
}): Promise<ArcadeBootstrapResult> {
  const leaderboardResults = await Promise.allSettled(
    ARCADE_BOOTSTRAP_GAME_IDS.map(async (game) => [
      game,
      await getLeaderboardEntries({
        game,
        limit: leaderboardLimit,
        period: "all",
      }),
    ] as const),
  );
  const playerLeaderboardResult = await Promise.allSettled([
    getPlayerLeaderboard({ alias, sessionHash }),
  ]);

  const failedGames: LabGameId[] = [];
  const leaderboards = leaderboardResults.reduce<ArcadeBootstrapLeaderboards>((current, result, index) => {
    const game = ARCADE_BOOTSTRAP_GAME_IDS[index];

    if (result.status === "fulfilled") {
      current[game] = result.value[1];
    } else {
      failedGames.push(game);
    }

    return current;
  }, { ...emptyLeaderboards });
  const playerResult = playerLeaderboardResult[0];

  return {
    leaderboards,
    partialFailures: {
      leaderboards: failedGames,
      playerLeaderboard: playerResult.status === "rejected",
    },
    playerLeaderboard: playerResult.status === "fulfilled" ? playerResult.value : null,
  };
}
