import type { Document } from "mongodb";

import { ARCADE_GAME_IDS } from "@/lib/arcade/constants";
import { getMongoCollections } from "@/lib/mongodb/collections";
import type {
  LabGameId,
  LeaderboardEntry,
  LeaderboardPeriod,
  PlayerGameRanking,
  PlayerLeaderboardResponse,
} from "@/types/portfolio";

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

export function getLeaderboardPeriodStart(period: LeaderboardPeriod, now = new Date()) {
  if (period === "all") {
    return null;
  }

  const days = period === "week" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1_000);
}

function buildBestScoresPipeline({
  game,
  period,
}: {
  game: LabGameId;
  period: LeaderboardPeriod;
}): Document[] {
  const periodStart = getLeaderboardPeriodStart(period);
  const match: Document = {
    gameId: game,
  };

  if (periodStart) {
    match.createdAt = { $gte: periodStart };
  }

  return [
    { $match: match },
    { $sort: { score: -1, createdAt: 1 } },
    {
      $group: {
        _id: "$sessionHash",
        alias: { $first: "$playerAlias" },
        createdAt: { $first: "$createdAt" },
        score: { $first: "$score" },
      },
    },
    { $sort: { score: -1, createdAt: 1 } },
  ];
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
  const { arcadeScores } = await getMongoCollections();
  const entries = await arcadeScores
    .aggregate<{
      alias: string | null;
      createdAt: Date;
      score: number;
    }>([
      ...buildBestScoresPipeline({ game, period }),
      { $limit: limit },
      {
        $project: {
          _id: 0,
          alias: 1,
          createdAt: 1,
          score: 1,
        },
      },
    ])
    .toArray();

  return entries.map((entry) => ({
    alias: displayAlias(entry.alias),
    createdAt: entry.createdAt.toISOString(),
    score: entry.score,
  }));
}

async function getPlayerGameRanking({
  game,
  sessionHash,
}: {
  game: LabGameId;
  sessionHash: string;
}): Promise<PlayerGameRanking> {
  const { arcadeScores } = await getMongoCollections();
  const entries = await arcadeScores
    .aggregate<{
      _id: string;
      createdAt: Date;
      score: number;
    }>(buildBestScoresPipeline({ game, period: "all" }))
    .toArray();
  const playerIndex = entries.findIndex((entry) => entry._id === sessionHash);

  if (playerIndex < 0) {
    return emptyRanking();
  }

  const playerEntry = entries[playerIndex];

  return {
    createdAt: playerEntry.createdAt.toISOString(),
    rank: playerIndex + 1,
    score: playerEntry.score,
  };
}

export async function getPlayerLeaderboard({
  alias,
  sessionHash,
}: {
  alias: string | null;
  sessionHash: string;
}): Promise<PlayerLeaderboardResponse> {
  const rankingEntries = await Promise.all(
    ARCADE_GAME_IDS.map(async (game) => [
      rankingKeys[game],
      await getPlayerGameRanking({ game, sessionHash }),
    ] as const),
  );

  return {
    alias,
    rankings: {
      bugMaze: emptyRanking(),
      codeSnake: emptyRanking(),
      runtime: emptyRanking(),
      stackTetris: emptyRanking(),
      ...Object.fromEntries(rankingEntries),
    },
  };
}
