"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import type { ArcadeBootstrapResponse } from "@/types/arcade-bootstrap";
import type { LabGameId, Locale, PlayerGameRanking } from "@/types/portfolio";

import { labGames, labV2Copy } from "./lab-v2-copy";
import styles from "./arcade-game-modal.module.css";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";

type LastResult = {
  game: LabGameId;
  rank: number | null;
  score: number;
};

type ArcadeGameModalProps = {
  activeGame: LabGameId;
  children: ReactNode;
  leaderboard: ArcadeBootstrapResponse["leaderboards"][LabGameId];
  lastResult: LastResult | null;
  locale: Locale;
  onClose: () => void;
  onRestart: () => void;
  onSelectGame: (game: LabGameId) => void;
  playerRanking: PlayerGameRanking | null;
  scoreStatus: ScoreStatus;
  sessionAlias: string | null;
};

function formatRank(rank: number | null, prefix: string) {
  return rank === null ? "—" : `${prefix}${rank}`;
}

export function ArcadeGameModal({
  activeGame,
  children,
  leaderboard,
  lastResult,
  locale,
  onClose,
  onRestart,
  onSelectGame,
  playerRanking,
  scoreStatus,
  sessionAlias,
}: ArcadeGameModalProps) {
  const copy = labV2Copy[locale];
  const selectedGame = labGames.find((game) => game.id === activeGame) ?? labGames[0];
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-labelledby="arcade-modal-title"
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <span>{copy.focusEyebrow}</span>
            <h2 id="arcade-modal-title">{selectedGame.title}</h2>
            <p>{copy.focusHint}</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.restartButton} onClick={onRestart} type="button">
              {copy.switchGame}
            </button>
            <button
              aria-label={copy.closeGame}
              className={styles.closeButton}
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >
              ×
            </button>
          </div>
        </header>

        <nav className={styles.gameTabs} aria-label={copy.gamesTitle}>
          {labGames.map((game, index) => (
            <button
              aria-current={game.id === activeGame ? "true" : undefined}
              data-active={game.id === activeGame}
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              type="button"
            >
              <b>0{index + 1}</b>
              <span>{game.title}</span>
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          <div className={styles.gameColumn}>
            <div className={styles.arena}>{children}</div>

            {scoreStatus !== "idle" ? (
              <div className={styles.feedback} data-tone={scoreStatus}>
                <span>
                  {scoreStatus === "syncing"
                    ? copy.submitting
                    : scoreStatus === "synced"
                      ? copy.submitted
                      : copy.submitFailed}
                </span>
                {lastResult?.game === activeGame ? (
                  <strong>
                    {lastResult.score} · {copy.position} {formatRank(lastResult.rank, copy.rankPrefix)}
                  </strong>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className={styles.rankingPanel} aria-label={`${copy.rankingTitle}: ${selectedGame.title}`}>
            <div className={styles.rankingHeader}>
              <div>
                <span>{copy.topPlayers}</span>
                <h3>{selectedGame.title}</h3>
              </div>
              <span className={styles.live}><i />LIVE</span>
            </div>

            {leaderboard.length > 0 ? (
              <ol className={styles.rankingList}>
                {leaderboard.map((entry, index) => (
                  <li key={`${entry.alias}-${entry.createdAt}`}>
                    <span className={styles.rankNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.rankAvatar}>{entry.alias.slice(0, 2).toUpperCase()}</span>
                    <strong>{entry.alias}</strong>
                    <b>{entry.score}</b>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.empty}>{copy.emptyRanking}</p>
            )}

            <div className={styles.personalRank}>
              <div>
                <span>{copy.yourResult}</span>
                <strong>{sessionAlias ?? copy.anonymous}</strong>
              </div>
              <div>
                <span>{copy.bestScore}</span>
                <strong>{playerRanking?.score ?? "—"}</strong>
              </div>
              <div>
                <span>{copy.position}</span>
                <strong>{formatRank(playerRanking?.rank ?? null, copy.rankPrefix)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
