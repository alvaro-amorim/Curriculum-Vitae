"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  RUNTIME_SCORE_REWARDS,
  calculateRuntimeScore,
  runtimeDifficulty,
  runtimeSpawnDelay,
  runtimeStageProgress,
  type RuntimeStage,
} from "@/lib/games/runtime-runner-engine";
import { GAME_VERSIONS, detectGameDeviceType } from "@/lib/lab-score";
import type { GameScorePayloadV2, Locale } from "@/types/portfolio";

import styles from "./runtime-runner.module.css";

type RunnerStatus = "idle" | "running" | "paused" | "gameOver";
type RunnerPulseKind = "clear" | "near" | "stage" | null;

type Obstacle = {
  id: number;
  label: string;
  tone: "bug" | "network" | "build" | "memory" | "type" | "rate";
  x: number;
  width: number;
  hitHeight: number;
};

type RunnerFrame = {
  cleared: number;
  elapsed: number;
  nearMisses: number;
  obstacles: Obstacle[];
  pulse: number;
  pulseKind: RunnerPulseKind;
  runScore: number;
  runnerY: number;
  spawnIn: number;
  speed: number;
  stage: RuntimeStage;
  velocity: number;
};

type RuntimeRunnerProps = {
  locale: Locale;
  onComplete: (payload: Extract<GameScorePayloadV2, { game: "runtime" }>) => void;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BEST_SCORE_KEY = "alvaro-dev-runtime-runner-best-v1";
const GROUND_EPSILON = 0.08;
const JUMP_BUFFER_MS = 145;
const COYOTE_TIME_MS = 95;
const JUMP_VELOCITY = 1.74;
const MOBILE_JUMP_VELOCITY = 1.52;
const REDUCED_JUMP_VELOCITY = 1.38;
const MOBILE_REDUCED_JUMP_VELOCITY = 1.28;
const RUNNER_GRAVITY = 2.82;
const MOBILE_RUNNER_GRAVITY = 2.2;
const REDUCED_RUNNER_GRAVITY = 2.28;
const MOBILE_QUERY = "(max-width: 640px)";
const TAP_DISTANCE = 14;
const SWIPE_THRESHOLD = 34;

const obstacleConfigs: Omit<Obstacle, "id" | "x">[] = [
  { label: "BUG", tone: "bug", width: 10, hitHeight: 0.22 },
  { label: "404", tone: "network", width: 9, hitHeight: 0.19 },
  { label: "TIMEOUT", tone: "network", width: 12, hitHeight: 0.24 },
  { label: "BUILD FAIL", tone: "build", width: 14, hitHeight: 0.27 },
  { label: "MERGE CONFLICT", tone: "build", width: 17, hitHeight: 0.3 },
  { label: "MEMORY LEAK", tone: "memory", width: 15, hitHeight: 0.27 },
  { label: "TYPE ERROR", tone: "type", width: 13, hitHeight: 0.24 },
  { label: "RATE LIMIT", tone: "rate", width: 12, hitHeight: 0.23 },
];

const obstacleColors: Record<Obstacle["tone"], string> = {
  bug: "#fb7185",
  network: "#fbbf24",
  build: "#a78bfa",
  memory: "#34d399",
  type: "#67e8f9",
  rate: "#38bdf8",
};

const copy = {
  pt: {
    title: "Runtime Runner",
    subtitle: "Um runner técnico com física previsível, dificuldade progressiva e ranking persistente.",
    eyebrow: "runtime / execution",
    start: "Iniciar execução",
    restart: "Reiniciar",
    pause: "Pausar",
    resume: "Retomar",
    jump: "Pular",
    score: "score",
    best: "melhor",
    speed: "velocidade",
    cleared: "erros evitados",
    stage: "fase",
    next: "próxima",
    maxStage: "fase máxima",
    near: "quase colisão",
    autoPaused: "A rodada foi pausada automaticamente porque a janela perdeu o foco.",
    started: "Execução iniciada.",
    paused: "Execução pausada.",
    resumed: "Execução retomada.",
    gameOverAnnouncement: "Build interrompido. Resultado pronto para o ranking.",
    idleTitle: "Desvie dos erros antes do build cair.",
    idleText: "Clique, toque ou deslize para cima para saltar. Os intervalos foram calibrados para nunca exigir uma sequência fisicamente impossível.",
    gameOverTitle: "Pipeline quebrado.",
    gameOverText: "Seu resultado foi enviado ao ranking. Reinicie quando quiser tentar uma execução mais longa.",
    scoreSummary: "score final",
    clearedSummary: "evitados",
    nearSummary: "quase colisões",
    rulesTitle: "Regras",
    reduced: "Reduced motion ativo: efeitos decorativos e aceleração são mais controlados.",
    rules: [
      "Space ou ArrowUp saltam; P pausa; R reinicia.",
      "No mobile, toque ou swipe para cima executam o salto.",
      `Cada erro evitado vale +${RUNTIME_SCORE_REWARDS.cleared} e cada quase colisão vale +${RUNTIME_SCORE_REWARDS.nearMiss}.`,
      "A velocidade cresce por fases, mas o intervalo mínimo respeita o ciclo físico do salto.",
      "Se a aba ou janela perder o foco durante a rodada, o jogo pausa automaticamente.",
    ],
    status: {
      idle: "pronto para iniciar",
      running: "pipeline em execução",
      paused: "execução pausada",
      gameOver: "build interrompido",
    },
    stages: {
      "dev-server": "Dev server",
      staging: "Staging",
      production: "Produção",
      "incident-mode": "Incidente",
      "zero-downtime": "Zero downtime",
    },
    pulseClear: `+${RUNTIME_SCORE_REWARDS.cleared} erro evitado`,
    pulseNear: `+${RUNTIME_SCORE_REWARDS.nearMiss} quase colisão`,
    pulseStage: "checkpoint de fase",
  },
  en: {
    title: "Runtime Runner",
    subtitle: "A technical runner with predictable physics, progressive difficulty, and persistent ranking.",
    eyebrow: "runtime / execution",
    start: "Start run",
    restart: "Restart",
    pause: "Pause",
    resume: "Resume",
    jump: "Jump",
    score: "score",
    best: "best",
    speed: "speed",
    cleared: "errors avoided",
    stage: "stage",
    next: "next",
    maxStage: "max stage",
    near: "near miss",
    autoPaused: "The run was paused automatically because the window lost focus.",
    started: "Run started.",
    paused: "Run paused.",
    resumed: "Run resumed.",
    gameOverAnnouncement: "Build interrupted. Result ready for the leaderboard.",
    idleTitle: "Avoid errors before the build fails.",
    idleText: "Click, tap, or swipe up to jump. Spawn intervals are calibrated so the game never demands a physically impossible sequence.",
    gameOverTitle: "Pipeline failed.",
    gameOverText: "Your result was submitted to the leaderboard. Restart whenever you want to chase a longer run.",
    scoreSummary: "final score",
    clearedSummary: "avoided",
    nearSummary: "near misses",
    rulesTitle: "Rules",
    reduced: "Reduced motion is active: decorative effects and acceleration are more controlled.",
    rules: [
      "Space or ArrowUp jump; P pauses; R restarts.",
      "On mobile, tap or swipe up executes a jump.",
      `Each avoided error is worth +${RUNTIME_SCORE_REWARDS.cleared} and each near miss is worth +${RUNTIME_SCORE_REWARDS.nearMiss}.`,
      "Speed grows through stages, but the minimum spawn interval respects the physical jump cycle.",
      "If the tab or window loses focus during a run, the game pauses automatically.",
    ],
    status: {
      idle: "ready to start",
      running: "pipeline running",
      paused: "execution paused",
      gameOver: "build interrupted",
    },
    stages: {
      "dev-server": "Dev server",
      staging: "Staging",
      production: "Production",
      "incident-mode": "Incident",
      "zero-downtime": "Zero downtime",
    },
    pulseClear: `+${RUNTIME_SCORE_REWARDS.cleared} error avoided`,
    pulseNear: `+${RUNTIME_SCORE_REWARDS.nearMiss} near miss`,
    pulseStage: "stage checkpoint",
  },
} as const;

function createInitialFrame(): RunnerFrame {
  return {
    cleared: 0,
    elapsed: 0,
    nearMisses: 0,
    obstacles: [],
    pulse: 0,
    pulseKind: null,
    runScore: 0,
    runnerY: 0,
    spawnIn: 1.55,
    speed: 18.5,
    stage: "dev-server",
    velocity: 0,
  };
}

function createObstacle(id: number): Obstacle {
  const config = obstacleConfigs[id % obstacleConfigs.length];
  return { ...config, id, x: 104 };
}

function readBestScore() {
  if (typeof window === "undefined") return 0;
  const parsed = Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function runnerJumpVelocity(mobile: boolean, reduced: boolean) {
  if (reduced) return mobile ? MOBILE_REDUCED_JUMP_VELOCITY : REDUCED_JUMP_VELOCITY;
  return mobile ? MOBILE_JUMP_VELOCITY : JUMP_VELOCITY;
}

function runnerGravity(mobile: boolean, reduced: boolean) {
  if (reduced) return REDUCED_RUNNER_GRAVITY;
  return mobile ? MOBILE_RUNNER_GRAVITY : RUNNER_GRAVITY;
}

export function RuntimeRunner({ locale, onComplete }: RuntimeRunnerProps) {
  const t = copy[locale];
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [frame, setFrame] = useState<RunnerFrame>(() => createInitialFrame());
  const [bestScore, setBestScore] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobilePlayfield, setMobilePlayfield] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const frameRef = useRef<RunnerFrame>(createInitialFrame());
  const statusRef = useRef<RunnerStatus>("idle");
  const rootRef = useRef<HTMLElement | null>(null);
  const obstacleIdRef = useRef(0);
  const completedRef = useRef(false);
  const lastGroundedAtRef = useRef(0);
  const pendingJumpAtRef = useRef<number | null>(null);
  const nearMissedObstacleIdsRef = useRef<Set<number>>(new Set());
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    setBestScore(readBestScore());
    const reducedMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMedia = window.matchMedia(MOBILE_QUERY);
    setReducedMotion(reducedMedia.matches);
    setMobilePlayfield(mobileMedia.matches);

    const handleReduced = () => setReducedMotion(reducedMedia.matches);
    const handleMobile = () => setMobilePlayfield(mobileMedia.matches);
    reducedMedia.addEventListener("change", handleReduced);
    mobileMedia.addEventListener("change", handleMobile);

    return () => {
      reducedMedia.removeEventListener("change", handleReduced);
      mobileMedia.removeEventListener("change", handleMobile);
    };
  }, []);

  const commitFrame = useCallback((next: RunnerFrame) => {
    frameRef.current = next;
    setFrame(next);
  }, []);

  const startRun = useCallback((jumpImmediately = false) => {
    const difficulty = runtimeDifficulty(0, mobilePlayfield, reducedMotion);
    const next: RunnerFrame = {
      ...createInitialFrame(),
      speed: difficulty.baseSpeed,
      spawnIn: runtimeSpawnDelay(0, mobilePlayfield, reducedMotion, 0.25),
    };

    completedRef.current = false;
    obstacleIdRef.current = 0;
    nearMissedObstacleIdsRef.current.clear();
    lastGroundedAtRef.current = performance.now();
    pendingJumpAtRef.current = jumpImmediately ? performance.now() : null;
    setAutoPaused(false);
    commitFrame(next);
    setStatus("running");
    setAnnouncement(t.started);
  }, [commitFrame, mobilePlayfield, reducedMotion, t.started]);

  const finishRun = useCallback((next: RunnerFrame) => {
    if (completedRef.current) return;

    completedRef.current = true;
    pendingJumpAtRef.current = null;
    commitFrame(next);
    setStatus("gameOver");
    setAutoPaused(false);
    setAnnouncement(t.gameOverAnnouncement);
    setBestScore((current) => {
      const best = Math.max(current, next.runScore);
      window.localStorage.setItem(BEST_SCORE_KEY, String(best));
      return best;
    });

    onComplete({
      deviceType: detectGameDeviceType(),
      durationMs: Math.max(250, Math.round(next.elapsed * 1000)),
      game: "runtime",
      gameVersion: GAME_VERSIONS.runtime,
      metadata: {
        cleared: next.cleared,
        collisions: 1,
        distance: Math.max(0, Math.round(next.elapsed * next.speed * 10)),
        maxSpeed: Number(next.speed.toFixed(1)),
        nearMisses: next.nearMisses,
        stageReached: next.stage,
      },
      score: next.runScore,
    });
  }, [commitFrame, onComplete, t.gameOverAnnouncement]);

  const requestJump = useCallback(() => {
    const now = performance.now();

    if (statusRef.current === "idle" || statusRef.current === "gameOver") {
      startRun(true);
      return;
    }

    if (statusRef.current !== "running") return;

    pendingJumpAtRef.current = now;
    const current = frameRef.current;
    const canJump = current.runnerY <= GROUND_EPSILON || now - lastGroundedAtRef.current <= COYOTE_TIME_MS;
    if (!canJump) return;

    pendingJumpAtRef.current = null;
    commitFrame({
      ...current,
      runnerY: Math.max(current.runnerY, 0.03),
      velocity: runnerJumpVelocity(mobilePlayfield, reducedMotion),
    });
  }, [commitFrame, mobilePlayfield, reducedMotion, startRun]);

  const togglePause = useCallback(() => {
    if (statusRef.current === "running") {
      setStatus("paused");
      setAutoPaused(false);
      setAnnouncement(t.paused);
      return;
    }

    if (statusRef.current === "paused") {
      setStatus("running");
      setAutoPaused(false);
      setAnnouncement(t.resumed);
    }
  }, [t.paused, t.resumed]);

  useEffect(() => {
    function pauseForInterruption() {
      if (statusRef.current !== "running") return;
      setStatus("paused");
      setAutoPaused(true);
      setAnnouncement(t.autoPaused);
    }

    function handleVisibility() {
      if (document.hidden) pauseForInterruption();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", pauseForInterruption);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", pauseForInterruption);
    };
  }, [t.autoPaused]);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;

      const active = document.activeElement;
      const focusedInside = active instanceof HTMLElement && Boolean(rootRef.current?.contains(active));
      const activeRun = statusRef.current === "running" || statusRef.current === "paused";
      if (!focusedInside && !activeRun) return;

      if ((event.code === "Space" || event.code === "ArrowUp") && !event.repeat) {
        event.preventDefault();
        requestJump();
      }

      if (event.code === "KeyP" && !event.repeat) {
        event.preventDefault();
        togglePause();
      }

      if (event.code === "KeyR" && !event.repeat) {
        event.preventDefault();
        startRun(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestJump, startRun, togglePause]);

  useEffect(() => {
    if (status !== "running") return;

    let animationFrame = 0;
    let lastTime = performance.now();

    function tick(now: number) {
      const delta = Math.min(0.033, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;

      const current = frameRef.current;
      const gravity = runnerGravity(mobilePlayfield, reducedMotion);
      let runnerY = current.runnerY + current.velocity * delta;
      let velocity = current.velocity - gravity * delta;

      if (runnerY <= 0) {
        runnerY = 0;
        velocity = 0;
        lastGroundedAtRef.current = now;
      }

      const queuedJumpAt = pendingJumpAtRef.current;
      if (
        queuedJumpAt !== null &&
        now - queuedJumpAt <= JUMP_BUFFER_MS &&
        (runnerY <= GROUND_EPSILON || now - lastGroundedAtRef.current <= COYOTE_TIME_MS)
      ) {
        pendingJumpAtRef.current = null;
        runnerY = Math.max(runnerY, 0.035);
        velocity = runnerJumpVelocity(mobilePlayfield, reducedMotion);
      }

      const elapsed = current.elapsed + delta;
      const difficulty = runtimeDifficulty(elapsed, mobilePlayfield, reducedMotion);
      const speed = Math.min(difficulty.maxSpeed, difficulty.baseSpeed + elapsed * difficulty.acceleration);
      const moved = current.obstacles.map((obstacle) => ({ ...obstacle, x: obstacle.x - speed * delta }));
      const activeObstacles = moved.filter((obstacle) => obstacle.x + obstacle.width > -4);
      const clearedNow = moved.length - activeObstacles.length;
      let spawnIn = current.spawnIn - delta;
      const obstacles = [...activeObstacles];

      if (spawnIn <= 0) {
        obstacleIdRef.current += 1;
        obstacles.push(createObstacle(obstacleIdRef.current));
        spawnIn = runtimeSpawnDelay(elapsed, mobilePlayfield, reducedMotion);
      }

      const collision = obstacles.some((obstacle) => {
        const hitsRunnerX = mobilePlayfield
          ? obstacle.x < 15.7 && obstacle.x + obstacle.width > 12.2
          : obstacle.x < 18.1 && obstacle.x + obstacle.width > 13.5;
        const collisionHeight = obstacle.hitHeight * (mobilePlayfield ? 0.6 : 0.88);
        return elapsed > 1 && hitsRunnerX && runnerY < collisionHeight;
      });

      let nearMissNow = 0;
      if (!collision) {
        for (const obstacle of obstacles) {
          if (nearMissedObstacleIdsRef.current.has(obstacle.id)) continue;

          const hitsNearWindow = mobilePlayfield
            ? obstacle.x < 21.5 && obstacle.x + obstacle.width > 10.5
            : obstacle.x < 23.5 && obstacle.x + obstacle.width > 11;
          const collisionHeight = obstacle.hitHeight * (mobilePlayfield ? 0.6 : 0.88);
          const closeHeight = obstacle.hitHeight + (mobilePlayfield ? 0.2 : 0.22);
          const isNearMiss = elapsed > 1.1 && hitsNearWindow && runnerY >= collisionHeight && runnerY < closeHeight;

          if (isNearMiss) {
            nearMissedObstacleIdsRef.current.add(obstacle.id);
            nearMissNow += 1;
          }
        }
      }

      const cleared = current.cleared + clearedNow;
      const nearMisses = current.nearMisses + nearMissNow;
      const runScore = calculateRuntimeScore({ cleared, elapsed, nearMisses });
      const stageChanged = difficulty.stage !== current.stage;
      const shouldPulse = stageChanged || nearMissNow > 0 || clearedNow > 0;
      const next: RunnerFrame = {
        cleared,
        elapsed,
        nearMisses,
        obstacles,
        pulse: shouldPulse ? current.pulse + 1 : current.pulse,
        pulseKind: stageChanged ? "stage" : nearMissNow > 0 ? "near" : clearedNow > 0 ? "clear" : current.pulseKind,
        runScore,
        runnerY,
        spawnIn,
        speed,
        stage: difficulty.stage,
        velocity,
      };

      if (stageChanged) {
        setAnnouncement(`${t.stage}: ${t.stages[difficulty.stage]}`);
      }

      if (collision) {
        finishRun(next);
        return;
      }

      commitFrame(next);
      animationFrame = window.requestAnimationFrame(tick);
    }

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [commitFrame, finishRun, mobilePlayfield, reducedMotion, status, t.stage, t.stages]);

  const stageProgress = useMemo(() => runtimeStageProgress(frame.elapsed), [frame.elapsed]);
  const currentBest = Math.max(bestScore, frame.runScore);
  const isDanger = useMemo(
    () => status === "running" && frame.obstacles.some((obstacle) => obstacle.x < 32 && obstacle.x + obstacle.width > 9),
    [frame.obstacles, status],
  );
  const pulseText = frame.pulseKind === "near"
    ? t.pulseNear
    : frame.pulseKind === "stage"
      ? t.pulseStage
      : t.pulseClear;
  const nextStageLabel = stageProgress.nextStage
    ? `${t.next}: ${t.stages[stageProgress.nextStage]} · ${Math.ceil(stageProgress.secondsRemaining)}s`
    : t.maxStage;
  const showOverlay = status === "idle" || status === "gameOver";

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) return;
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const distance = Math.hypot(dx, dy);
    const isTap = distance <= TAP_DISTANCE;
    const isSwipeUp = dy <= -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx);

    if (isTap || isSwipeUp) requestJump();
  }

  function handlePrimaryAction() {
    if (status === "paused") {
      togglePause();
    } else if (status === "running") {
      requestJump();
    } else {
      startRun(false);
    }
  }

  return (
    <section className={styles.root} aria-labelledby="runtime-runner-title" ref={rootRef}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h2 id="runtime-runner-title">{t.title}</h2>
        </div>
        <p className={styles.intro} id="runtime-instructions">{t.subtitle}</p>
      </div>

      <div className={styles.layout}>
        <div
          aria-describedby="runtime-instructions"
          aria-label={`${t.title}: ${t.status[status]}`}
          className={styles.stage}
          data-danger={isDanger ? "true" : "false"}
          data-state={status}
          onPointerCancel={() => { pointerStartRef.current = null; }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          role="button"
          tabIndex={0}
        >
          <div className={styles.hud} aria-hidden="true">
            <div className={styles.metric}><span>{t.score}</span><strong>{frame.runScore}</strong></div>
            <div className={styles.metric}><span>{t.best}</span><strong>{currentBest}</strong></div>
            <div className={styles.metric}><span>{t.speed}</span><strong>{frame.speed.toFixed(1)}x</strong></div>
            <div className={styles.metric}><span>{t.cleared}</span><strong>{frame.cleared}</strong></div>
          </div>

          <div className={styles.stageProgress} aria-hidden="true">
            <span className={styles.stageLabel}>{t.stages[frame.stage]}</span>
            <span className={styles.progressTrack}>
              <i style={{ "--stage-progress": stageProgress.progress } as StyleVars} />
            </span>
            <span className={styles.nextStage}>{nextStageLabel}</span>
          </div>

          <div className={styles.track} aria-hidden="true" />
          <div className={styles.ground} aria-hidden="true" />
          <span
            aria-hidden="true"
            className={styles.runner}
            data-air={frame.runnerY > 0 ? "true" : "false"}
            style={{ "--runner-y": frame.runnerY } as StyleVars}
          />

          {frame.obstacles.map((obstacle) => (
            <span
              aria-hidden="true"
              className={styles.obstacle}
              data-near={obstacle.x < 31 && obstacle.x > 10 ? "true" : "false"}
              key={obstacle.id}
              style={{
                "--obstacle-color": obstacleColors[obstacle.tone],
                "--obstacle-height": obstacle.hitHeight,
                "--obstacle-width": obstacle.width,
                "--obstacle-x": obstacle.x,
              } as StyleVars}
            >
              {obstacle.label}
            </span>
          ))}

          {frame.pulse > 0 && frame.pulseKind ? (
            <span className={styles.pulse} key={frame.pulse}>{pulseText}</span>
          ) : null}
          {isDanger ? <span className={styles.dangerCue}>{t.near}</span> : null}

          {showOverlay ? (
            <div className={styles.overlay}>
              <div className={styles.overlayCard}>
                <p className={styles.status}>{t.status[status]}</p>
                <h3>{status === "gameOver" ? t.gameOverTitle : t.idleTitle}</h3>
                <p>{status === "gameOver" ? t.gameOverText : t.idleText}</p>
                {status === "gameOver" ? (
                  <div className={styles.summary}>
                    <div><span>{t.scoreSummary}</span><strong>{frame.runScore}</strong></div>
                    <div><span>{t.clearedSummary}</span><strong>{frame.cleared}</strong></div>
                    <div><span>{t.nearSummary}</span><strong>{frame.nearMisses}</strong></div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <aside className={styles.side}>
          <div className={styles.panel}>
            <p className={styles.status}>{t.status[status]}</p>
            <div className={styles.controls}>
              <button onClick={handlePrimaryAction} type="button">
                {status === "paused" ? t.resume : status === "running" ? t.jump : status === "gameOver" ? t.restart : t.start}
              </button>
              <button disabled={status === "idle" || status === "gameOver"} onClick={togglePause} type="button">
                {status === "paused" ? t.resume : t.pause}
              </button>
              <button onClick={() => startRun(false)} type="button">{t.restart}</button>
            </div>
            {autoPaused ? <p className={styles.autoPause}>{t.autoPaused}</p> : null}
          </div>

          <div className={styles.rules}>
            <h3>{t.rulesTitle}</h3>
            <ul>
              {t.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
            {reducedMotion ? <p>{t.reduced}</p> : null}
          </div>
        </aside>
      </div>

      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</span>
    </section>
  );
}
