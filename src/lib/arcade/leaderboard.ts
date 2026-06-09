import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LabGameId, LeaderboardEntry, LeaderboardPeriod, PlayerGameRanking, PlayerLeaderboardResponse } from "@/types/portfolio";

const ANONYMOUS_ALIAS = "Anonymous Dev";

const rankingKeys = {
  runtime: "runtime",
  "bug-maze": "bugMaze",
  "code-snake": "codeSnake",
  "stack-tetris": "stackTetris",
} as const satisfies Record<LabGameId, keyof PlayerLeaderboardResponse["rankings"]>;

export const leaderboardGameIds = ["runtime", "bug-maze", "code-snake", "stack-tetris"] as const satisfies LabGameId[];

function periodCutoff(period: LeaderboardPeriod) {
  if (period === "all") {
    return null;
  }

  const now = Date.now();
  const days = period === "week" ? 7 : 30;

  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
}

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
  const cutoff = periodCutoff(period);
  let query = supabase
    .from("arcade_scores")
    .select("created_at, player_alias, score")
    .eq("game_id", game)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (cutoff) {
    query = query.gte("created_at", cutoff);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Could not read arcade leaderboard.");
  }

  return (data ?? []).map((entry) => ({
    alias: displayAlias(entry.player_alias),
    createdAt: entry.created_at,
    score: entry.score,
  }));
}

async function getPlayerRankingForGame(game: LabGameId, sessionHash: string): Promise<PlayerGameRanking> {
  const supabase = getSupabaseServerClient();
  const { data: bestScore, error: bestScoreError } = await supabase
    .from("arcade_scores")
    .select("created_at, score")
    .eq("game_id", game)
    .eq("session_hash", sessionHash)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (bestScoreError) {
    throw new Error("Could not read player leaderboard position.");
  }

  if (!bestScore) {
    return emptyRanking();
  }

  const { count, error: rankError } = await supabase
    .from("arcade_scores")
    .select("id", { count: "exact", head: true })
    .eq("game_id", game)
    .or(`score.gt.${bestScore.score},and(score.eq.${bestScore.score},created_at.lt.${bestScore.created_at})`);

  if (rankError) {
    throw new Error("Could not calculate player leaderboard position.");
  }

  return {
    createdAt: bestScore.created_at,
    rank: (count ?? 0) + 1,
    score: bestScore.score,
  };
}

export async function getPlayerLeaderboard({
  alias,
  sessionHash,
}: {
  alias: string | null;
  sessionHash: string;
}): Promise<PlayerLeaderboardResponse> {
  const rankings = await Promise.all(
    leaderboardGameIds.map(async (game) => [game, await getPlayerRankingForGame(game, sessionHash)] as const),
  );

  return {
    alias,
    rankings: rankings.reduce<PlayerLeaderboardResponse["rankings"]>(
      (current, [game, ranking]) => ({
        ...current,
        [rankingKeys[game]]: ranking,
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
