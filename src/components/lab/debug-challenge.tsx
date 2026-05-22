"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { debugChallenges } from "@/content/challenges";
import { clampScore } from "@/lib/lab-score";
import type { Locale } from "@/types/portfolio";

type DebugChallengeProps = {
  locale: Locale;
  onComplete: (score: number) => void;
};

export function DebugChallenge({ locale, onComplete }: DebugChallengeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completedScore, setCompletedScore] = useState<number | null>(null);
  const currentChallenge = debugChallenges[currentIndex];
  const selectedOptionId = answers[currentChallenge.id];
  const selectedOption = currentChallenge.options.find((option) => option.id === selectedOptionId);

  const correctAnswers = useMemo(
    () =>
      debugChallenges.filter((challenge) => {
        const answerId = answers[challenge.id];
        return challenge.options.some((option) => option.id === answerId && option.isCorrect);
      }).length,
    [answers],
  );

  function handleSelect(optionId: string) {
    if (answers[currentChallenge.id]) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [currentChallenge.id]: optionId,
    }));
  }

  function handleNext() {
    if (currentIndex < debugChallenges.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    const score = clampScore((correctAnswers / debugChallenges.length) * 100);
    setCompletedScore(score);
    onComplete(score);
  }

  function handleRestart() {
    setAnswers({});
    setCurrentIndex(0);
    setCompletedScore(null);
  }

  const progressLabel =
    locale === "pt"
      ? `${currentIndex + 1} de ${debugChallenges.length}`
      : `${currentIndex + 1} of ${debugChallenges.length}`;

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge>{locale === "pt" ? "Depuração" : "Debugging"}</Badge>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">{locale === "pt" ? "Desafio de depuração" : "Debug Challenge"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {locale === "pt"
              ? "Escolha a correção mais segura para cada trecho. O código é apenas exibido; nada é executado."
              : "Choose the safest fix for each snippet. The code is only displayed; nothing is executed."}
          </p>
        </div>
        <Badge>{progressLabel}</Badge>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--text)]">{currentChallenge.title[locale]}</h3>
          <span className="text-sm text-[var(--muted)]">
            {correctAnswers}/{debugChallenges.length}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{currentChallenge.prompt[locale]}</p>

        <pre className="mt-5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm leading-6 text-[var(--text)]">
          <code>{currentChallenge.code}</code>
        </pre>

        <div className="mt-5 grid gap-3" role="group" aria-label={currentChallenge.prompt[locale]}>
          {currentChallenge.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isAnswered = Boolean(selectedOptionId);

            return (
              <button
                aria-pressed={isSelected}
                className={[
                  "rounded-xl border px-4 py-3 text-left text-sm leading-6 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  isSelected && option.isCorrect ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_18%,transparent)]" : "",
                  isSelected && !option.isCorrect ? "border-red-400 bg-red-500/10" : "",
                  !isSelected ? "border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-strong)]" : "",
                ].join(" ")}
                disabled={isAnswered}
                key={option.id}
                onClick={() => handleSelect(option.id)}
                type="button"
              >
                {option.label[locale]}
              </button>
            );
          })}
        </div>

        {selectedOption ? (
          <div aria-live="polite" className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-sm font-medium text-[var(--text)]">{selectedOption.feedback[locale]}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{currentChallenge.explanation[locale]}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            {completedScore === null
              ? locale === "pt"
                ? "A pontuação é calculada ao finalizar o último cenário."
                : "The score is calculated after the last scenario."
              : locale === "pt"
                ? `Pontuação final: ${completedScore}`
                : `Final score: ${completedScore}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {completedScore !== null ? (
              <Button onClick={handleRestart} variant="secondary">
                {locale === "pt" ? "Refazer" : "Retry"}
              </Button>
            ) : null}
            {completedScore === null ? (
              <Button disabled={!selectedOptionId} onClick={handleNext} variant="primary">
                {currentIndex < debugChallenges.length - 1 ? (locale === "pt" ? "Próximo" : "Next") : locale === "pt" ? "Finalizar" : "Finish"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
