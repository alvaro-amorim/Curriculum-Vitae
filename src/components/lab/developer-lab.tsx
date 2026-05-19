"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { ApiLatencyGame } from "@/components/lab/api-latency-game";
import { ArchitectureBuilder } from "@/components/lab/architecture-builder";
import { DebugChallenge } from "@/components/lab/debug-challenge";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { labPageCopy } from "@/content/challenges";
import { calculateSessionScore, initialLabScores, submitLabScore } from "@/lib/lab-score";
import type { LabGameId } from "@/types/portfolio";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";

const games: {
  id: LabGameId;
  title: string;
  description: Record<"pt" | "en", string>;
}[] = [
  {
    id: "debug",
    title: "Debug Challenge",
    description: {
      pt: "Raciocínio de depuração em JavaScript, React e chamadas HTTP.",
      en: "Debugging reasoning in JavaScript, React, and HTTP calls.",
    },
  },
  {
    id: "architecture",
    title: "Architecture Builder",
    description: {
      pt: "Escolhas de arquitetura segura para um SaaS moderno.",
      en: "Safe architecture choices for a modern SaaS.",
    },
  },
  {
    id: "latency",
    title: "API Latency Game",
    description: {
      pt: "Decisões práticas para reduzir latência e carga desnecessária.",
      en: "Practical decisions to reduce latency and unnecessary load.",
    },
  },
];

export function DeveloperLab() {
  const { locale, t } = usePortfolioUi();
  const [activeGame, setActiveGame] = useState<LabGameId>("debug");
  const [scores, setScores] = useState(initialLabScores);
  const [scoreStatus, setScoreStatus] = useState<Record<LabGameId, ScoreStatus>>({
    debug: "idle",
    architecture: "idle",
    latency: "idle",
  });

  const sessionScore = useMemo(() => calculateSessionScore(scores), [scores]);

  const handleComplete = useCallback((game: LabGameId, score: number) => {
    setScores((current) => ({
      ...current,
      [game]: score,
    }));
    setScoreStatus((current) => ({
      ...current,
      [game]: "syncing",
    }));

    void submitLabScore(game, score)
      .then(() => {
        setScoreStatus((current) => ({
          ...current,
          [game]: "synced",
        }));
      })
      .catch(() => {
        setScoreStatus((current) => ({
          ...current,
          [game]: "failed",
        }));
      });
  }, []);

  function statusLabel(game: LabGameId) {
    const score = scores[game];

    if (score === null) {
      return labPageCopy.pending[locale];
    }

    return `${labPageCopy.completed[locale]}: ${score}`;
  }

  function apiStatusLabel(game: LabGameId) {
    const status = scoreStatus[game];

    if (scores[game] === null) {
      return "";
    }

    if (status === "synced") {
      return labPageCopy.apiSynced[locale];
    }

    if (status === "failed") {
      return labPageCopy.apiFailed[locale];
    }

    return labPageCopy.apiPending[locale];
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:py-12">
      <section className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <div className="interactive-surface rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] md:p-10">
          <Badge>{t.home.currentPhase}</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[var(--text)] md:text-6xl">{labPageCopy.title[locale]}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)]">{labPageCopy.description[locale]}</p>

          <nav className="mt-8 flex flex-wrap gap-3" aria-label={labPageCopy.backLinksLabel[locale]}>
            <Link className={buttonClassName("secondary")} href="/">
              {t.nav.home}
            </Link>
            <Link className={buttonClassName("secondary")} href="/curriculo">
              {t.nav.resume}
            </Link>
            <Link className={buttonClassName("secondary")} href="/projetos">
              {t.nav.projects}
            </Link>
          </nav>
        </div>

        <aside className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">{labPageCopy.sessionScore[locale]}</span>
          <p aria-live="polite" className="mt-4 text-5xl font-semibold text-[var(--text)]">
            {sessionScore === null ? "--" : sessionScore}
          </p>
          <div className="mt-6 grid gap-3">
            {games.map((game) => (
              <button
                aria-pressed={activeGame === game.id}
                className={[
                  "rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  activeGame === game.id ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]" : "border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-strong)]",
                ].join(" ")}
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                type="button"
              >
                <span className="block text-sm font-semibold text-[var(--text)]">{game.title}</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{game.description[locale]}</span>
                <span className="mt-3 block text-xs font-medium text-[var(--accent)]">{statusLabel(game.id)}</span>
                {apiStatusLabel(game.id) ? <span className="mt-1 block text-xs text-[var(--muted-soft)]">{apiStatusLabel(game.id)}</span> : null}
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 md:p-6">
        {activeGame === "debug" ? <DebugChallenge locale={locale} onComplete={(score) => handleComplete("debug", score)} /> : null}
        {activeGame === "architecture" ? <ArchitectureBuilder locale={locale} onComplete={(score) => handleComplete("architecture", score)} /> : null}
        {activeGame === "latency" ? <ApiLatencyGame locale={locale} onComplete={(score) => handleComplete("latency", score)} /> : null}
      </section>
    </main>
  );
}
