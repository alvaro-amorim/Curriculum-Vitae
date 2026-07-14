"use client";

import dynamic from "next/dynamic";
import type { FormEvent, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { calculateSessionScore, initialLabScores } from "@/lib/lab-score";
import type { GameScorePayloadV2, LabGameId, PlayerLeaderboardResponse } from "@/types/portfolio";

import { ArcadeGameModal } from "./arcade-game-modal";
import { labGames, labV2Copy } from "./lab-v2-copy";
import styles from "./developer-lab-v2.module.css";
import { getDisplayLeaderboard } from "./mock-leaderboards";
import { useArcadeData } from "./use-arcade-data";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";

type ScoreStatusMap = Record<LabGameId, ScoreStatus>;

type LastResult = {
  game: LabGameId;
  rank: number | null;
  score: number;
};

const RuntimeRunner = dynamic(
  () => import("@/components/lab/runtime-runner").then((module) => module.RuntimeRunner),
  { loading: ArenaLoading, ssr: false },
);
const BugMaze = dynamic(
  () => import("@/components/lab/bug-maze").then((module) => module.BugMaze),
  { loading: ArenaLoading, ssr: false },
);
const CodeSnake = dynamic(
  () => import("@/components/lab/code-snake").then((module) => module.CodeSnake),
  { loading: ArenaLoading, ssr: false },
);
const StackTetris = dynamic(
  () => import("@/components/lab/stack-tetris").then((module) => module.StackTetris),
  { loading: ArenaLoading, ssr: false },
);

const rankingKeyByGame = {
  runtime: "runtime",
  "bug-maze": "bugMaze",
  "code-snake": "codeSnake",
  "stack-tetris": "stackTetris",
} as const satisfies Record<LabGameId, keyof PlayerLeaderboardResponse["rankings"]>;

const initialScoreStatus: ScoreStatusMap = {
  runtime: "idle",
  "bug-maze": "idle",
  "code-snake": "idle",
  "stack-tetris": "idle",
};

function ArenaLoading() {
  return (
    <div className={styles.arenaLoading} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function GameGlyph({ game }: { game: LabGameId }) {
  if (game === "runtime") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 23h22M7 20l5-5 4 3 8-9" />
        <path d="m20 9 4 0 0 4" />
      </svg>
    );
  }

  if (game === "bug-maze") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 6h8v8H9v9h7v3H6V6Zm12 0h8v20h-7v-8h4v-9h-5V6Z" />
      </svg>
    );
  }

  if (game === "code-snake") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M7 8h11a5 5 0 0 1 0 10h-6a3 3 0 0 0 0 6h13" />
        <circle cx="24" cy="24" r="2" />
        <circle cx="20" cy="11" r="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 5h8v8H6V5Zm10 0h10v8H16V5ZM6 15h12v6H6v-6Zm14 0h6v12h-6V15ZM6 23h12v4H6v-4Z" />
    </svg>
  );
}

function handlePointerMove(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

  event.currentTarget.style.setProperty("--arcade-pointer-x", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--arcade-pointer-y", `${(y * 100).toFixed(2)}%`);
}

function formatRank(rank: number | null, prefix: string) {
  return rank === null ? "—" : `${prefix}${rank}`;
}

export function DeveloperLabV2() {
  const { locale } = usePortfolioUi();
  const copy = labV2Copy[locale];
  const {
    aliasStatus,
    failedLeaderboards,
    leaderboards,
    loadBootstrap,
    playerLeaderboard,
    saveAlias,
    session,
    status,
    submitScore,
  } = useArcadeData();
  const [activeGame, setActiveGame] = useState<LabGameId | null>(null);
  const [rankingGame, setRankingGame] = useState<LabGameId>("runtime");
  const [aliasInput, setAliasInput] = useState("");
  const [aliasMessage, setAliasMessage] = useState("");
  const [scores, setScores] = useState(initialLabScores);
  const [scoreStatus, setScoreStatus] = useState<ScoreStatusMap>(initialScoreStatus);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [gameRunKey, setGameRunKey] = useState(0);

  useEffect(() => {
    if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Bootstrap data initializes the editable alias field after hydration.
      setAliasInput(session.alias ?? "");
    }
  }, [session]);

  const sessionScore = useMemo(() => calculateSessionScore(scores), [scores]);
  const completedGames = useMemo(
    () => Object.values(scores).filter((score) => score !== null).length,
    [scores],
  );
  const selectedRanking = playerLeaderboard?.rankings[rankingKeyByGame[rankingGame]] ?? null;
  const selectedRawLeaderboard = leaderboards[rankingGame];
  const selectedLeaderboard = getDisplayLeaderboard(rankingGame, selectedRawLeaderboard);
  const activeGameRanking = activeGame
    ? playerLeaderboard?.rankings[rankingKeyByGame[activeGame]] ?? null
    : null;
  const activeGameRawLeaderboard = activeGame ? leaderboards[activeGame] : [];
  const activeGameLeaderboard = activeGame ? getDisplayLeaderboard(activeGame, activeGameRawLeaderboard) : [];

  const openGame = useCallback((game: LabGameId) => {
    setActiveGame(game);
    setRankingGame(game);
    setLastResult(null);
  }, []);

  const closeGame = useCallback(() => {
    setActiveGame(null);
  }, []);

  const handleComplete = useCallback((payload: GameScorePayloadV2) => {
    setScores((current) => ({
      ...current,
      [payload.game]: payload.score,
    }));
    setScoreStatus((current) => ({
      ...current,
      [payload.game]: "syncing",
    }));
    setLastResult(null);

    void submitScore(payload)
      .then(({ player, result }) => {
        const ranking = player?.rankings[rankingKeyByGame[payload.game]];

        setScoreStatus((current) => ({
          ...current,
          [payload.game]: "synced",
        }));
        setLastResult({
          game: payload.game,
          rank: ranking?.rank ?? null,
          score: result.score,
        });
        setRankingGame(payload.game);
      })
      .catch(() => {
        setScoreStatus((current) => ({
          ...current,
          [payload.game]: "failed",
        }));
        setLastResult({
          game: payload.game,
          rank: null,
          score: payload.score,
        });
      });
  }, [submitScore]);

  const handleAliasSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const alias = aliasInput.trim();

    if (!alias) {
      setAliasMessage(copy.aliasError);
      return;
    }

    setAliasMessage("");

    try {
      await saveAlias(alias);
      setAliasMessage(copy.aliasSaved);
    } catch (error) {
      setAliasMessage(error instanceof Error ? error.message : copy.aliasError);
    }
  }, [aliasInput, copy.aliasError, copy.aliasSaved, saveAlias]);

  function renderActiveGame() {
    if (!activeGame) {
      return null;
    }

    const commonProps = {
      locale,
      onComplete: handleComplete,
    };

    if (activeGame === "runtime") {
      return <RuntimeRunner key={`runtime-${gameRunKey}`} {...commonProps} />;
    }

    if (activeGame === "bug-maze") {
      return <BugMaze key={`bug-maze-${gameRunKey}`} {...commonProps} />;
    }

    if (activeGame === "code-snake") {
      return <CodeSnake key={`code-snake-${gameRunKey}`} {...commonProps} />;
    }

    return <StackTetris key={`stack-tetris-${gameRunKey}`} {...commonProps} />;
  }

  return (
    <main className={styles.arcade} onPointerMove={handlePointerMove}>
      <div className={styles.ambientGrid} aria-hidden="true" />
      <div className={styles.shell}>
        <section className={styles.hero} aria-labelledby="arcade-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{copy.eyebrow}</span>
            <h1 id="arcade-title">{copy.title}</h1>
            <p>{copy.intro}</p>
            <div className={styles.heroBadges}>
              <span><i />{copy.live}</span>
              <span>{copy.persistent}</span>
              <span>{copy.uniqueRanking}</span>
            </div>
          </div>

          <aside className={styles.playerPanel} aria-labelledby="player-title">
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.eyebrow}>{copy.playerEyebrow}</span>
                <h2 id="player-title">{copy.playerTitle}</h2>
              </div>
              <span className={styles.playerAvatar} aria-hidden="true">
                {(session?.alias ?? copy.anonymous).slice(0, 2).toUpperCase()}
              </span>
            </div>
            <p>{copy.playerText}</p>

            <form className={styles.aliasForm} onSubmit={handleAliasSubmit}>
              <label htmlFor="arcade-alias">{copy.aliasLabel}</label>
              <div>
                <input
                  id="arcade-alias"
                  maxLength={session?.maxAliasLength ?? 24}
                  onChange={(event) => setAliasInput(event.target.value)}
                  placeholder={copy.aliasPlaceholder}
                  value={aliasInput}
                />
                <button disabled={aliasStatus === "saving" || status === "loading"} type="submit">
                  {aliasStatus === "saving" ? copy.savingAlias : copy.saveAlias}
                </button>
              </div>
              <small data-tone={aliasStatus === "error" ? "error" : "neutral"}>
                {aliasMessage || session?.alias || copy.anonymous}
              </small>
            </form>

            <div className={styles.playerStats}>
              <div>
                <span>{copy.sessionScore}</span>
                <strong>{sessionScore ?? "—"}</strong>
              </div>
              <div>
                <span>{copy.completedGames}</span>
                <strong>{completedGames}/4</strong>
              </div>
            </div>
          </aside>
        </section>

        {status === "loading" ? (
          <div className={styles.statusBanner} data-tone="loading">{copy.loading}</div>
        ) : null}
        {status === "partial" ? (
          <div className={styles.statusBanner} data-tone="warning">
            <span>{copy.partial}</span>
            <button type="button" onClick={() => void loadBootstrap()}>{copy.retry}</button>
          </div>
        ) : null}
        {status === "error" ? (
          <div className={styles.statusBanner} data-tone="error">
            <span>{copy.loadError}</span>
            <button type="button" onClick={() => void loadBootstrap()}>{copy.retry}</button>
          </div>
        ) : null}

        <section className={styles.gamesSection} aria-labelledby="games-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{copy.gamesEyebrow}</span>
              <h2 id="games-title">{copy.gamesTitle}</h2>
            </div>
            <p>{copy.gamesText}</p>
          </div>

          <div className={styles.gameGrid}>
            {labGames.map((game, index) => {
              const ranking = playerLeaderboard?.rankings[rankingKeyByGame[game.id]];
              const isActive = activeGame === game.id;
              const isFailed = failedLeaderboards.includes(game.id);

              return (
                <article className={styles.gameCard} data-active={isActive} key={game.id}>
                  <div className={styles.gameCardTop}>
                    <span className={styles.gameIndex}>0{index + 1}</span>
                    <span className={styles.gameGlyph}><GameGlyph game={game.id} /></span>
                    <span className={styles.gameCode}>{game.shortLabel}</span>
                  </div>
                  <h3>{game.title}</h3>
                  <p>{game.description[locale]}</p>
                  <div className={styles.controlLine}>
                    <span>{copy.controls}</span>
                    <strong>{game.controls[locale]}</strong>
                  </div>
                  <div className={styles.gameMetrics}>
                    <div>
                      <span>{copy.bestScore}</span>
                      <strong>{ranking?.score ?? copy.noScore}</strong>
                    </div>
                    <div>
                      <span>{copy.position}</span>
                      <strong>{isFailed ? "—" : formatRank(ranking?.rank ?? null, copy.rankPrefix)}</strong>
                    </div>
                  </div>
                  <button type="button" onClick={() => openGame(game.id)}>
                    <span>{isActive ? copy.activeGame : copy.openGame}</span>
                    <i aria-hidden="true">↗</i>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {activeGame ? (
          <ArcadeGameModal
            activeGame={activeGame}
            lastResult={lastResult}
            leaderboard={activeGameLeaderboard}
            locale={locale}
            onClose={closeGame}
            onRestart={() => setGameRunKey((current) => current + 1)}
            onSelectGame={openGame}
            playerRanking={activeGameRanking}
            scoreStatus={scoreStatus[activeGame]}
            sessionAlias={session?.alias ?? null}
          >
            {renderActiveGame()}
          </ArcadeGameModal>
        ) : null}

        <section className={styles.rankingSection} aria-labelledby="ranking-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{copy.rankingEyebrow}</span>
              <h2 id="ranking-title">{copy.rankingTitle}</h2>
            </div>
            <p>{copy.rankingText}</p>
          </div>

          <div className={styles.rankingLayout}>
            <div className={styles.rankingTabs} role="tablist" aria-label={copy.rankingTitle}>
              {labGames.map((game) => (
                <button
                  aria-selected={rankingGame === game.id}
                  data-active={rankingGame === game.id}
                  key={game.id}
                  onClick={() => setRankingGame(game.id)}
                  role="tab"
                  type="button"
                >
                  <GameGlyph game={game.id} />
                  <span>{game.title}</span>
                </button>
              ))}
            </div>

            <div className={styles.leaderboardCard} role="tabpanel">
              <div className={styles.leaderboardHeader}>
                <div>
                  <span>{copy.topPlayers}</span>
                  <h3>{labGames.find((game) => game.id === rankingGame)?.title}</h3>
                </div>
                <span className={styles.liveDot}><i />{copy.liveRanking}</span>
              </div>

              {selectedLeaderboard.length > 0 ? (
                <ol className={styles.leaderboardList}>
                  {selectedLeaderboard.map((entry, index) => (
                    <li key={`${entry.alias}-${entry.createdAt}`}>
                      <span className={styles.rankNumber}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.rankAvatar}>{entry.alias.slice(0, 2).toUpperCase()}</span>
                      <strong>{entry.alias}</strong>
                      <b>{entry.score}</b>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.emptyRanking}>{copy.emptyRanking}</p>
              )}

              <div className={styles.personalRank}>
                <div>
                  <span>{copy.yourResult}</span>
                  <strong>{session?.alias ?? copy.anonymous}</strong>
                </div>
                <div>
                  <span>{copy.bestScore}</span>
                  <strong>{selectedRanking?.score ?? "—"}</strong>
                </div>
                <div>
                  <span>{copy.position}</span>
                  <strong>{formatRank(selectedRanking?.rank ?? null, copy.rankPrefix)}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
