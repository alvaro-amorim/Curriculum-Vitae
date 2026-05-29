"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { ApiLatencyGame } from "@/components/lab/api-latency-game";
import { ArchitectureBuilder } from "@/components/lab/architecture-builder";
import { DebugChallenge } from "@/components/lab/debug-challenge";
import { labPageCopy } from "@/content/challenges";
import { calculateSessionScore, initialLabScores, submitLabScore } from "@/lib/lab-score";
import type { LabGameId } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";
type FoundationGameId = Exclude<LabGameId, "runtime" | "bug-maze" | "code-snake" | "stack-tetris" | "debug-arena" | "latency-lab">;

function GameLoading() {
  return <div aria-hidden="true" className={styles.gameLoading} />;
}

const RuntimeRunner = dynamic(() => import("@/components/lab/runtime-runner").then((module) => module.RuntimeRunner), {
  loading: GameLoading,
  ssr: false,
});

const BugMaze = dynamic(() => import("@/components/lab/bug-maze").then((module) => module.BugMaze), {
  loading: GameLoading,
  ssr: false,
});

const CodeSnake = dynamic(() => import("@/components/lab/code-snake").then((module) => module.CodeSnake), {
  loading: GameLoading,
  ssr: false,
});

const StackTetris = dynamic(() => import("@/components/lab/stack-tetris").then((module) => module.StackTetris), {
  loading: GameLoading,
  ssr: false,
});

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
    title: "Quatro jogos dev, direto ao ponto.",
    description:
      "Runtime Runner, Bug Maze, Code Snake e Stack Tetris ficam como os quatro jogos finais, com treino e arquivo fora do destaque.",
    primary: "Jogar Runtime Runner",
    mazePrimary: "Jogar Bug Maze",
    snakePrimary: "Jogar Code Snake",
    tetrisPrimary: "Jogar Stack Tetris",
    secondary: "Ver projetos",
    tertiary: "Abrir currículo",
    panelLabel: "arcade jogável",
    panelTitle: "4 jogos ativos",
    panelText: "Reflexo, caminho, código vivo e montagem de stack em uma vitrine enxuta.",
    runtimeCardText: "Runner de pipeline com pulo, colisão e score.",
    mazeCardText: "Labirinto técnico com patches, hazards e deploy.",
    snakeCardText: "Snake de programação com tokens e bugs.",
    tetrisCardText: "Puzzle de build com módulos e linhas compiladas.",
    session: "score da sessão",
    arcadeStatus: "Arcade final jogável",
    futureStatus: "em preparação",
    trainingEyebrow: "módulos de treino",
    trainingTitle: "Treinos e experimentos ficam fora da vitrine final.",
    trainingText:
      "Debug Arena, Latency Lab e os desafios foundation continuam úteis como treino/arquivo, mas não são vendidos como jogos principais do arcade final.",
    archivedTitle: "Experimentos arquivados",
    archivedText: "Mantidos temporariamente por compatibilidade e histórico, sem destaque como jogo final.",
    roadmapEyebrow: "direção final",
    roadmapTitle: "Quatro slots do Developer Arcade final.",
    pending: "planejado",
    playable: "jogável",
  },
  en: {
    eyebrow: "Developer Arcade",
    title: "Four dev games, straight to the point.",
    description:
      "Runtime Runner, Bug Maze, Code Snake, and Stack Tetris are the four final games, with training and archive material kept out of the spotlight.",
    primary: "Play Runtime Runner",
    mazePrimary: "Play Bug Maze",
    snakePrimary: "Play Code Snake",
    tetrisPrimary: "Play Stack Tetris",
    secondary: "View projects",
    tertiary: "Open resume",
    panelLabel: "playable arcade",
    panelTitle: "4 active games",
    panelText: "Reflex, pathfinding, living code, and stack assembly in a cleaner showcase.",
    runtimeCardText: "Pipeline runner with jump, collision, and score.",
    mazeCardText: "Technical maze with patches, hazards, and deploy.",
    snakeCardText: "Programming snake with tokens and bugs.",
    tetrisCardText: "Build puzzle with modules and compiled lines.",
    session: "session score",
    arcadeStatus: "Playable final arcade",
    futureStatus: "in preparation",
    trainingEyebrow: "training modules",
    trainingTitle: "Training and experiments stay out of the final showcase.",
    trainingText:
      "Debug Arena, Latency Lab, and foundation challenges remain useful as training/archive material, but they are not presented as final arcade games.",
    archivedTitle: "Archived experiments",
    archivedText: "Kept temporarily for compatibility and history, without being highlighted as final games.",
    roadmapEyebrow: "final direction",
    roadmapTitle: "Four slots for the final Developer Arcade.",
    pending: "planned",
    playable: "playable",
  },
} as const;

const roadmap = {
  pt: [
    ["Runtime Runner", "Jogo ativo: runner de pipeline com salto, colisão, score, pause e dificuldade progressiva."],
    ["Bug Maze", "Jogo ativo: mapa de debug em grid com patches, incidentes e deploy seguro."],
    ["Code Snake", "Jogo ativo: snake de programação com coleta de tokens, bugs perigosos e score local."],
    ["Stack Tetris", "Jogo ativo: montagem de stack técnica com peças em queda, linhas compiladas e score local."],
  ],
  en: [
    ["Runtime Runner", "Active game: pipeline runner with jump, collision, score, pause, and progressive difficulty."],
    ["Bug Maze", "Active game: debug grid with patches, incidents, and safe deploy."],
    ["Code Snake", "Active game: programming snake with code token collection, bug hazards, and local score."],
    ["Stack Tetris", "Active game: technical stack assembly with falling modules, compiled lines, and local score."],
  ],
} as const;

const archivedExperiments = [
  {
    title: "Debug Arena",
    text: {
      pt: "Rebaixado: bom como treino de decisão técnica, mas ainda parecido com teste/quiz.",
      en: "Demoted: useful technical decision training, but still too close to a test/quiz.",
    },
  },
  {
    title: "Latency Lab",
    text: {
      pt: "Rebaixado: útil como simulação de performance, mas ainda próximo de dashboard/formulário.",
      en: "Demoted: useful performance simulation, but still too close to a dashboard/form.",
    },
  },
] as const;

export function DeveloperLab() {
  const { locale, t } = usePortfolioUi();
  const copy = labCopy[locale];
  const [activeTraining, setActiveTraining] = useState<FoundationGameId>("debug");
  const [scores, setScores] = useState(initialLabScores);
  const [scoreStatus, setScoreStatus] = useState<Record<LabGameId, ScoreStatus>>({
    runtime: "idle",
    "bug-maze": "idle",
    "code-snake": "idle",
    "stack-tetris": "idle",
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
              <a className={styles.actionSecondary} href="#code-snake-title">
                {copy.snakePrimary}
              </a>
              <a className={styles.actionSecondary} href="#stack-tetris-title">
                {copy.tetrisPrimary}
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
            <div className={styles.gameTab} aria-label="Code Snake">
              <span className={styles.gameTabTitle}>Code Snake</span>
              <span className={styles.gameTabDescription}>{copy.snakeCardText}</span>
              <span className={styles.gameTabStatus}>
                {statusLabel("code-snake")} {apiStatusLabel("code-snake")}
              </span>
            </div>
            <div className={styles.gameTab} aria-label="Stack Tetris">
              <span className={styles.gameTabTitle}>Stack Tetris</span>
              <span className={styles.gameTabDescription}>{copy.tetrisCardText}</span>
              <span className={styles.gameTabStatus}>
                {statusLabel("stack-tetris")} {apiStatusLabel("stack-tetris")}
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
          <CodeSnake locale={locale} onComplete={(score) => handleComplete("code-snake", score)} />
        </section>

        <section className={styles.gameShell}>
          <StackTetris locale={locale} onComplete={(score) => handleComplete("stack-tetris", score)} />
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

          <div className={`${styles.moduleGrid} ${styles.archiveGrid}`} aria-label={copy.archivedTitle}>
            {archivedExperiments.map((experiment) => (
              <article className={`${styles.moduleCard} ${styles.archivedModuleCard}`} key={experiment.title}>
                <p className={styles.moduleMeta}>{copy.archivedTitle}</p>
                <h3>{experiment.title}</h3>
                <p className={styles.moduleText}>{experiment.text[locale]}</p>
              </article>
            ))}
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
                ? "O arcade final agora reúne quatro jogos jogáveis, com Debug Arena e Latency Lab mantidos apenas como experimentos arquivados."
                : "The final arcade now brings four playable games together, with Debug Arena and Latency Lab kept only as archived experiments."}
            </p>
          </div>

          <div className={styles.moduleGrid}>
            {roadmap[locale].map(([title, description]) => (
              <article className={styles.moduleCard} key={title}>
                <p className={styles.moduleMeta}>
                  {title === "Runtime Runner" || title === "Bug Maze" || title === "Code Snake" || title === "Stack Tetris" ? copy.playable : copy.pending}
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
