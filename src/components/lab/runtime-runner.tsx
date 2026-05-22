"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { clampScore } from "@/lib/lab-score";
import type { Locale } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type RunnerStatus = "idle" | "running" | "paused" | "gameOver";

type Obstacle = {
  id: number;
  label: string;
  x: number;
  width: number;
};

type RunnerFrame = {
  elapsed: number;
  runScore: number;
  apiScore: number;
  speed: number;
  runnerY: number;
  velocity: number;
  obstacles: Obstacle[];
  cleared: number;
  spawnIn: number;
  pulse: number;
};

type RuntimeRunnerProps = {
  locale: Locale;
  onComplete: (score: number) => void;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BEST_SCORE_KEY = "alvaro-dev-runtime-runner-best-v1";

const obstacleLabels = ["BUG", "404", "TIMEOUT", "MERGE CONFLICT", "BUILD FAIL", "MEMORY LEAK"];

const copy = {
  pt: {
    status: {
      idle: "pronto para iniciar",
      running: "pipeline em execução",
      paused: "execução pausada",
      gameOver: "build interrompido",
    },
    title: "Runtime Runner",
    subtitle: "Um runner técnico com colisão, pontuação e dificuldade progressiva.",
    start: "Iniciar execução",
    restart: "Reiniciar",
    pause: "Pausar",
    resume: "Retomar",
    jump: "Executar salto",
    score: "score",
    best: "melhor",
    speed: "velocidade",
    cleared: "erros evitados",
    idleTitle: "Desvie dos erros antes do build cair.",
    idleText: "Pressione Space ou ArrowUp, toque no palco ou use o botão para saltar sobre bugs, 404, timeout e falhas de build.",
    gameOverTitle: "Pipeline quebrado.",
    gameOverText: "Reinicie para tentar um score maior. O score local é mantido sem depender de banco ou ranking real.",
    rulesTitle: "Regras",
    rules: [
      "Space ou ArrowUp fazem o runtime saltar.",
      "Toque no palco funciona no mobile.",
      "A velocidade aumenta com o tempo.",
      "Colisão encerra a rodada e salva o melhor score local.",
    ],
    reduced: "Modo reduced motion: animações decorativas reduzidas e velocidade mais controlada.",
    pulse: "+18 erro evitado",
  },
  en: {
    status: {
      idle: "ready to start",
      running: "pipeline running",
      paused: "execution paused",
      gameOver: "build interrupted",
    },
    title: "Runtime Runner",
    subtitle: "A technical runner with collision, score, and progressive difficulty.",
    start: "Start run",
    restart: "Restart",
    pause: "Pause",
    resume: "Resume",
    jump: "Run jump",
    score: "score",
    best: "best",
    speed: "speed",
    cleared: "errors avoided",
    idleTitle: "Avoid errors before the build fails.",
    idleText: "Press Space or ArrowUp, tap the stage, or use the button to jump over bugs, 404, timeout, and build failures.",
    gameOverTitle: "Pipeline failed.",
    gameOverText: "Restart to chase a higher score. Local score is kept without a database or real ranking.",
    rulesTitle: "Rules",
    rules: [
      "Space or ArrowUp make the runtime jump.",
      "Tapping the stage works on mobile.",
      "Speed increases over time.",
      "Collision ends the run and saves the local best score.",
    ],
    reduced: "Reduced motion mode: decorative animation is reduced and speed is more controlled.",
    pulse: "+18 error avoided",
  },
} as const;

function createInitialFrame(): RunnerFrame {
  return {
    elapsed: 0,
    runScore: 0,
    apiScore: 0,
    speed: 28,
    runnerY: 0,
    velocity: 0,
    obstacles: [],
    cleared: 0,
    spawnIn: 1.05,
    pulse: 0,
  };
}

function createObstacle(id: number): Obstacle {
  const label = obstacleLabels[id % obstacleLabels.length];

  return {
    id,
    label,
    x: 104,
    width: label.length > 10 ? 17 : 11,
  };
}

function readBestScore() {
  if (typeof window === "undefined") {
    return 0;
  }

  const stored = window.localStorage.getItem(BEST_SCORE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function RuntimeRunner({ locale, onComplete }: RuntimeRunnerProps) {
  const t = copy[locale];
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [frame, setFrame] = useState<RunnerFrame>(() => createInitialFrame());
  const [bestScore, setBestScore] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const stateRef = useRef<RunnerFrame>(createInitialFrame());
  const statusRef = useRef<RunnerStatus>("idle");
  const obstacleIdRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser preferences and localStorage are client-only.
    setBestScore(readBestScore());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const speedLabel = useMemo(() => `${Math.round(frame.speed)}x`, [frame.speed]);

  const commitFrame = useCallback((next: RunnerFrame) => {
    stateRef.current = next;
    setFrame(next);
  }, []);

  const startRun = useCallback(() => {
    const firstObstacle = createObstacle(0);
    const next = {
      ...createInitialFrame(),
      obstacles: [{ ...firstObstacle, x: 58 }],
      spawnIn: 1.15,
    };
    completedRef.current = false;
    obstacleIdRef.current = 1;
    commitFrame(next);
    setStatus("running");
  }, [commitFrame]);

  const finishRun = useCallback(
    (next: RunnerFrame) => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;
      commitFrame(next);
      setStatus("gameOver");
      setBestScore((current) => {
        const best = Math.max(current, next.runScore);
        window.localStorage.setItem(BEST_SCORE_KEY, String(best));
        return best;
      });
      onComplete(next.apiScore);
    },
    [commitFrame, onComplete],
  );

  const jump = useCallback(() => {
    if (statusRef.current === "idle" || statusRef.current === "gameOver") {
      startRun();
      return;
    }

    if (statusRef.current !== "running") {
      return;
    }

    const current = stateRef.current;
    if (current.runnerY > 0.04) {
      return;
    }

    commitFrame({
      ...current,
      runnerY: 0.02,
      velocity: reducedMotion ? 0.92 : 1.12,
    });
  }, [commitFrame, reducedMotion, startRun]);

  const togglePause = useCallback(() => {
    setStatus((current) => {
      if (current === "running") return "paused";
      if (current === "paused") return "running";
      return current;
    });
  }, []);

  useEffect(() => {
    function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
      }

      if (event.code === "KeyP") {
        event.preventDefault();
        togglePause();
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [jump, togglePause]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    let animationFrame = 0;
    let lastTime = performance.now();

    function tick(now: number) {
      const delta = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      const current = stateRef.current;
      const gravity = reducedMotion ? 2.3 : 2.75;
      let runnerY = current.runnerY + current.velocity * delta;
      let velocity = current.velocity - gravity * delta;

      if (runnerY <= 0) {
        runnerY = 0;
        velocity = 0;
      }

      const elapsed = current.elapsed + delta;
      const speed = Math.min(reducedMotion ? 42 : 56, (reducedMotion ? 22 : 28) + elapsed * (reducedMotion ? 0.9 : 1.24));
      const moved = current.obstacles.map((obstacle) => ({
        ...obstacle,
        x: obstacle.x - speed * delta,
      }));
      const activeObstacles = moved.filter((obstacle) => obstacle.x + obstacle.width > -4);
      const clearedNow = moved.length - activeObstacles.length;
      let spawnIn = current.spawnIn - delta;
      const obstacles = [...activeObstacles];

      if (spawnIn <= 0) {
        obstacleIdRef.current += 1;
        obstacles.push(createObstacle(obstacleIdRef.current));
        const cadence = Math.max(reducedMotion ? 1.1 : 0.72, 1.32 - elapsed * 0.015);
        spawnIn = cadence + Math.random() * 0.28;
      }

      const collision = obstacles.some((obstacle) => {
        const hitsRunnerX = obstacle.x < 22 && obstacle.x + obstacle.width > 11;
        return hitsRunnerX && runnerY < 0.42;
      });

      const cleared = current.cleared + clearedNow;
      const runScore = Math.floor(elapsed * 9 + cleared * 18);
      const apiScore = clampScore(runScore / 6);
      const next = {
        elapsed,
        runScore,
        apiScore,
        speed,
        runnerY,
        velocity,
        obstacles,
        cleared,
        spawnIn,
        pulse: clearedNow > 0 ? current.pulse + 1 : current.pulse,
      };

      if (collision) {
        finishRun(next);
        return;
      }

      commitFrame(next);
      animationFrame = window.requestAnimationFrame(tick);
    }

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [commitFrame, finishRun, reducedMotion, status]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault();
      jump();
    }

    if (event.code === "KeyP") {
      event.preventDefault();
      togglePause();
    }
  }

  const showIntro = status === "idle" || status === "gameOver";
  const primaryLabel = status === "idle" ? t.start : status === "gameOver" ? t.restart : t.jump;

  return (
    <section aria-labelledby="runtime-runner-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Runtime Runner</p>
          <h2 className={styles.sectionTitle} id="runtime-runner-title">
            {t.title}
          </h2>
        </div>
        <p className={styles.trainingNote}>{t.subtitle}</p>
      </div>

      <div className={styles.runnerGrid}>
        <div
          aria-label={t.jump}
          className={styles.runnerStage}
          onClick={jump}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className={styles.runnerHud}>
            <div>
              <span>{t.score}</span>
              <strong aria-live="polite">{frame.runScore}</strong>
            </div>
            <div>
              <span>{t.best}</span>
              <strong>{Math.max(bestScore, frame.runScore)}</strong>
            </div>
            <div>
              <span>{t.speed}</span>
              <strong>{speedLabel}</strong>
            </div>
            <div>
              <span>{t.cleared}</span>
              <strong>{frame.cleared}</strong>
            </div>
          </div>

          <div aria-hidden="true" className={styles.pipelineTrack} />
          <span aria-hidden="true" className={`${styles.laneLine} ${styles.laneLineOne}`} />
          <span aria-hidden="true" className={`${styles.laneLine} ${styles.laneLineTwo}`} />
          <span
            aria-hidden="true"
            className={`${styles.runnerAvatar} ${frame.runnerY > 0 ? styles.runnerAvatarJumping : ""}`}
            style={{ "--runner-y": frame.runnerY } as StyleVars}
          />

          {frame.obstacles.map((obstacle) => (
            <span
              aria-hidden="true"
              className={styles.obstacle}
              key={obstacle.id}
              style={{ "--x": obstacle.x, "--w": obstacle.width } as StyleVars}
            >
              {obstacle.label}
            </span>
          ))}

          {frame.pulse > 0 ? (
            <span className={styles.collectPulse} key={frame.pulse}>
              {t.pulse}
            </span>
          ) : null}

          {showIntro ? (
            <div className={styles.stageMessage}>
              <div className={styles.stageMessageInner}>
                <p className={styles.gameStatus}>{t.status[status]}</p>
                <h3>{status === "gameOver" ? t.gameOverTitle : t.idleTitle}</h3>
                <p>{status === "gameOver" ? t.gameOverText : t.idleText}</p>
              </div>
            </div>
          ) : null}
        </div>

        <aside className={styles.runnerSide}>
          <div className={styles.runnerPanel}>
            <p className={styles.gameStatus}>{t.status[status]}</p>
            <div className={styles.runnerControls}>
              <button className={`${styles.runnerAction} ${styles.runnerActionPrimary}`} onClick={jump} type="button">
                {primaryLabel}
              </button>
              <button className={styles.runnerAction} disabled={status === "idle" || status === "gameOver"} onClick={togglePause} type="button">
                {status === "paused" ? t.resume : t.pause}
              </button>
              <button className={styles.runnerAction} onClick={startRun} type="button">
                {t.restart}
              </button>
            </div>
            <div className={styles.laneControls}>
              <button className={styles.laneControl} onClick={jump} type="button">
                Space
              </button>
              <button className={styles.laneControl} onClick={jump} type="button">
                ArrowUp
              </button>
            </div>
          </div>

          <div className={styles.runnerPanel}>
            <h3>{t.rulesTitle}</h3>
            <ul>
              {t.rules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {reducedMotion ? <p>{t.reduced}</p> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
