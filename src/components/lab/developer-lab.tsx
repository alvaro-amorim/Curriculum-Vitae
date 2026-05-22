"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { ApiLatencyGame } from "@/components/lab/api-latency-game";
import { ArchitectureBuilder } from "@/components/lab/architecture-builder";
import { DebugChallenge } from "@/components/lab/debug-challenge";
import { RuntimeRunner } from "@/components/lab/runtime-runner";
import { labPageCopy } from "@/content/challenges";
import { calculateSessionScore, initialLabScores, submitLabScore } from "@/lib/lab-score";
import type { LabGameId } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";
type FoundationGameId = Exclude<LabGameId, "runtime">;

const foundationModules: {
  id: FoundationGameId;
  title: Record<"pt" | "en", string>;
  description: Record<"pt" | "en", string>;
}[] = [
  {
    id: "debug",
    title: {
      pt: "Desafio de depuração",
      en: "Debug Challenge",
    },
    description: {
      pt: "Treino de depuração em JavaScript, React e chamadas HTTP. Útil como foundation, não como mini-game final.",
      en: "Debugging training in JavaScript, React, and HTTP calls. Useful as foundation, not as a final mini-game.",
    },
  },
  {
    id: "architecture",
    title: {
      pt: "Construtor de arquitetura",
      en: "Architecture Builder",
    },
    description: {
      pt: "Treino de escolhas seguras para SaaS, API, banco, autenticação e IA.",
      en: "Training for safe choices around SaaS, API, database, authentication, and AI.",
    },
  },
  {
    id: "latency",
    title: {
      pt: "Laboratório de latência de API",
      en: "API Latency Lab",
    },
    description: {
      pt: "Treino de performance para reduzir latência, payload e carga desnecessária.",
      en: "Performance training to reduce latency, payload, and unnecessary load.",
    },
  },
];

const labCopy = {
  pt: {
    eyebrow: "Developer Arcade",
    title: "Jogos reais para raciocínio de runtime.",
    description:
      "O Lab agora separa o arcade jogável dos módulos de treino. Runtime Runner é o primeiro jogo real: loop, colisão, score, restart, input por teclado e toque.",
    primary: "Jogar Runtime Runner",
    secondary: "Ver projetos",
    tertiary: "Abrir currículo",
    panelLabel: "primeiro jogo jogável",
    panelTitle: "Runtime Runner",
    panelText: "Desvie de bugs, 404, timeout e falhas de build enquanto a pipeline acelera.",
    session: "score da sessão",
    arcadeStatus: "Arcade em construção",
    trainingEyebrow: "módulos de treino",
    trainingTitle: "Foundation modules rebaixados para treino.",
    trainingText:
      "Os desafios antigos continuam úteis para raciocínio técnico, mas não são vendidos como jogos finais. Eles ficam como módulos de base do Developer Lab.",
    roadmapEyebrow: "próximos jogos",
    roadmapTitle: "Roadmap visual do Developer Arcade.",
    pending: "planejado",
    playable: "jogável",
  },
  en: {
    eyebrow: "Developer Arcade",
    title: "Real games for runtime reasoning.",
    description:
      "The Lab now separates the playable arcade from training modules. Runtime Runner is the first real game: loop, collision, score, restart, keyboard and touch input.",
    primary: "Play Runtime Runner",
    secondary: "View projects",
    tertiary: "Open resume",
    panelLabel: "first playable game",
    panelTitle: "Runtime Runner",
    panelText: "Avoid bugs, 404, timeout, and build failures while the pipeline speeds up.",
    session: "session score",
    arcadeStatus: "Arcade in progress",
    trainingEyebrow: "training modules",
    trainingTitle: "Foundation modules moved to training.",
    trainingText:
      "The older challenges remain useful for technical reasoning, but they are not presented as final games. They now live as foundation modules in Developer Lab.",
    roadmapEyebrow: "next games",
    roadmapTitle: "Developer Arcade visual roadmap.",
    pending: "planned",
    playable: "playable",
  },
} as const;

const roadmap = {
  pt: [
    ["Bug Maze", "Mapa jogável de commits, testes e bugs em grid."],
    ["Debug Arena", "Editor visual com falhas surgindo antes do build."],
    ["Latency Lab", "Simulação visual de API, cache, debounce e índice."],
    ["Runtime Runner", "Primeiro jogo real já jogável nesta fase."],
  ],
  en: [
    ["Bug Maze", "Playable grid map with commits, tests, and bugs."],
    ["Debug Arena", "Visual editor with failures appearing before the build."],
    ["Latency Lab", "Visual simulation for API, cache, debounce, and indexing."],
    ["Runtime Runner", "First real game already playable in this phase."],
  ],
} as const;

export function DeveloperLab() {
  const { locale, t } = usePortfolioUi();
  const copy = labCopy[locale];
  const [activeTraining, setActiveTraining] = useState<FoundationGameId>("debug");
  const [scores, setScores] = useState(initialLabScores);
  const [scoreStatus, setScoreStatus] = useState<Record<LabGameId, ScoreStatus>>({
    runtime: "idle",
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
    <main className={styles.labExperience}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 className={styles.heroTitle}>{copy.title}</h1>
            <p className={styles.heroText}>{copy.description}</p>

            <nav className={styles.heroActions} aria-label={labPageCopy.backLinksLabel[locale]}>
              <a className={styles.actionPrimary} href="#runtime-runner-title">
                {copy.primary}
              </a>
              <Link className={styles.actionSecondary} href="/projetos">
                {copy.secondary}
              </Link>
              <Link className={styles.actionGhost} href="/curriculo">
                {copy.tertiary}
              </Link>
            </nav>
          </div>

          <div className={styles.heroPanel}>
            <div aria-hidden="true" className={styles.systemCore} />
            <div className={styles.heroPanelCopy}>
              <p className={styles.panelLabel}>{copy.panelLabel}</p>
              <h2>{copy.panelTitle}</h2>
              <p className={styles.panelText}>{copy.panelText}</p>
            </div>
          </div>
        </section>

        <aside className={styles.scorePanel} aria-label={copy.session}>
          <p className={styles.panelLabel}>{copy.arcadeStatus}</p>
          <span className={styles.scoreValue} aria-live="polite">
            {sessionScore === null ? "--" : sessionScore}
          </span>
          <p className={styles.panelText}>{copy.session}</p>
          <div className={styles.gameTabs}>
            <div className={styles.gameTab} aria-label="Runtime Runner">
              <span className={styles.gameTabTitle}>Runtime Runner</span>
              <span className={styles.gameTabDescription}>{copy.panelText}</span>
              <span className={styles.gameTabStatus}>
                {statusLabel("runtime")} {apiStatusLabel("runtime")}
              </span>
            </div>
          </div>
        </aside>

        <section className={styles.gameShell}>
          <RuntimeRunner locale={locale} onComplete={(score) => handleComplete("runtime", score)} />
        </section>

        <section className={styles.trainingShell}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>{copy.trainingEyebrow}</p>
              <h2 className={styles.sectionTitle}>{copy.trainingTitle}</h2>
            </div>
            <p className={styles.trainingNote}>{copy.trainingText}</p>
          </div>

          <div className={styles.gameTabs}>
            {foundationModules.map((game) => (
              <button
                aria-pressed={activeTraining === game.id}
                className={styles.gameTab}
                key={game.id}
                onClick={() => setActiveTraining(game.id)}
                type="button"
              >
                <span className={styles.gameTabTitle}>{game.title[locale]}</span>
                <span className={styles.gameTabDescription}>{game.description[locale]}</span>
                <span className={styles.gameTabStatus}>
                  {statusLabel(game.id)} {apiStatusLabel(game.id)}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.trainingContent}>
            {activeTraining === "debug" ? <DebugChallenge locale={locale} onComplete={(score) => handleComplete("debug", score)} /> : null}
            {activeTraining === "architecture" ? (
              <ArchitectureBuilder locale={locale} onComplete={(score) => handleComplete("architecture", score)} />
            ) : null}
            {activeTraining === "latency" ? <ApiLatencyGame locale={locale} onComplete={(score) => handleComplete("latency", score)} /> : null}
          </div>
        </section>

        <section className={styles.trainingShell}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>{copy.roadmapEyebrow}</p>
              <h2 className={styles.sectionTitle}>{copy.roadmapTitle}</h2>
            </div>
            <p className={styles.trainingNote}>
              {locale === "pt"
                ? "O próximo avanço deve transformar os módulos planejados em jogos com regras próprias, estado e feedback visual."
                : "The next step should turn planned modules into games with their own rules, state, and visual feedback."}
            </p>
          </div>

          <div className={styles.moduleGrid}>
            {roadmap[locale].map(([title, description]) => (
              <article className={styles.moduleCard} key={title}>
                <p className={styles.moduleMeta}>{title === "Runtime Runner" ? copy.playable : copy.pending}</p>
                <h3>{title}</h3>
                <p className={styles.moduleText}>{description}</p>
              </article>
            ))}
          </div>

          <nav className={styles.backLinks} aria-label={labPageCopy.backLinksLabel[locale]}>
            <Link className={styles.actionSecondary} href="/">
              {t.nav.home}
            </Link>
            <Link className={styles.actionSecondary} href="/projetos">
              {t.nav.projects}
            </Link>
            <Link className={styles.actionGhost} href="/curriculo">
              {t.nav.resume}
            </Link>
          </nav>
        </section>
      </div>
    </main>
  );
}
