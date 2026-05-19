"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { latencyChallenge } from "@/content/challenges";
import { clampScore } from "@/lib/lab-score";
import type { Locale, LatencyOption } from "@/types/portfolio";

type ApiLatencyGameProps = {
  locale: Locale;
  onComplete: (score: number) => void;
};

function optionTone(option: LatencyOption, selected: boolean) {
  if (!selected) {
    return "border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-strong)]";
  }

  return option.impact === "positive"
    ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_16%,transparent)]"
    : "border-red-400 bg-red-500/10";
}

export function ApiLatencyGame({ locale, onComplete }: ApiLatencyGameProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(() => new Set());
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);

  const optionGroups = useMemo(
    () => ({
      positive: latencyChallenge.options.filter((option) => option.impact === "positive"),
      negative: latencyChallenge.options.filter((option) => option.impact === "negative"),
    }),
    [],
  );

  function toggleOption(optionId: string) {
    setResult(null);
    setSelectedOptions((current) => {
      const next = new Set(current);

      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }

      return next;
    });
  }

  function evaluate() {
    if (selectedOptions.size === 0) {
      const score = 0;
      const feedback = [
        locale === "pt"
          ? "Selecione pelo menos uma melhoria para avaliar impacto de performance."
          : "Select at least one improvement before evaluating performance impact.",
      ];

      setResult({ score, feedback });
      onComplete(score);
      return;
    }

    const selectedPositive = optionGroups.positive.filter((option) => selectedOptions.has(option.id));
    const selectedNegative = optionGroups.negative.filter((option) => selectedOptions.has(option.id));
    const missedPositive = optionGroups.positive.filter((option) => !selectedOptions.has(option.id));
    const positiveScore = (selectedPositive.length / optionGroups.positive.length) * 80;
    const safetyScore = selectedNegative.length === 0 ? 20 : Math.max(0, 20 - selectedNegative.length * 12);
    const score = clampScore(positiveScore + safetyScore);
    const feedback = [
      ...selectedPositive.map((option) => option.feedback[locale]),
      ...missedPositive.slice(0, 2).map((option) =>
        locale === "pt" ? `Também valia considerar: ${option.label[locale]}.` : `Also worth considering: ${option.label[locale]}.`,
      ),
      ...selectedNegative.map((option) => option.feedback[locale]),
    ];

    setResult({ score, feedback });
    onComplete(score);
  }

  function reset() {
    setSelectedOptions(new Set());
    setResult(null);
  }

  return (
    <section className="grid gap-5">
      <div>
        <Badge>{locale === "pt" ? "Performance" : "Performance"}</Badge>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">{latencyChallenge.title[locale]}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{latencyChallenge.scenario[locale]}</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--text)]">{locale === "pt" ? "Escolha as melhorias" : "Choose improvements"}</h3>
          <Badge>{selectedOptions.size}</Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {latencyChallenge.options.map((option) => {
            const selected = selectedOptions.has(option.id);

            return (
              <button
                aria-pressed={selected}
                className={`rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${optionTone(option, selected)}`}
                key={option.id}
                onClick={() => toggleOption(option.id)}
                type="button"
              >
                <span className="block text-sm font-semibold text-[var(--text)]">{option.label[locale]}</span>
                <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">{option.description[locale]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={evaluate} variant="primary">
            {locale === "pt" ? "Calcular impacto" : "Calculate impact"}
          </Button>
          <Button onClick={reset} variant="secondary">
            {locale === "pt" ? "Limpar" : "Clear"}
          </Button>
        </div>

        {result ? (
          <div aria-live="polite" className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-sm font-semibold text-[var(--text)]">
              {locale === "pt" ? "Pontuação" : "Score"}: {result.score}
            </p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted)]">
              {result.feedback.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
