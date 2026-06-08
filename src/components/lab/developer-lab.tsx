"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { labPageCopy } from "@/content/challenges";
import { calculateSessionScore, initialLabScores, submitLabScore } from "@/lib/lab-score";
import type { LabGameId } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type ScoreStatus = "idle" | "syncing" | "synced" | "failed";
type ArcadeGameId = Extract<LabGameId, "runtime" | "bug-maze" | "code-snake" | "stack-tetris">;

function GameLoading() {
  return <div aria-hidden="true" className={styles.gameLoading} />;
}

function handleLabPointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  event.currentTarget.style.setProperty("--lab-px", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--lab-py", `${(y * 100).toFixed(2)}%`);
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

const labCopy = {
  pt: {
    eyebrow: "Developer Arcade",
    title: "Arcade Hub, um jogo por vez.",
    description:
      "Escolha um dos quatro jogos finais, entre em modo foco e mantenha os treinos fora do caminho principal.",
    primary: "Jogar Runtime Runner",
    mazePrimary: "Jogar Bug Maze",
    snakePrimary: "Jogar Code Snake",
    tetrisPrimary: "Jogar Stack Tetris",
    hubEyebrow: "hub jogável",
    hubTitle: "Escolha o módulo ativo.",
    hubText: "Os quatro jogos continuam disponíveis, mas a tela abre somente um por vez para reduzir ruído e dar mais área para jogar.",
    openGame: "Abrir jogo",
    activeGame: "Jogo ativo",
    backToHub: "Voltar ao Hub",
    switchGame: "Trocar jogo",
    focusEyebrow: "modo foco",
    focusHint: "HUD compacto, controles visíveis e troca rápida entre jogos.",
    focusLoading: "Carregando arena",
    controlsLabel: "controles",
    secondary: "Ver projetos",
    tertiary: "Abrir currículo",
    panelLabel: "arcade jogável",
    panelTitle: "4 jogos ativos",
    panelText: "Reflexo, caminho, código vivo e montagem de stack em uma vitrine enxuta.",
    runtimeCardText: "Runner de pipeline com pulo, colisão e score.",
    mazeCardText: "Maze dev com tokens, vírus, 3 vidas e Safe Deploy bloqueado.",
    snakeCardText: "Snake de programação com wrap-around, paredes opcionais, tokens e bugs.",
    tetrisCardText: "Puzzle de build com módulos e linhas compiladas.",
    runtimeControls: "Space / ArrowUp / toque",
    mazeControls: "Swipe no mobile / Setas no desktop",
    snakeControls: "Swipe no mobile / Setas no desktop",
    tetrisControls: "Swipe no mobile / Space no desktop",
    session: "score da sessão",
    arcadeStatus: "Arcade final jogável",
    futureStatus: "em preparação",
    archivedNote:
      "Treinos antigos, Debug Arena e Latency Lab foram retirados da UI e do contrato ativo de score. A tela principal mostra somente os quatro jogos finais.",
    roadmapEyebrow: "direção final",
    roadmapTitle: "Quatro slots do Developer Arcade final.",
    pending: "planejado",
    playable: "jogável",
  },
  en: {
    eyebrow: "Developer Arcade",
    title: "Arcade Hub, one game at a time.",
    description:
      "Pick one of the four final games, enter focus mode, and keep training material out of the main path.",
    primary: "Play Runtime Runner",
    mazePrimary: "Play Bug Maze",
    snakePrimary: "Play Code Snake",
    tetrisPrimary: "Play Stack Tetris",
    hubEyebrow: "playable hub",
    hubTitle: "Choose the active module.",
    hubText: "All four games remain available, but the screen opens only one at a time to reduce noise and give gameplay more room.",
    openGame: "Open game",
    activeGame: "Active game",
    backToHub: "Back to Hub",
    switchGame: "Switch game",
    focusEyebrow: "focus mode",
    focusHint: "Compact HUD, visible controls, and fast switching between games.",
    focusLoading: "Loading arena",
    controlsLabel: "controls",
    secondary: "View projects",
    tertiary: "Open resume",
    panelLabel: "playable arcade",
    panelTitle: "4 active games",
    panelText: "Reflex, pathfinding, living code, and stack assembly in a cleaner showcase.",
    runtimeCardText: "Pipeline runner with jump, collision, and score.",
    mazeCardText: "Dev maze with tokens, viruses, 3 lives, and locked Safe Deploy.",
    snakeCardText: "Programming snake with wrap-around, optional walls, tokens, and bugs.",
    tetrisCardText: "Build puzzle with modules and compiled lines.",
    runtimeControls: "Space / ArrowUp / tap",
    mazeControls: "Mobile swipe / desktop arrows",
    snakeControls: "Mobile swipe / desktop arrows",
    tetrisControls: "Mobile swipe / desktop Space",
    session: "session score",
    arcadeStatus: "Playable final arcade",
    futureStatus: "in preparation",
    archivedNote:
      "Legacy training, Debug Arena, and Latency Lab were retired from the UI and active score contract. The main screen shows the four final games only.",
    roadmapEyebrow: "final direction",
    roadmapTitle: "Four slots for the final Developer Arcade.",
    pending: "planned",
    playable: "playable",
  },
} as const;

const roadmap = {
  pt: [
    ["Runtime Runner", "Jogo ativo: runner de pipeline com salto, colisão, score, pause e dificuldade progressiva."],
    ["Bug Maze", "Jogo ativo: maze de debug com tokens, vírus perseguidores, 3 vidas e Safe Deploy bloqueado."],
    ["Code Snake", "Jogo ativo: snake de programação com coleta de tokens, bugs perigosos e score local."],
    ["Stack Tetris", "Jogo ativo: montagem de stack técnica com peças em queda, linhas compiladas e score local."],
  ],
  en: [
    ["Runtime Runner", "Active game: pipeline runner with jump, collision, score, pause, and progressive difficulty."],
    ["Bug Maze", "Active game: debug maze with tokens, chasing viruses, 3 lives, and locked Safe Deploy."],
    ["Code Snake", "Active game: programming snake with code token collection, bug hazards, and local score."],
    ["Stack Tetris", "Active game: technical stack assembly with falling modules, compiled lines, and local score."],
  ],
} as const;

export function DeveloperLab() {
  const { locale, t } = usePortfolioUi();
  const copy = labCopy[locale];
  const [scores, setScores] = useState(initialLabScores);
  const [scoreStatus, setScoreStatus] = useState<Record<LabGameId, ScoreStatus>>({
    runtime: "idle",
    "bug-maze": "idle",
    "code-snake": "idle",
    "stack-tetris": "idle",
  });
  const [activeGame, setActiveGame] = useState<ArcadeGameId | null>(null);
  const [isSwitchingGame, setIsSwitchingGame] = useState(false);
  const focusRef = useRef<HTMLElement | null>(null);
  const hubRef = useRef<HTMLElement | null>(null);
  const switchTimerRef = useRef<number | null>(null);

  const sessionScore = useMemo(() => calculateSessionScore(scores), [scores]);
  const arcadeGames = useMemo(
    () =>
      [
        {
          controls: copy.runtimeControls,
          description: copy.runtimeCardText,
          id: "runtime" as const,
          title: "Runtime Runner",
        },
        {
          controls: copy.mazeControls,
          description: copy.mazeCardText,
          id: "bug-maze" as const,
          title: "Bug Maze",
        },
        {
          controls: copy.snakeControls,
          description: copy.snakeCardText,
          id: "code-snake" as const,
          title: "Code Snake",
        },
        {
          controls: copy.tetrisControls,
          description: copy.tetrisCardText,
          id: "stack-tetris" as const,
          title: "Stack Tetris",
        },
      ] satisfies { controls: string; description: string; id: ArcadeGameId; title: string }[],
    [copy],
  );
  const selectedGame = activeGame ? arcadeGames.find((game) => game.id === activeGame) ?? null : null;

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) {
        window.clearTimeout(switchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeGame) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      focusRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeGame]);

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

  const openGame = useCallback((game: ArcadeGameId) => {
    setActiveGame(game);
    setIsSwitchingGame(true);

    if (switchTimerRef.current) {
      window.clearTimeout(switchTimerRef.current);
    }

    switchTimerRef.current = window.setTimeout(() => {
      setIsSwitchingGame(false);
      switchTimerRef.current = null;
    }, 420);
  }, []);

  const backToHub = useCallback(() => {
    setActiveGame(null);
    setIsSwitchingGame(false);

    if (switchTimerRef.current) {
      window.clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }

    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      hubRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
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

  function renderActiveGame(game: ArcadeGameId) {
    if (game === "runtime") {
      return <RuntimeRunner locale={locale} onComplete={(score) => handleComplete("runtime", score)} />;
    }

    if (game === "bug-maze") {
      return <BugMaze locale={locale} onComplete={(score) => handleComplete("bug-maze", score)} />;
    }

    if (game === "code-snake") {
      return <CodeSnake locale={locale} onComplete={(score) => handleComplete("code-snake", score)} />;
    }

    return <StackTetris locale={locale} onComplete={(score) => handleComplete("stack-tetris", score)} />;
  }

  return (
    <main className={styles.labExperience} onPointerMove={handleLabPointer}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 className={styles.heroTitle}>{copy.title}</h1>
            <p className={styles.heroText}>{copy.description}</p>

            <nav className={styles.heroActions} aria-label={labPageCopy.backLinksLabel[locale]}>
              <button className={styles.actionPrimary} onClick={() => openGame("runtime")} type="button">
                {copy.primary}
              </button>
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

        <section className={styles.arcadeHub} data-mode={activeGame ? "focus" : "hub"} ref={hubRef}>
          <div className={styles.hubHeader}>
            <div>
              <p className={styles.eyebrow}>{copy.hubEyebrow}</p>
              <h2 className={styles.sectionTitle}>{copy.hubTitle}</h2>
            </div>
            <div className={styles.hubScore} aria-label={copy.session}>
              <span>{copy.session}</span>
              <strong aria-live="polite">{sessionScore === null ? "--" : sessionScore}</strong>
            </div>
            <p className={styles.trainingNote}>{copy.hubText}</p>
          </div>

          <div className={styles.hubGrid} aria-label={copy.arcadeStatus}>
            {arcadeGames.map((game) => (
              <button
                aria-pressed={activeGame === game.id}
                className={styles.hubCard}
                data-active={activeGame === game.id ? "true" : "false"}
                key={game.id}
                onClick={() => openGame(game.id)}
                type="button"
              >
                <span className={styles.hubCardMeta}>{copy.playable}</span>
                <strong>{game.title}</strong>
                <span className={styles.hubCardText}>{game.description}</span>
                <span className={styles.hubCardControls}>
                  {copy.controlsLabel}: {game.controls}
                </span>
                <span className={styles.hubCardStatus}>
                  {statusLabel(game.id)} {apiStatusLabel(game.id)}
                </span>
                <span className={styles.hubCardAction}>{activeGame === game.id ? copy.activeGame : copy.openGame}</span>
              </button>
            ))}
          </div>
        </section>

        {activeGame && selectedGame ? (
          <section
            aria-labelledby="active-arcade-game-title"
            className={styles.focusShell}
            data-game={activeGame}
            data-switching={isSwitchingGame ? "true" : "false"}
            ref={focusRef}
          >
            <div className={styles.focusHeader}>
              <div className={styles.focusTitleBlock}>
                <p className={styles.eyebrow}>{copy.focusEyebrow}</p>
                <h2 className={styles.sectionTitle} id="active-arcade-game-title">
                  {selectedGame.title}
                </h2>
                <p className={styles.trainingNote}>{selectedGame.description}</p>
              </div>

              <div className={styles.focusMeta} aria-label={copy.session}>
                <span>{statusLabel(activeGame)}</span>
                <strong>{sessionScore === null ? "--" : sessionScore}</strong>
              </div>

              <div className={styles.focusActions}>
                <button className={styles.actionSecondary} onClick={backToHub} type="button">
                  {copy.backToHub}
                </button>
                <span className={styles.focusHint}>{copy.focusHint}</span>
              </div>
            </div>

            <div className={styles.focusSwitch} aria-label={copy.switchGame}>
              {arcadeGames.map((game) => (
                <button
                  aria-pressed={activeGame === game.id}
                  className={styles.focusTab}
                  key={game.id}
                  onClick={() => openGame(game.id)}
                  type="button"
                >
                  {game.title}
                </button>
              ))}
            </div>

            <div className={styles.focusStage}>
              {isSwitchingGame ? (
                <div aria-live="polite" className={styles.focusLoading}>
                  <span aria-hidden="true" />
                  {copy.focusLoading}
                </div>
              ) : null}
              {renderActiveGame(activeGame)}
            </div>
          </section>
        ) : null}

        {!activeGame ? (
          <>
        <section className={styles.trainingShell}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>{copy.roadmapEyebrow}</p>
              <h2 className={styles.sectionTitle}>{copy.roadmapTitle}</h2>
            </div>
            <p className={styles.trainingNote}>
              {locale === "pt"
                ? "A UI principal agora fica concentrada nos quatro jogos finais. Treinos antigos permanecem fora da vitrine."
                : "The main UI now stays focused on the four final games. Legacy training stays out of the showcase."}
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

          <p className={styles.archiveNote}>{copy.archivedNote}</p>

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
          </>
        ) : null}
      </div>
    </main>
  );
}
