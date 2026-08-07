"use client";

import dynamic from "next/dynamic";
import type { FormEvent, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { calculateSessionScore, initialLabScores } from "@/lib/lab-score";
import type { GameScorePayloadV2, LabGameId, PlayerLeaderboardResponse } from "@/types/portfolio";

import { ArcadeGameModal } from "./arcade-game-modal";
import { labGames, labV2Copy } from "./lab-v2-copy";
import styles from "./developer-lab-v2.module.css";
import { useArcadeData } from "./use-arcade-data";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";

type ScoreStatusMap = Record<LabGameId, ScoreStatus>;

type LastResult = {
  game: LabGameId;
  rank: number | null;
  score: number;
};

type AliasDialogProps = {
  aliasInput: string;
  aliasMessage: string;
  aliasStatus: "idle" | "saving" | "success" | "error";
  copy: (typeof labV2Copy)["pt"] | (typeof labV2Copy)["en"];
  maxLength: number;
  pendingGame: LabGameId | null;
  onAliasChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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
        <path d="M4 23h24M6 20l6-6 4 4 9-11" />
        <path d="m21 7 4 0 0 4" />
      </svg>
    );
  }

  if (game === "bug-maze") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 5h9v8H9v10h7v4H5V5Zm13 0h9v22h-8v-8h4V9h-5V5Z" />
      </svg>
    );
  }

  if (game === "code-snake") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 8h12a5 5 0 0 1 0 10h-6a3 3 0 0 0 0 6h13" />
        <circle cx="24" cy="24" r="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 5h9v9H5V5Zm11 0h11v9H16V5ZM5 16h13v6H5v-6Zm15 0h7v11h-7V16ZM5 24h13v3H5v-3Z" />
    </svg>
  );
}

function ArenaArtwork({ game }: { game: LabGameId }) {
  if (game === "runtime") {
    return (
      <svg viewBox="0 0 160 92" aria-hidden="true">
        <path className={styles.artworkGrid} d="M10 70H150M22 55H138M34 40H126" />
        <path className={styles.artworkPrimary} d="M12 69c26 0 29-28 51-28 19 0 22 18 39 18 18 0 21-31 46-31" />
        <circle className={styles.artworkNode} cx="35" cy="57" r="5" />
        <circle className={styles.artworkNode} cx="81" cy="49" r="5" />
        <path className={styles.artworkAccent} d="m119 20 20 10-20 10 5-10-5-10Z" />
        <path className={styles.artworkSpark} d="m71 23 7 8-5 2 6 8" />
      </svg>
    );
  }

  if (game === "bug-maze") {
    return (
      <svg viewBox="0 0 160 92" aria-hidden="true">
        <path className={styles.artworkGrid} d="M18 18h48v17H37v39h41V55h31V31h33v43h-23" />
        <path className={styles.artworkGrid} d="M79 18v22h23V18M17 51h18M111 49h30" />
        <circle className={styles.artworkAccent} cx="82" cy="55" r="13" />
        <path className={styles.artworkPrimary} d="M75 55h14M82 48v14M72 45l7 5M92 45l-7 5M72 65l7-5M92 65l-7-5" />
        <circle className={styles.artworkNode} cx="18" cy="18" r="4" />
        <circle className={styles.artworkNode} cx="119" cy="74" r="4" />
      </svg>
    );
  }

  if (game === "code-snake") {
    return (
      <svg viewBox="0 0 160 92" aria-hidden="true">
        <path className={styles.artworkGrid} d="M18 20h124M18 46h124M18 72h124M40 10v72M68 10v72M96 10v72M124 10v72" />
        <path className={styles.artworkPrimary} d="M24 62c17 0 12-31 31-31 18 0 13 28 32 28 20 0 16-36 37-36 10 0 15 6 15 14" />
        <circle className={styles.artworkAccent} cx="139" cy="42" r="8" />
        <circle className={styles.artworkNode} cx="24" cy="62" r="5" />
        <circle className={styles.artworkNode} cx="56" cy="32" r="5" />
        <circle className={styles.artworkNode} cx="88" cy="58" r="5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 92" aria-hidden="true">
      <rect className={styles.artworkBlock} x="22" y="52" width="28" height="20" rx="4" />
      <rect className={styles.artworkBlock} x="52" y="52" width="28" height="20" rx="4" />
      <rect className={styles.artworkAccent} x="82" y="52" width="28" height="20" rx="4" />
      <rect className={styles.artworkBlock} x="112" y="52" width="28" height="20" rx="4" />
      <rect className={styles.artworkBlock} x="52" y="30" width="28" height="20" rx="4" />
      <rect className={styles.artworkBlock} x="82" y="30" width="28" height="20" rx="4" />
      <rect className={styles.artworkAccent} x="82" y="8" width="28" height="20" rx="4" />
      <path className={styles.artworkPrimary} d="M16 78h130" />
    </svg>
  );
}

function AliasDialog({
  aliasInput,
  aliasMessage,
  aliasStatus,
  copy,
  maxLength,
  pendingGame,
  onAliasChange,
  onClose,
  onSubmit,
}: AliasDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const pendingTitle = pendingGame
    ? labGames.find((game) => game.id === pendingGame)?.title
    : null;

  return (
    <dialog
      aria-labelledby="arcade-alias-title"
      className={styles.aliasDialog}
      onCancel={(event) => {
        event.preventDefault();
        if (aliasStatus !== "saving") onClose();
      }}
      ref={dialogRef}
    >
      <form method="dialog" onSubmit={onSubmit}>
        <div className={styles.aliasDialogHeader}>
          <span className={styles.eyebrow}>{copy.aliasGateEyebrow}</span>
          <button
            aria-label={copy.aliasGateCancel}
            disabled={aliasStatus === "saving"}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <h2 id="arcade-alias-title">{copy.aliasGateTitle}</h2>
        <p>
          {pendingTitle ? `${copy.aliasGateText} ${pendingTitle}.` : copy.aliasEditText}
        </p>
        <label htmlFor="arcade-alias-dialog">{copy.aliasLabel}</label>
        <input
          autoFocus
          id="arcade-alias-dialog"
          maxLength={maxLength}
          onChange={(event) => onAliasChange(event.target.value)}
          placeholder={copy.aliasPlaceholder}
          value={aliasInput}
        />
        <small data-tone={aliasStatus === "error" ? "error" : "neutral"}>
          {aliasMessage || copy.aliasGateHint}
        </small>
        <div className={styles.aliasDialogActions}>
          <button disabled={aliasStatus === "saving"} onClick={onClose} type="button">
            {copy.aliasGateCancel}
          </button>
          <button disabled={aliasStatus === "saving"} type="submit">
            {aliasStatus === "saving"
              ? copy.savingAlias
              : pendingGame
                ? copy.aliasGateContinue
                : copy.aliasGateSave}
          </button>
        </div>
      </form>
    </dialog>
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
  const [aliasDialogOpen, setAliasDialogOpen] = useState(false);
  const [pendingGame, setPendingGame] = useState<LabGameId | null>(null);
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
  const bestRank = useMemo(() => {
    if (!playerLeaderboard) return null;
    const ranks = Object.values(playerLeaderboard.rankings)
      .map((ranking) => ranking.rank)
      .filter((rank): rank is number => rank !== null);
    return ranks.length > 0 ? Math.min(...ranks) : null;
  }, [playerLeaderboard]);

  const selectedRanking = playerLeaderboard?.rankings[rankingKeyByGame[rankingGame]] ?? null;
  const selectedLeaderboard = leaderboards[rankingGame].slice(0, 3);
  const activeGameRanking = activeGame
    ? playerLeaderboard?.rankings[rankingKeyByGame[activeGame]] ?? null
    : null;
  const activeGameLeaderboard = activeGame ? leaderboards[activeGame].slice(0, 3) : [];

  const openGame = useCallback((game: LabGameId) => {
    setActiveGame(game);
    setRankingGame(game);
    setLastResult(null);
  }, []);

  const requestOpenGame = useCallback((game: LabGameId) => {
    if (session?.alias?.trim()) {
      openGame(game);
      return;
    }

    setPendingGame(game);
    setAliasMessage("");
    setAliasDialogOpen(true);
  }, [openGame, session?.alias]);

  const openAliasEditor = useCallback(() => {
    setPendingGame(null);
    setAliasMessage("");
    setAliasInput(session?.alias ?? "");
    setAliasDialogOpen(true);
  }, [session?.alias]);

  const closeAliasDialog = useCallback(() => {
    if (aliasStatus === "saving") return;
    setAliasDialogOpen(false);
    setPendingGame(null);
    setAliasMessage("");
    setAliasInput(session?.alias ?? "");
  }, [aliasStatus, session?.alias]);

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
      setAliasMessage(copy.aliasRequired);
      return;
    }

    setAliasMessage("");

    try {
      await saveAlias(alias);
      const gameToOpen = pendingGame;
      setAliasDialogOpen(false);
      setPendingGame(null);
      setAliasMessage("");

      if (gameToOpen) {
        openGame(gameToOpen);
      }
    } catch (error) {
      setAliasMessage(error instanceof Error ? error.message : copy.aliasError);
    }
  }, [aliasInput, copy.aliasError, copy.aliasRequired, openGame, pendingGame, saveAlias]);

  function renderActiveGame() {
    if (!activeGame) return null;

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
        <section className={styles.arenaDeck} aria-labelledby="arcade-title">
          <header className={styles.arcadeHeader}>
            <div className={styles.arcadeIdentity}>
              <span className={styles.eyebrow}>{copy.eyebrow}</span>
              <h1 id="arcade-title">{copy.gamesTitle}</h1>
              <p>{copy.gamesText}</p>
            </div>

            <aside className={styles.playerDock} aria-label={copy.playerTitle}>
              <div className={styles.playerIdentity}>
                <span className={styles.playerAvatar} aria-hidden="true">
                  {(session?.alias ?? copy.anonymous).slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <span>{copy.playerEyebrow}</span>
                  <strong>{session?.alias ?? copy.noAlias}</strong>
                </div>
                <button onClick={openAliasEditor} type="button">
                  {session?.alias ? copy.editAlias : copy.setAlias}
                </button>
              </div>
              <div className={styles.playerStats}>
                <div>
                  <span>{copy.sessionScore}</span>
                  <strong>{sessionScore ?? "—"}</strong>
                </div>
                <div>
                  <span>{copy.completedGames}</span>
                  <strong>{completedGames}/4</strong>
                </div>
                <div>
                  <span>{copy.bestPosition}</span>
                  <strong>{formatRank(bestRank, copy.rankPrefix)}</strong>
                </div>
              </div>
            </aside>
          </header>

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

          <div className={styles.gameGrid}>
            {labGames.map((game, index) => {
              const ranking = playerLeaderboard?.rankings[rankingKeyByGame[game.id]];
              const isActive = activeGame === game.id;
              const isFailed = failedLeaderboards.includes(game.id);

              return (
                <article
                  className={styles.gameCard}
                  data-active={isActive}
                  data-game={game.id}
                  key={game.id}
                >
                  <div className={styles.arenaArtwork} data-game={game.id}>
                    <div className={styles.artworkBadge}>
                      <span>0{index + 1}</span>
                      <b>{game.shortLabel}</b>
                    </div>
                    <ArenaArtwork game={game.id} />
                  </div>

                  <div className={styles.gameCardBody}>
                    <div className={styles.gameTitleRow}>
                      <span className={styles.gameGlyph}><GameGlyph game={game.id} /></span>
                      <h2>{game.title}</h2>
                    </div>
                    <p>{game.description[locale]}</p>

                    <div className={styles.controlLine}>
                      <span>{copy.controls}</span>
                      <strong>{game.controls[locale]}</strong>
                    </div>

                    <div className={styles.gameFooter}>
                      <div className={styles.gameMetrics}>
                        <div>
                          <span>{copy.bestScore}</span>
                          <strong>{ranking?.score ?? copy.noScoreShort}</strong>
                        </div>
                        <div>
                          <span>{copy.position}</span>
                          <strong>{isFailed ? "—" : formatRank(ranking?.rank ?? null, copy.rankPrefix)}</strong>
                        </div>
                      </div>
                      <button
                        disabled={status === "loading"}
                        onClick={() => requestOpenGame(game.id)}
                        type="button"
                      >
                        <span>{isActive ? copy.activeGame : copy.openGame}</span>
                        <i aria-hidden="true">↗</i>
                      </button>
                    </div>
                  </div>
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
            onSelectGame={requestOpenGame}
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
                <span className={styles.liveDot}><i />{copy.realRanking}</span>
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

              <div className={styles.personalRank} data-has-score={selectedRanking?.rank !== null}>
                <div>
                  <span>{copy.yourResult}</span>
                  <strong>{session?.alias ?? copy.noAlias}</strong>
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
              <p className={styles.rankExplanation}>{copy.rankExplanation}</p>
            </div>
          </div>
        </section>
      </div>

      {aliasDialogOpen ? (
        <AliasDialog
          aliasInput={aliasInput}
          aliasMessage={aliasMessage}
          aliasStatus={aliasStatus}
          copy={copy}
          maxLength={session?.maxAliasLength ?? 24}
          onAliasChange={setAliasInput}
          onClose={closeAliasDialog}
          onSubmit={handleAliasSubmit}
          pendingGame={pendingGame}
        />
      ) : null}
    </main>
  );
}
