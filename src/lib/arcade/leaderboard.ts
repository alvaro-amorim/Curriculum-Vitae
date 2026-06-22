import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LabGameId, LeaderboardEntry, LeaderboardPeriod, PlayerGameRanking, PlayerLeaderboardResponse } from "@/types/portfolio";

const ANONYMOUS_ALIAS = "Anonymous Dev";

const rankingKeys = {
  runtime: "runtime",
  "bug-maze": "bugMaze",
  "code-snake": "codeSnake",
  "stack-tetris": "stackTetris",
} as const satisfies Record<LabGameId, keyof PlayerLeaderboardResponse["rankings"]>;

function displayAlias(alias: string | null) {
  const normalizedAlias = alias?.trim();

  return normalizedAlias ? normalizedAlias : ANONYMOUS_ALIAS;
}

function emptyRanking(): PlayerGameRanking {
  return {
    createdAt: null,
    rank: null,
    score: null,
  };
}

export async function getLeaderboardEntries({
  game,
  limit,
  period,
}: {
  game: LabGameId;
  limit: number;
  period: LeaderboardPeriod;
}): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_arcade_leaderboard", {
    p_game_id: game,
    p_limit: limit,
    p_period: period,
  });

  if (error) {
    throw new Error("Could not read arcade leaderboard.");
  }

  return (data ?? []).map((entry) => ({
    alias: displayAlias(entry.alias),
    createdAt: entry.created_at,
    score: entry.score,
  }));
}

export async function getPlayerLeaderboard({
  alias,
  sessionHash,
}: {
  alias: string | null;
  sessionHash: string;
}): Promise<PlayerLeaderboardResponse> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_arcade_player_rankings", {
    p_session_hash: sessionHash,
  });

  if (error) {
    throw new Error("Could not read player leaderboard positions.");
  }

  return {
    alias,
    rankings: (data ?? []).reduce<PlayerLeaderboardResponse["rankings"]>(
      (current, ranking) => ({
        ...current,
        [rankingKeys[ranking.game_id]]: {
          createdAt: ranking.created_at,
          rank: ranking.rank,
          score: ranking.score,
        },
      }),
      {
        bugMaze: emptyRanking(),
        codeSnake: emptyRanking(),
        runtime: emptyRanking(),
        stackTetris: emptyRanking(),
      },
    ),
  };
}
