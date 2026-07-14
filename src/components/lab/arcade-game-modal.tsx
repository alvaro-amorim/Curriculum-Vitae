"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { usePortfolioUi } from "@/components/layout/app-shell";
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

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function formatRank(rank: number | null, prefix: string) {
  return rank === null ? "—" : `${prefix}${rank}`;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    const styles = window.getComputedStyle(element);
    return element.getClientRects().length > 0 && styles.visibility !== "hidden" && styles.display !== "none";
  });
}

function ModalIcon({ name }: { name: "globe" | "moon" | "sun" }) {
  const common = { "aria-hidden": true, focusable: false, viewBox: "0 0 24 24" };

  if (name === "globe") {
    return (
      <svg {...common}>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-8-9h16M12 3c2.3 2.4 3.4 5.4 3.4 9S14.3 18.6 12 21c-2.3-2.4-3.4-5.4-3.4-9S9.7 5.4 12 3Z" />
      </svg>
    );
  }

  if (name === "sun") {
    return (
      <svg {...common}>
        <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m14.2 14.2-1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M20 15.5A8.2 8.2 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
    </svg>
  );
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
  const { setLocale, theme, toggleTheme } = usePortfolioUi();
  const copy = labV2Copy[locale];
  const selectedGame = labGames.find((game) => game.id === activeGame) ?? labGames[0];
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyPaddingRight = body.style.paddingRight;

    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : previousBodyPaddingRight;
    body.dataset.arcadeModalOpen = "true";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function focusFirstElement() {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const first = getFocusableElements(dialog)[0];
      (first ?? dialog).focus();
    }

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
      if (!dialog) return;

      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (!(activeElement instanceof Node) || !dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleFocusIn(event: FocusEvent) {
      const dialog = dialogRef.current;
      const target = event.target;

      if (!dialog || !(target instanceof Node) || dialog.contains(target)) {
        return;
      }

      focusFirstElement();
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.paddingRight = previousBodyPaddingRight;
      delete body.dataset.arcadeModalOpen;
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      window.scrollTo(scrollX, scrollY);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
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
        tabIndex={-1}
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <span>{copy.focusEyebrow}</span>
            <h2 id="arcade-modal-title">{selectedGame.title}</h2>
            <p id="arcade-modal-description">{copy.focusHint}</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.modalControls} aria-label={locale === "pt" ? "Preferencias do modal" : "Modal preferences"}>
              <button
                aria-label={locale === "pt" ? "Alternar tema" : "Toggle theme"}
                aria-pressed={theme === "light"}
                className={styles.themeButton}
                data-theme-state={theme}
                onClick={toggleTheme}
                type="button"
              >
                <ModalIcon name="sun" />
                <span>{theme === "dark" ? "Dark" : "Light"}</span>
                <ModalIcon name="moon" />
              </button>
              <div className={styles.localeSwitch} aria-label={locale === "pt" ? "Selecionar idioma" : "Select language"}>
                <ModalIcon name="globe" />
                <button aria-pressed={locale === "pt"} onClick={() => setLocale("pt")} type="button">
                  PT
                </button>
                <button aria-pressed={locale === "en"} onClick={() => setLocale("en")} type="button">
                  EN
                </button>
              </div>
            </div>
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
            <div className={styles.arena} data-lab-game-arena="true">
              {children}
            </div>

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
              <span className={styles.live}><i />{copy.liveRanking}</span>
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
    </div>,
    document.body,
  );
}
