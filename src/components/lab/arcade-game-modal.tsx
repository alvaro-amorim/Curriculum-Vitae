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
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollY = window.scrollY;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;
    const previousBodyPaddingRight = body.style.paddingRight;

    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : previousBodyPaddingRight;
    body.dataset.arcadeModalOpen = "true";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusable || focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;
      body.style.paddingRight = previousBodyPaddingRight;
      delete body.dataset.arcadeModalOpen;
      window.removeEventListener("keydown", handleKeyDown);
      window.scrollTo(0, scrollY);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-describedby="arcade-modal-description"
        aria-labelledby="arcade-modal-title"
        aria-modal="true"
        className={styles.dialog}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <span>{copy.focusEyebrow}</span>
            <h2 id="arcade-modal-title">{selectedGame.title}</h2>
            <p id="arcade-modal-description">{copy.focusHint}</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.restartButton} onClick={onRestart} type="button">
              {copy.restartGame}
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
