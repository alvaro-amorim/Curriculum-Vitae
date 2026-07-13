"use client";

import { useCallback, useEffect, useState } from "react";

import { ARCADE_GAME_IDS } from "@/lib/arcade/constants";
import { submitLabScore } from "@/lib/lab-score";
import type { ArcadeBootstrapResponse } from "@/types/arcade-bootstrap";
import type {
  GameScorePayloadV2,
  LabGameId,
  LeaderboardEntry,
  LeaderboardResponse,
  PlayerLeaderboardResponse,
  ScoreSubmitResponse,
} from "@/types/portfolio";

type ArcadeLoadStatus = "idle" | "loading" | "ready" | "partial" | "error";
type AliasSaveStatus = "idle" | "saving" | "success" | "error";

type PlayerSession = ArcadeBootstrapResponse["session"];
type Leaderboards = ArcadeBootstrapResponse["leaderboards"];

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message?: string;
  };
  ok: boolean;
};

const emptyLeaderboards: Leaderboards = {
  runtime: [],
  "bug-maze": [],
  "code-snake": [],
  "stack-tetris": [],
};

async function readApiData<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !body.ok || !body.data) {
    throw new Error(body.error?.message || fallbackMessage);
  }

  return body.data;
}

export function useArcadeData() {
  const [status, setStatus] = useState<ArcadeLoadStatus>("idle");
  const [aliasStatus, setAliasStatus] = useState<AliasSaveStatus>("idle");
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [leaderboards, setLeaderboards] = useState<Leaderboards>(emptyLeaderboards);
  const [playerLeaderboard, setPlayerLeaderboard] = useState<PlayerLeaderboardResponse | null>(null);
  const [failedLeaderboards, setFailedLeaderboards] = useState<LabGameId[]>([]);

  const loadBootstrap = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await fetch("/api/arcade/bootstrap", {
        cache: "no-store",
      });
      const data = await readApiData<ArcadeBootstrapResponse>(response, "Arcade bootstrap failed.");

      setSession(data.session);
      setLeaderboards(data.leaderboards);
      setPlayerLeaderboard(data.playerLeaderboard);
      setFailedLeaderboards(data.partialFailures.leaderboards);
      setStatus(
        data.partialFailures.leaderboards.length > 0 || data.partialFailures.playerLeaderboard
          ? "partial"
          : "ready",
      );
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  const refreshGame = useCallback(async (game: LabGameId): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`/api/leaderboard?game=${game}&period=all&limit=3`, {
      cache: "no-store",
    });
    const data = await readApiData<LeaderboardResponse>(response, "Leaderboard refresh failed.");

    setLeaderboards((current) => ({
      ...current,
      [game]: data.leaderboard,
    }));
    setFailedLeaderboards((current) => current.filter((failedGame) => failedGame !== game));

    return data.leaderboard;
  }, []);

  const refreshPlayer = useCallback(async (): Promise<PlayerLeaderboardResponse> => {
    const response = await fetch("/api/leaderboard/me", {
      cache: "no-store",
    });
    const data = await readApiData<PlayerLeaderboardResponse>(response, "Player ranking refresh failed.");

    setPlayerLeaderboard(data);
    return data;
  }, []);

  const refreshAllLeaderboards = useCallback(async () => {
    const results = await Promise.allSettled(
      ARCADE_GAME_IDS.map(async (game) => [game, await refreshGame(game)] as const),
    );
    const failures = results.flatMap((result, index) =>
      result.status === "rejected" ? [ARCADE_GAME_IDS[index]] : [],
    );

    setFailedLeaderboards(failures);
    setStatus(failures.length > 0 ? "partial" : "ready");
  }, [refreshGame]);

  const saveAlias = useCallback(async (alias: string): Promise<PlayerSession> => {
    setAliasStatus("saving");

    try {
      const response = await fetch("/api/player-session", {
        body: JSON.stringify({ alias }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const updatedSession = await readApiData<PlayerSession>(response, "Alias update failed.");

      setSession(updatedSession);
      setPlayerLeaderboard((current) => current ? { ...current, alias: updatedSession.alias } : current);
      setAliasStatus("success");

      await Promise.allSettled([
        refreshPlayer(),
        refreshAllLeaderboards(),
      ]);

      return updatedSession;
    } catch (error) {
      setAliasStatus("error");
      throw error;
    }
  }, [refreshAllLeaderboards, refreshPlayer]);

  const submitScore = useCallback(async (payload: GameScorePayloadV2): Promise<{
    leaderboard: LeaderboardEntry[];
    player: PlayerLeaderboardResponse | null;
    result: ScoreSubmitResponse;
  }> => {
    const result = await submitLabScore(payload);
    const [leaderboardResult, playerResult] = await Promise.allSettled([
      refreshGame(payload.game),
      refreshPlayer(),
    ]);

    return {
      leaderboard: leaderboardResult.status === "fulfilled"
        ? leaderboardResult.value
        : leaderboards[payload.game],
      player: playerResult.status === "fulfilled" ? playerResult.value : playerLeaderboard,
      result,
    };
  }, [leaderboards, playerLeaderboard, refreshGame, refreshPlayer]);

  return {
    aliasStatus,
    failedLeaderboards,
    leaderboards,
    loadBootstrap,
    playerLeaderboard,
    refreshAllLeaderboards,
    refreshGame,
    saveAlias,
    session,
    status,
    submitScore,
  };
}
