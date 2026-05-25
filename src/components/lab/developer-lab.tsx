"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { ApiLatencyGame } from "@/components/lab/api-latency-game";
import { ArchitectureBuilder } from "@/components/lab/architecture-builder";
import { BugMaze } from "@/components/lab/bug-maze";
import { DebugArena } from "@/components/lab/debug-arena";
import { DebugChallenge } from "@/components/lab/debug-challenge";
import { LatencyLab } from "@/components/lab/latency-lab";
import { RuntimeRunner } from "@/components/lab/runtime-runner";
import { labPageCopy } from "@/content/challenges";
import { calculateSessionScore, initialLabScores, submitLabScore } from "@/lib/lab-score";
import type { LabGameId } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";
type FoundationGameId = Exclude<LabGameId, "runtime" | "bug-maze" | "debug-arena" | "latency-lab">;

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
      pt: "Treino de depuração em JavaScript, React e chamadas HTTP. Útil como base, não como jogo final.",
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
      "O Lab agora separa o arcade jogável dos módulos de treino. Runtime Runner, Bug Maze, Debug Arena e Latency Lab são jogos reais com estado, score, teclado e toque.",
    primary: "Jogar Runtime Runner",
    mazePrimary: "Jogar Bug Maze",
    arenaPrimary: "Jogar Debug Arena",
    latencyPrimary: "Jogar Latency Lab",
    secondary: "Ver projetos",
    tertiary: "Abrir currículo",
    panelLabel: "arcade jogável",
    panelTitle: "4 jogos reais ativos",
    panelText: "Desvie de falhas, navegue pelo labirinto, escolha patches e estabilize uma pipeline de performance simulada.",
    runtimeCardText: "Desvie de bugs, 404, timeout e falhas de build enquanto a pipeline acelera.",
    mazeCardText: "Colete patches, evite incidentes e encontre o deploy seguro no grid de execução.",
    arenaCardText: "Analise bugs reais de web/API e escolha o patch mais seguro sob pressão.",
    latencyCardText: "Reduza p95, erro e load com decisões de cache, índice, fila e payload sem chamar API externa.",
    session: "score da sessão",
    arcadeStatus: "Arcade completo",
    trainingEyebrow: "módulos de treino",
    trainingTitle: "Módulos de base rebaixados para treino.",
    trainingText:
      "Os desafios antigos continuam úteis para raciocínio técnico, mas não são vendidos como jogos finais. Eles ficam como módulos de base do Developer Lab.",
    roadmapEyebrow: "arcade completo",
    roadmapTitle: "Quatro jogos reais publicados no Developer Arcade.",
    pending: "planejado",
    playable: "jogável",
  },
  en: {
    eyebrow: "Developer Arcade",
    title: "Real games for runtime reasoning.",
    description:
      "The Lab now separates the playable arcade from training modules. Runtime Runner, Bug Maze, Debug Arena, and Latency Lab are real games with state, score, keyboard, and touch input.",
    primary: "Play Runtime Runner",
    mazePrimary: "Play Bug Maze",
    arenaPrimary: "Play Debug Arena",
    latencyPrimary: "Play Latency Lab",
    secondary: "View projects",
    tertiary: "Open resume",
    panelLabel: "playable arcade",
    panelTitle: "4 real games active",
    panelText: "Avoid failures, navigate the maze, choose patches, and stabilize a simulated performance pipeline.",
    runtimeCardText: "Avoid bugs, 404, timeout, and build failures while the pipeline speeds up.",
    mazeCardText: "Collect patches, avoid incidents, and find the safe deploy in the execution grid.",
    arenaCardText: "Analyze real web/API bugs and choose the safest patch under pressure.",
    latencyCardText: "Reduce p95, errors, and load with cache, index, queue, and payload decisions without calling an external API.",
    session: "session score",
    arcadeStatus: "Arcade complete",
    trainingEyebrow: "training modules",
    trainingTitle: "Foundation modules moved to training.",
    trainingText:
      "The older challenges remain useful for technical reasoning, but they are not presented as final games. They now live as foundation modules in Developer Lab.",
    roadmapEyebrow: "complete arcade",
    roadmapTitle: "Four real games published in Developer Arcade.",
    pending: "planned",
    playable: "playable",
  },
} as const;

const roadmap = {
  pt: [
    ["Runtime Runner", "Primeiro jogo real: runner de pipeline com colisão, score, pause e dificuldade progressiva."],
    ["Bug Maze", "Segundo jogo real: mapa de debug em grid com patches, incidentes e deploy seguro."],
    ["Debug Arena", "Terceiro jogo real: arena de patches com timer, risco, streak e review técnico."],
    ["Latency Lab", "Quarto jogo real: simulação de p95, erro, cache, budget e decisões de performance."],
  ],
  en: [
    ["Runtime Runner", "First real game: pipeline runner with collision, score, pause, and progressive difficulty."],
    ["Bug Maze", "Second real game: debug grid with patches, incidents, and safe deploy."],
    ["Debug Arena", "Third real game: patch arena with timer, risk, streak, and technical review."],
    ["Latency Lab", "Fourth real game: p95, error, cache, budget, and performance decision simulation."],
  ],
} as const;

export function DeveloperLab() {
  const { locale, t } = usePortfolioUi();
  const copy = labCopy[locale];
  const [activeTraining, setActiveTraining] = useState<FoundationGameId>("debug");
  const [scores, setScores] = useState(initialLabScores);
  const [scoreStatus, setScoreStatus] = useState<Record<LabGameId, ScoreStatus>>({
    runtime: "idle",
    "bug-maze": "idle",
    "debug-arena": "idle",
    "latency-lab": "idle",
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
              <a className={styles.actionSecondary} href="#bug-maze-title">
                {copy.mazePrimary}
              </a>
              <a className={styles.actionSecondary} href="#debug-arena-title">
                {copy.arenaPrimary}
              </a>
              <a className={styles.actionSecondary} href="#latency-lab-title">
                {copy.latencyPrimary}
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
              <span className={styles.gameTabDescription}>{copy.runtimeCardText}</span>
              <span className={styles.gameTabStatus}>
                {statusLabel("runtime")} {apiStatusLabel("runtime")}
              </span>
            </div>
            <div className={styles.gameTab} aria-label="Bug Maze">
              <span className={styles.gameTabTitle}>Bug Maze</span>
              <span className={styles.gameTabDescription}>{copy.mazeCardText}</span>
              <span className={styles.gameTabStatus}>
                {statusLabel("bug-maze")} {apiStatusLabel("bug-maze")}
              </span>
            </div>
            <div className={styles.gameTab} aria-label="Debug Arena">
              <span className={styles.gameTabTitle}>Debug Arena</span>
              <span className={styles.gameTabDescription}>{copy.arenaCardText}</span>
              <span className={styles.gameTabStatus}>
                {statusLabel("debug-arena")} {apiStatusLabel("debug-arena")}
              </span>
            </div>
            <div className={styles.gameTab} aria-label="Latency Lab">
              <span className={styles.gameTabTitle}>Latency Lab</span>
              <span className={styles.gameTabDescription}>{copy.latencyCardText}</span>
              <span className={styles.gameTabStatus}>
                {statusLabel("latency-lab")} {apiStatusLabel("latency-lab")}
              </span>
            </div>
          </div>
        </aside>

        <section className={styles.gameShell}>
          <RuntimeRunner locale={locale} onComplete={(score) => handleComplete("runtime", score)} />
        </section>

        <section className={styles.gameShell}>
          <BugMaze locale={locale} onComplete={(score) => handleComplete("bug-maze", score)} />
        </section>

        <section className={styles.gameShell}>
          <DebugArena locale={locale} onComplete={(score) => handleComplete("debug-arena", score)} />
        </section>

        <section className={styles.gameShell}>
          <LatencyLab locale={locale} onComplete={(score) => handleComplete("latency-lab", score)} />
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
                ? "O roadmap principal agora está completo: os próximos avanços devem ser polish de jogabilidade, balanceamento e revisão visual humana."
                : "The main roadmap is now complete: next steps should focus on gameplay polish, balancing, and human visual review."}
            </p>
          </div>

          <div className={styles.moduleGrid}>
            {roadmap[locale].map(([title, description]) => (
              <article className={styles.moduleCard} key={title}>
                <p className={styles.moduleMeta}>
                  {title === "Runtime Runner" || title === "Bug Maze" || title === "Debug Arena" || title === "Latency Lab" ? copy.playable : copy.pending}
                </p>
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
