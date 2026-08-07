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
  code: string;
  hitHeight: number;
  id: number;
  label: string;
  tone: "bug" | "network" | "build" | "memory" | "type" | "rate";
  width: number;
  x: number;
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

type RunnerContactGeometry = {
  heightScale: number;
  hitLeft: number;
  hitRight: number;
  nearLeft: number;
  nearRight: number;
};

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
const COLLISION_EDGE_TOLERANCE = 0.18;

const DESKTOP_CONTACT_GEOMETRY: RunnerContactGeometry = {
  heightScale: 0.82,
  hitLeft: 13.15,
  hitRight: 16.55,
  nearLeft: 11.7,
  nearRight: 18.2,
};

const MOBILE_CONTACT_GEOMETRY: RunnerContactGeometry = {
  heightScale: 0.55,
  hitLeft: 11.1,
  hitRight: 17.3,
  nearLeft: 9.4,
  nearRight: 19.2,
};

const obstacleConfigs: Omit<Obstacle, "id" | "x">[] = [
  { code: "ERR", label: "BUG", tone: "bug", width: 10, hitHeight: 0.22 },
  { code: "404", label: "NOT FOUND", tone: "network", width: 10, hitHeight: 0.19 },
  { code: "504", label: "TIMEOUT", tone: "network", width: 12, hitHeight: 0.24 },
  { code: "CI", label: "BUILD FAIL", tone: "build", width: 14, hitHeight: 0.27 },
  { code: "GIT", label: "CONFLICT", tone: "build", width: 15, hitHeight: 0.3 },
  { code: "RAM", label: "MEMORY LEAK", tone: "memory", width: 15, hitHeight: 0.27 },
  { code: "TS", label: "TYPE ERROR", tone: "type", width: 13, hitHeight: 0.24 },
  { code: "429", label: "RATE LIMIT", tone: "rate", width: 12, hitHeight: 0.23 },
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
    subtitle: "Atravesse um pipeline vivo. Quanto mais tempo a execução permanece saudável, mais rápido o deploy fica.",
    eyebrow: "DEPLOY PIPELINE / LIVE RUN",
    start: "Iniciar deploy",
    restart: "Nova execução",
    pause: "Pausar",
    resume: "Retomar",
    jump: "Pular",
    score: "score",
    best: "recorde",
    speed: "ritmo",
    cleared: "resolvidos",
    stage: "ambiente",
    next: "próximo",
    maxStage: "pipeline estabilizado",
    near: "risco crítico",
    autoPaused: "Execução pausada automaticamente porque a janela perdeu o foco.",
    started: "Deploy iniciado.",
    paused: "Deploy pausado.",
    resumed: "Deploy retomado.",
    gameOverAnnouncement: "Pipeline interrompido. Resultado pronto para o ranking.",
    idleTitle: "Mantenha o deploy vivo.",
    idleText: "Salte sobre falhas de build, rede e memória. O ritmo aumenta em cinco ambientes, sem gerar sequências fisicamente impossíveis.",
    gameOverTitle: "Pipeline interrompido.",
    gameOverText: "A falha derrubou a execução. Seu melhor resultado continua valendo no ranking.",
    pausedTitle: "Execução congelada.",
    pausedText: "O relógio e o pipeline estão parados. Retome quando estiver pronto.",
    scoreSummary: "score final",
    clearedSummary: "falhas resolvidas",
    nearSummary: "quase colisões",
    timeSummary: "tempo online",
    consoleTitle: "RUN CONTROL",
    consoleStatus: "status",
    controlsTitle: "atalhos",
    scoringTitle: "pontuação",
    jumpKey: "SPACE / ↑",
    pauseKey: "P",
    restartKey: "R",
    jumpHint: "pular",
    pauseHint: "pausar",
    restartHint: "reiniciar",
    survival: "+8/s",
    survivalLabel: "online",
    clearReward: `+${RUNTIME_SCORE_REWARDS.cleared}`,
    clearLabel: "falha evitada",
    nearReward: `+${RUNTIME_SCORE_REWARDS.nearMiss}`,
    nearLabel: "quase colisão",
    reduced: "Movimento reduzido ativo",
    live: "LIVE",
    ready: "READY",
    failed: "FAILED",
    hold: "PAUSED",
    swipe: "Toque ou swipe ↑ no mobile",
    status: {
      idle: "aguardando execução",
      running: "pipeline online",
      paused: "execução pausada",
      gameOver: "pipeline interrompido",
    },
    stages: {
      "dev-server": "Dev Server",
      staging: "Staging",
      production: "Produção",
      "incident-mode": "Incident Mode",
      "zero-downtime": "Zero Downtime",
    },
    pulseClear: `+${RUNTIME_SCORE_REWARDS.cleared} RESOLVIDO`,
    pulseNear: `+${RUNTIME_SCORE_REWARDS.nearMiss} NEAR MISS`,
    pulseStage: "CHECKPOINT",
    newRecord: "novo recorde pessoal",
    currentRecord: "recorde pessoal",
  },
  en: {
    title: "Runtime Runner",
    subtitle: "Cross a live pipeline. The longer execution stays healthy, the faster deployment becomes.",
    eyebrow: "DEPLOY PIPELINE / LIVE RUN",
    start: "Start deploy",
    restart: "New run",
    pause: "Pause",
    resume: "Resume",
    jump: "Jump",
    score: "score",
    best: "record",
    speed: "pace",
    cleared: "resolved",
    stage: "environment",
    next: "next",
    maxStage: "pipeline stabilized",
    near: "critical risk",
    autoPaused: "Execution paused automatically because the window lost focus.",
    started: "Deploy started.",
    paused: "Deploy paused.",
    resumed: "Deploy resumed.",
    gameOverAnnouncement: "Pipeline interrupted. Result ready for the leaderboard.",
    idleTitle: "Keep the deploy alive.",
    idleText: "Jump over build, network, and memory failures. Pace increases through five environments without physically impossible sequences.",
    gameOverTitle: "Pipeline interrupted.",
    gameOverText: "The failure stopped execution. Your best result still defines your leaderboard position.",
    pausedTitle: "Execution frozen.",
    pausedText: "The clock and pipeline are stopped. Resume whenever you are ready.",
    scoreSummary: "final score",
    clearedSummary: "failures resolved",
    nearSummary: "near misses",
    timeSummary: "uptime",
    consoleTitle: "RUN CONTROL",
    consoleStatus: "status",
    controlsTitle: "shortcuts",
    scoringTitle: "scoring",
    jumpKey: "SPACE / ↑",
    pauseKey: "P",
    restartKey: "R",
    jumpHint: "jump",
    pauseHint: "pause",
    restartHint: "restart",
    survival: "+8/s",
    survivalLabel: "online",
    clearReward: `+${RUNTIME_SCORE_REWARDS.cleared}`,
    clearLabel: "failure avoided",
    nearReward: `+${RUNTIME_SCORE_REWARDS.nearMiss}`,
    nearLabel: "near miss",
    reduced: "Reduced motion active",
    live: "LIVE",
    ready: "READY",
    failed: "FAILED",
    hold: "PAUSED",
    swipe: "Tap or swipe ↑ on mobile",
    status: {
      idle: "waiting for execution",
      running: "pipeline online",
      paused: "execution paused",
      gameOver: "pipeline interrupted",
    },
    stages: {
      "dev-server": "Dev Server",
      staging: "Staging",
      production: "Production",
      "incident-mode": "Incident Mode",
      "zero-downtime": "Zero Downtime",
    },
    pulseClear: `+${RUNTIME_SCORE_REWARDS.cleared} RESOLVED`,
    pulseNear: `+${RUNTIME_SCORE_REWARDS.nearMiss} NEAR MISS`,
    pulseStage: "CHECKPOINT",
    newRecord: "new personal record",
    currentRecord: "personal record",
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

function runnerContactGeometry(mobile: boolean) {
  return mobile ? MOBILE_CONTACT_GEOMETRY : DESKTOP_CONTACT_GEOMETRY;
}

function overlapsHorizontal(
  obstacle: Obstacle,
  left: number,
  right: number,
  tolerance = 0,
) {
  return obstacle.x < right - tolerance && obstacle.x + obstacle.width > left + tolerance;
}

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const remainder = whole % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
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

    if (statusRef.current === "gameOver") return;

    if (statusRef.current === "idle") {
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
      if (target instanceof HTMLElement && target.closest("button, a, input, textarea, select, [contenteditable='true']")) return;

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
        if (statusRef.current === "gameOver") return;
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

      const contact = runnerContactGeometry(mobilePlayfield);
      const collision = obstacles.some((obstacle) => {
        const hitsRunnerX = overlapsHorizontal(
          obstacle,
          contact.hitLeft,
          contact.hitRight,
          COLLISION_EDGE_TOLERANCE,
        );
        const collisionHeight = obstacle.hitHeight * contact.heightScale;
        return elapsed > 1 && hitsRunnerX && runnerY < collisionHeight;
      });

      let nearMissNow = 0;
      if (!collision) {
        for (const obstacle of obstacles) {
          if (nearMissedObstacleIdsRef.current.has(obstacle.id)) continue;

          const hitsNearWindow = overlapsHorizontal(obstacle, contact.nearLeft, contact.nearRight);
          const collisionHeight = obstacle.hitHeight * contact.heightScale;
          const closeHeight = collisionHeight + (mobilePlayfield ? 0.18 : 0.2);
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

  const contact = runnerContactGeometry(mobilePlayfield);
  const stageProgress = useMemo(() => runtimeStageProgress(frame.elapsed), [frame.elapsed]);
  const currentBest = Math.max(bestScore, frame.runScore);
  const isNewRecord = status === "gameOver" && frame.runScore > 0 && frame.runScore >= bestScore;
  const isDanger = useMemo(
    () => status === "running" && frame.obstacles.some((obstacle) => overlapsHorizontal(obstacle, contact.nearLeft, contact.nearRight)),
    [contact.nearLeft, contact.nearRight, frame.obstacles, status],
  );
  const pulseText = frame.pulseKind === "near"
    ? t.pulseNear
    : frame.pulseKind === "stage"
      ? `${t.pulseStage} · ${t.stages[frame.stage]}`
      : t.pulseClear;
  const nextStageLabel = stageProgress.nextStage
    ? `${t.next}: ${t.stages[stageProgress.nextStage]} · ${Math.ceil(stageProgress.secondsRemaining)}s`
    : t.maxStage;

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || statusRef.current === "gameOver") return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || statusRef.current === "gameOver") {
      pointerStartRef.current = null;
      return;
    }
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

  return (
    <section className={styles.root} aria-labelledby="runtime-runner-title" ref={rootRef}>
      <header className={styles.runnerHeader}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h2 id="runtime-runner-title">{t.title}</h2>
          <p className={styles.subtitle} id="runtime-instructions">{t.subtitle}</p>
        </div>
        <div className={styles.liveStatus} data-status={status}>
          <i aria-hidden="true" />
          <span>{status === "running" ? t.live : status === "paused" ? t.hold : status === "gameOver" ? t.failed : t.ready}</span>
        </div>
      </header>

      <div className={styles.gameShell}>
        <div
          aria-describedby="runtime-instructions"
          aria-label={`${t.title}: ${t.status[status]}`}
          className={styles.playfield}
          data-danger={isDanger ? "true" : "false"}
          data-state={status}
          onPointerCancel={() => { pointerStartRef.current = null; }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          tabIndex={0}
        >
          <div className={styles.environment} aria-hidden="true">
            <div className={styles.environmentGlow} />
            <div className={styles.pipelineGrid} />
            <div className={styles.pipelineLanes} />
            <div className={styles.pipelinePacket} />
            <div className={styles.pipelinePacketSecondary} />
          </div>

          <div className={styles.hud} aria-hidden="true">
            <div className={styles.metricPrimary}>
              <span>{t.score}</span>
              <strong>{frame.runScore}</strong>
            </div>
            <div className={styles.metric}><span>{t.best}</span><strong>{currentBest}</strong></div>
            <div className={styles.metric}><span>{t.speed}</span><strong>{frame.speed.toFixed(1)}x</strong></div>
            <div className={styles.metric}><span>{t.cleared}</span><strong>{frame.cleared}</strong></div>
          </div>

          <div className={styles.stageRail} aria-hidden="true">
            <div className={styles.stageMeta}>
              <span>{t.stages[frame.stage]}</span>
              <small>{nextStageLabel}</small>
            </div>
            <div className={styles.stageTrack}>
              <i style={{ "--stage-progress": stageProgress.progress } as StyleVars} />
            </div>
          </div>

          <div className={styles.track} aria-hidden="true">
            <span className={styles.trackLabel}>main</span>
            <span className={styles.trackNode} />
            <span className={styles.trackNode} />
            <span className={styles.trackNode} />
          </div>
          <div className={styles.ground} aria-hidden="true" />

          <span
            aria-hidden="true"
            className={styles.runner}
            data-air={frame.runnerY > 0 ? "true" : "false"}
            style={{ "--runner-y": frame.runnerY } as StyleVars}
          >
            <span className={styles.runnerPrompt}>&gt;_</span>
            <span className={styles.runnerSignal} />
          </span>

          {frame.obstacles.map((obstacle) => (
            <span
              aria-hidden="true"
              className={styles.obstacle}
              data-near={overlapsHorizontal(obstacle, contact.nearLeft, contact.nearRight) ? "true" : "false"}
              key={obstacle.id}
              style={{
                "--obstacle-color": obstacleColors[obstacle.tone],
                "--obstacle-height": obstacle.hitHeight,
                "--obstacle-width": obstacle.width,
                "--obstacle-x": obstacle.x,
              } as StyleVars}
            >
              <small>{obstacle.code}</small>
              <b>{obstacle.label}</b>
            </span>
          ))}

          {frame.pulse > 0 && frame.pulseKind ? (
            <span className={styles.eventPulse} data-kind={frame.pulseKind} key={frame.pulse}>{pulseText}</span>
          ) : null}
          {isDanger ? <span className={styles.dangerCue}>{t.near}</span> : null}

          {status === "idle" ? (
            <div className={styles.stateOverlay}>
              <div className={styles.stateCard}>
                <span className={styles.stateCode}>READY / 200</span>
                <h3>{t.idleTitle}</h3>
                <p>{t.idleText}</p>
                <div className={styles.quickKeys} aria-hidden="true">
                  <span><kbd>{t.jumpKey}</kbd>{t.jumpHint}</span>
                  <span><kbd>{t.pauseKey}</kbd>{t.pauseHint}</span>
                  <span><kbd>{t.restartKey}</kbd>{t.restartHint}</span>
                </div>
                <button className={styles.primaryAction} onClick={() => startRun(false)} type="button">
                  <span>{t.start}</span><i aria-hidden="true">↗</i>
                </button>
                <small>{t.swipe}</small>
              </div>
            </div>
          ) : null}

          {status === "paused" ? (
            <div className={styles.stateOverlay}>
              <div className={styles.stateCard} data-compact="true">
                <span className={styles.stateCode}>PAUSE / HOLD</span>
                <h3>{t.pausedTitle}</h3>
                <p>{autoPaused ? t.autoPaused : t.pausedText}</p>
                <button className={styles.primaryAction} onClick={togglePause} type="button">
                  <span>{t.resume}</span><i aria-hidden="true">▶</i>
                </button>
              </div>
            </div>
          ) : null}

          {status === "gameOver" ? (
            <div className={styles.stateOverlay}>
              <div className={styles.stateCard} data-game-over="true">
                <div className={styles.resultHeading}>
                  <span className={styles.stateCode}>PIPELINE / FAILED</span>
                  <span className={styles.recordBadge} data-record={isNewRecord ? "true" : "false"}>
                    {isNewRecord ? t.newRecord : t.currentRecord}
                  </span>
                </div>
                <h3>{t.gameOverTitle}</h3>
                <p>{t.gameOverText}</p>
                <div className={styles.resultGrid}>
                  <div><span>{t.scoreSummary}</span><strong>{frame.runScore}</strong></div>
                  <div><span>{t.timeSummary}</span><strong>{formatTime(frame.elapsed)}</strong></div>
                  <div><span>{t.clearedSummary}</span><strong>{frame.cleared}</strong></div>
                  <div><span>{t.nearSummary}</span><strong>{frame.nearMisses}</strong></div>
                </div>
                <button className={styles.primaryAction} onClick={() => startRun(false)} type="button">
                  <span>{t.restart}</span><i aria-hidden="true">↻</i>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className={styles.console} aria-label={t.consoleTitle}>
          <div className={styles.consoleHeader}>
            <div>
              <span>{t.consoleTitle}</span>
              <strong>{t.status[status]}</strong>
            </div>
            <i data-status={status} aria-hidden="true" />
          </div>

          <button
            className={styles.consolePrimary}
            onClick={status === "running" ? requestJump : status === "paused" ? togglePause : () => startRun(false)}
            type="button"
          >
            <span>{status === "running" ? t.jump : status === "paused" ? t.resume : status === "gameOver" ? t.restart : t.start}</span>
            <kbd>{status === "running" ? "↑" : "↵"}</kbd>
          </button>

          <div className={styles.consoleActions}>
            <button disabled={status === "idle" || status === "gameOver"} onClick={togglePause} type="button">
              <kbd>P</kbd><span>{status === "paused" ? t.resume : t.pause}</span>
            </button>
            <button onClick={() => startRun(false)} type="button"><kbd>R</kbd><span>{t.restart}</span></button>
          </div>

          <div className={styles.consoleBlock}>
            <p>{t.scoringTitle}</p>
            <div className={styles.rewardList}>
              <div><strong>{t.survival}</strong><span>{t.survivalLabel}</span></div>
              <div><strong>{t.clearReward}</strong><span>{t.clearLabel}</span></div>
              <div><strong>{t.nearReward}</strong><span>{t.nearLabel}</span></div>
            </div>
          </div>

          <div className={styles.consoleBlock}>
            <p>{t.stage}</p>
            <div className={styles.stageList}>
              {(["dev-server", "staging", "production", "incident-mode", "zero-downtime"] as RuntimeStage[]).map((stage) => (
                <span data-active={frame.stage === stage ? "true" : "false"} key={stage}>{t.stages[stage]}</span>
              ))}
            </div>
          </div>

          {reducedMotion ? <div className={styles.reducedNotice}>{t.reduced}</div> : null}
        </aside>
      </div>

      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</span>
    </section>
  );
}
