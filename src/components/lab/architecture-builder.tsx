"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { architectureChallenge } from "@/content/challenges";
import { clampScore } from "@/lib/lab-score";
import type { ArchitectureBlock, Locale } from "@/types/portfolio";

type ArchitectureBuilderProps = {
  locale: Locale;
  onComplete: (score: number) => void;
};

function blockTone(block: ArchitectureBlock, selected: boolean) {
  if (!selected) {
    return "border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-strong)]";
  }

  if (block.role === "unsafe") {
    return "border-red-400 bg-red-500/10";
  }

  if (block.role === "bonus") {
    return "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]";
  }

  return "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_16%,transparent)]";
}

export function ArchitectureBuilder({ locale, onComplete }: ArchitectureBuilderProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(() => new Set());
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);

  const groups = useMemo(
    () => ({
      required: architectureChallenge.blocks.filter((block) => block.role === "required"),
      bonus: architectureChallenge.blocks.filter((block) => block.role === "bonus"),
      unsafe: architectureChallenge.blocks.filter((block) => block.role === "unsafe"),
    }),
    [],
  );

  function toggleBlock(blockId: string) {
    setResult(null);
    setSelectedBlocks((current) => {
      const next = new Set(current);

      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }

      return next;
    });
  }

  function evaluate() {
    if (selectedBlocks.size === 0) {
      const score = 0;
      const feedback = [
        locale === "pt"
          ? "Selecione pelo menos os blocos essenciais antes de avaliar a arquitetura."
          : "Select at least the essential blocks before evaluating the architecture.",
      ];

      setResult({ score, feedback });
      onComplete(score);
      return;
    }

    const selectedRequired = groups.required.filter((block) => selectedBlocks.has(block.id));
    const selectedBonus = groups.bonus.filter((block) => selectedBlocks.has(block.id));
    const selectedUnsafe = groups.unsafe.filter((block) => selectedBlocks.has(block.id));
    const missingRequired = groups.required.filter((block) => !selectedBlocks.has(block.id));

    const requiredScore = (selectedRequired.length / groups.required.length) * 70;
    const bonusScore = (selectedBonus.length / groups.bonus.length) * 20;
    const safetyScore = selectedUnsafe.length === 0 ? 10 : Math.max(0, 10 - selectedUnsafe.length * 10);
    const score = clampScore(requiredScore + bonusScore + safetyScore);
    const feedback = [
      ...selectedRequired.map((block) => block.feedback[locale]),
      ...missingRequired.map((block) =>
        locale === "pt" ? `Faltou incluir ${block.label[locale]} para cobrir o fluxo principal.` : `Missing ${block.label[locale]} for the main flow.`,
      ),
      ...selectedBonus.map((block) => block.feedback[locale]),
      ...selectedUnsafe.map((block) => block.feedback[locale]),
    ];

    setResult({ score, feedback });
    onComplete(score);
  }

  function reset() {
    setSelectedBlocks(new Set());
    setResult(null);
  }

  return (
    <section className="grid gap-5">
      <div>
        <Badge>{locale === "pt" ? "Arquitetura" : "Architecture"}</Badge>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">{architectureChallenge.title[locale]}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{architectureChallenge.scenario[locale]}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--text)]">{locale === "pt" ? "Blocos disponíveis" : "Available blocks"}</h3>
            <Badge>{selectedBlocks.size}</Badge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {architectureChallenge.blocks.map((block) => {
              const selected = selectedBlocks.has(block.id);

              return (
                <button
                  aria-pressed={selected}
                  className={`rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${blockTone(block, selected)}`}
                  key={block.id}
                  onClick={() => toggleBlock(block.id)}
                  type="button"
                >
                  <span className="block text-sm font-semibold text-[var(--text)]">{block.label[locale]}</span>
                  <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">{block.description[locale]}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={evaluate} variant="primary">
              {locale === "pt" ? "Avaliar arquitetura" : "Evaluate architecture"}
            </Button>
            <Button onClick={reset} variant="secondary">
              {locale === "pt" ? "Limpar" : "Clear"}
            </Button>
          </div>
        </div>

        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">{locale === "pt" ? "Critérios" : "Criteria"}</h3>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
            <li>{locale === "pt" ? "Client não acessa banco direto." : "Client does not access the database directly."}</li>
            <li>{locale === "pt" ? "API/server protege operações sensíveis." : "API/server protects sensitive operations."}</li>
            <li>{locale === "pt" ? "Auth protege recursos privados." : "Auth protects private resources."}</li>
            <li>{locale === "pt" ? "Chaves de IA ficam server-side." : "AI keys stay server-side."}</li>
            <li>{locale === "pt" ? "Cache e fila são bônus, não requisitos." : "Cache and queue are bonuses, not requirements."}</li>
          </ul>

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
          ) : (
            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              {locale === "pt"
                ? "Selecione os blocos que fazem sentido para o cenário e avalie."
                : "Select the blocks that make sense for the scenario and evaluate."}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
