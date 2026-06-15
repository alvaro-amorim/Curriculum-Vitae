"use client";

import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent, TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GAME_VERSIONS, clampScore, detectGameDeviceType } from "@/lib/lab-score";
import type { GameScorePayloadV2, Locale } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type RunnerStatus = "idle" | "running" | "paused" | "gameOver";
type RunnerStage = "dev-server" | "staging" | "production" | "incident-mode" | "zero-downtime";
type RunnerPulseKind = "clear" | "milestone" | "near" | null;

type Obstacle = {
  id: number;
  label: string;
  tone: "bug" | "network" | "build" | "memory" | "type" | "rate";
  x: number;
  width: number;
  hitHeight: number;
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
  nearMisses: number;
  spawnIn: number;
  pulse: number;
  pulseKind: RunnerPulseKind;
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
const REDUCED_JUMP_VELOCITY = 1.38;
const SWIPE_THRESHOLD = 34;
const MOBILE_QUERY = "(max-width: 640px)";

const obstacleConfigs: Omit<Obstacle, "id" | "x">[] = [
  { label: "BUG", tone: "bug", width: 10, hitHeight: 0.22 },
  { label: "404", tone: "network", width: 9, hitHeight: 0.19 },
  { label: "TIMEOUT", tone: "network", width: 12, hitHeight: 0.24 },
  { label: "BUILD FAIL", tone: "build", width: 14, hitHeight: 0.27 },
  { label: "MERGE CONFLICT", tone: "build", width: 18, hitHeight: 0.3 },
  { label: "MEMORY LEAK", tone: "memory", width: 16, hitHeight: 0.27 },
  { label: "TYPE ERROR", tone: "type", width: 14, hitHeight: 0.24 },
  { label: "RATE LIMIT", tone: "rate", width: 13, hitHeight: 0.23 },
];

const obstacleToneClasses: Record<Obstacle["tone"], string> = {
  bug: styles.obstacleToneBug,
  network: styles.obstacleToneNetwork,
  build: styles.obstacleToneBuild,
  memory: styles.obstacleToneMemory,
  type: styles.obstacleToneType,
  rate: styles.obstacleToneRate,
};

function runnerStageReached(elapsed: number): RunnerStage {
  if (elapsed >= 90) return "zero-downtime";
  if (elapsed >= 62) return "incident-mode";
  if (elapsed >= 38) return "production";
  if (elapsed >= 18) return "staging";
  return "dev-server";
}

function runnerDifficulty(elapsed: number, mobilePlayfield: boolean, reducedMotion: boolean) {
  const stage = runnerStageReached(elapsed);
  const stageLevel: Record<RunnerStage, number> = {
    "dev-server": 0,
    staging: 1,
    production: 2,
    "incident-mode": 3,
    "zero-downtime": 4,
  };
  const level = stageLevel[stage];

  return {
    acceleration: (reducedMotion ? 0.46 : mobilePlayfield ? 0.38 : 0.7) + level * (reducedMotion ? 0.02 : mobilePlayfield ? 0.045 : 0.075),
    baseSpeed: reducedMotion ? 16.5 : mobilePlayfield ? 14.8 : 18.5,
    cadenceDecay: mobilePlayfield ? 0.0075 : 0.0125,
    jitter: mobilePlayfield ? 0.5 : 0.42,
    maxSpeed: reducedMotion ? 32 : mobilePlayfield ? 30.5 : 43.5,
    minCadence: Math.max(reducedMotion ? 1.34 : mobilePlayfield ? 1.32 : 1.08, (mobilePlayfield ? 1.42 : 1.16) - level * (mobilePlayfield ? 0.02 : 0.035)),
    startCadence: (mobilePlayfield ? 1.9 : 1.72) - level * (mobilePlayfield ? 0.025 : 0.04),
    stage,
  };
}

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
    stage: "fase",
    cleared: "erros evitados",
    near: "quase colisão",
    idleTitle: "Desvie dos erros antes do build cair.",
    idleText: "Mobile: deslize para cima ou toque para pular. Desktop: Space ou ArrowUp. Sobreviva aos bugs.",
    gameOverTitle: "Pipeline quebrado.",
    gameOverText: "Reinicie para tentar um score maior. O resultado é enviado ao ranking e o melhor local segue salvo no navegador.",
    rulesTitle: "Regras",
    rules: [
      "Space ou ArrowUp fazem o runtime saltar.",
      "No mobile, swipe up ou toque no palco funciona como salto.",
      "A velocidade aumenta com o tempo.",
      "Colisão encerra a rodada, salva o melhor local e envia o score persistente.",
    ],
    reduced: "Modo reduced motion: animações decorativas reduzidas e velocidade mais controlada.",
    pulses: {
      clear: "+18 erro evitado",
      milestone: "checkpoint +100",
      near: "quase colisão",
    },
    stages: {
      "dev-server": "Dev server",
      staging: "Staging",
      production: "Produção",
      "incident-mode": "Incidente",
      "zero-downtime": "Zero downtime",
    },
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
    stage: "stage",
    cleared: "errors avoided",
    near: "near miss",
    idleTitle: "Avoid errors before the build fails.",
    idleText: "Mobile: swipe up or tap to jump. Desktop: Space or ArrowUp. Survive the bugs.",
    gameOverTitle: "Pipeline failed.",
    gameOverText: "Restart to chase a higher score. The result is submitted to the ranking and the local best stays in the browser.",
    rulesTitle: "Rules",
    rules: [
      "Space or ArrowUp make the runtime jump.",
      "On mobile, swipe up or tap the stage to jump.",
      "Speed increases over time.",
      "Collision ends the run, saves the local best, and submits the persistent score.",
    ],
    reduced: "Reduced motion mode: decorative animation is reduced and speed is more controlled.",
    pulses: {
      clear: "+18 error avoided",
      milestone: "checkpoint +100",
      near: "near miss",
    },
    stages: {
      "dev-server": "Dev server",
      staging: "Staging",
      production: "Production",
      "incident-mode": "Incident",
      "zero-downtime": "Zero downtime",
    },
  },
} as const;

function createInitialFrame(): RunnerFrame {
  return {
    elapsed: 0,
    runScore: 0,
    apiScore: 0,
    speed: 18.5,
    runnerY: 0,
    velocity: 0,
    obstacles: [],
    cleared: 0,
    nearMisses: 0,
    spawnIn: 1.18,
    pulse: 0,
    pulseKind: null,
  };
}

function createObstacle(id: number): Obstacle {
  const config = obstacleConfigs[id % obstacleConfigs.length];

  return {
    id,
    ...config,
    x: 104,
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
  const [mobilePlayfield, setMobilePlayfield] = useState(false);
  const stateRef = useRef<RunnerFrame>(createInitialFrame());
  const statusRef = useRef<RunnerStatus>("idle");
  const rootRef = useRef<HTMLElement | null>(null);
  const obstacleIdRef = useRef(0);
  const completedRef = useRef(false);
  const lastPointerActionRef = useRef(0);
  const lastGroundedAtRef = useRef(0);
  const pendingJumpAtRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const nearMissedObstacleIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser preferences and localStorage are client-only.
    setBestScore(readBestScore());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMedia = window.matchMedia(MOBILE_QUERY);
    setReducedMotion(media.matches);
    setMobilePlayfield(mobileMedia.matches);

    const handleChange = () => setReducedMotion(media.matches);
    const handleMobileChange = () => setMobilePlayfield(mobileMedia.matches);
    media.addEventListener("change", handleChange);
    mobileMedia.addEventListener("change", handleMobileChange);
    return () => {
      media.removeEventListener("change", handleChange);
      mobileMedia.removeEventListener("change", handleMobileChange);
    };
  }, []);

  const speedLabel = useMemo(() => `${Math.round(frame.speed)}x`, [frame.speed]);
  const currentStage = runnerStageReached(frame.elapsed);
  const currentStageLabel = t.stages[currentStage];
  const isDanger = useMemo(
    () =>
      status === "running" &&
      frame.obstacles.some((obstacle) => obstacle.x < 34 && obstacle.x + obstacle.width > 7 && frame.runnerY < obstacle.hitHeight + 0.16),
    [frame.obstacles, frame.runnerY, status],
  );

  const commitFrame = useCallback((next: RunnerFrame) => {
    stateRef.current = next;
    setFrame(next);
  }, []);

  const startRun = useCallback(() => {
    const next = {
      ...createInitialFrame(),
      obstacles: [],
      speed: reducedMotion ? 16.5 : mobilePlayfield ? 14.8 : 18.5,
      spawnIn: reducedMotion ? 1.45 : mobilePlayfield ? 1.5 : 1.22,
    };
    completedRef.current = false;
    obstacleIdRef.current = 1;
    nearMissedObstacleIdsRef.current.clear();
    lastGroundedAtRef.current = performance.now();
    pendingJumpAtRef.current = null;
    commitFrame(next);
    setStatus("running");
  }, [commitFrame, mobilePlayfield, reducedMotion]);

  const finishRun = useCallback(
    (next: RunnerFrame) => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;
      pendingJumpAtRef.current = null;
      commitFrame(next);
      setStatus("gameOver");
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
          stageReached: runnerStageReached(next.elapsed),
        },
        score: next.apiScore,
      });
    },
    [commitFrame, onComplete],
  );

  const jump = useCallback(() => {
    const now = performance.now();
    pendingJumpAtRef.current = now;

    if (statusRef.current === "idle" || statusRef.current === "gameOver") {
      startRun();
      pendingJumpAtRef.current = now;
      return;
    }

    if (statusRef.current !== "running") {
      return;
    }

    const current = stateRef.current;
    const canJump = current.runnerY <= GROUND_EPSILON || now - lastGroundedAtRef.current <= COYOTE_TIME_MS;
    if (!canJump) {
      return;
    }

    pendingJumpAtRef.current = null;
    commitFrame({
      ...current,
      runnerY: Math.max(current.runnerY, 0.03),
      velocity: reducedMotion ? REDUCED_JUMP_VELOCITY : JUMP_VELOCITY,
    });
  }, [commitFrame, reducedMotion, startRun]);

  const handleStagePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") {
        event.preventDefault();
      }

      lastPointerActionRef.current = performance.now();
      jump();
    },
    [jump],
  );

  const handleStageClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (performance.now() - lastPointerActionRef.current < 260) {
        event.preventDefault();
        return;
      }

      jump();
    },
    [jump],
  );

  const handleStageTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }, []);

  const handleStageTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      const touch = event.changedTouches[0];
      touchStartRef.current = null;

      if (!start || !touch) {
        return;
      }

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) < Math.abs(dx) || dy > 0) {
        return;
      }

      event.preventDefault();
      jump();
    },
    [jump],
  );

  const togglePause = useCallback(() => {
    setStatus((current) => {
      if (current === "running") return "paused";
      if (current === "paused") return "running";
      return current;
    });
  }, []);

  useEffect(() => {
    function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      const activeElement = document.activeElement;
      const isFocusedInside = activeElement instanceof HTMLElement && rootRef.current?.contains(activeElement);
      if (!isFocusedInside && statusRef.current !== "running" && statusRef.current !== "paused") {
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
      const gravity = reducedMotion ? 2.28 : 2.82;
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
        velocity = reducedMotion ? REDUCED_JUMP_VELOCITY : JUMP_VELOCITY;
      }

      const elapsed = current.elapsed + delta;
      const difficulty = runnerDifficulty(elapsed, mobilePlayfield, reducedMotion);
      const speed = Math.min(difficulty.maxSpeed, difficulty.baseSpeed + elapsed * difficulty.acceleration);
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
        const cadence = Math.max(difficulty.minCadence, difficulty.startCadence - elapsed * difficulty.cadenceDecay);
        spawnIn = cadence + Math.random() * difficulty.jitter;
      }

      const nearMissNow = obstacles.reduce((count, obstacle) => {
        if (nearMissedObstacleIdsRef.current.has(obstacle.id)) {
          return count;
        }

        const hitsNearWindow = mobilePlayfield
          ? obstacle.x < 21 && obstacle.x + obstacle.width > 10.8
          : obstacle.x < 22.5 && obstacle.x + obstacle.width > 11.4;
        const collisionHeight = obstacle.hitHeight * (mobilePlayfield ? 0.68 : 0.88);
        const closeHeight = obstacle.hitHeight + (mobilePlayfield ? 0.17 : 0.22);
        const isNearMiss =
          elapsed > (mobilePlayfield ? 1.35 : 1) && hitsNearWindow && runnerY >= collisionHeight && runnerY < closeHeight;

        if (!isNearMiss) {
          return count;
        }

        nearMissedObstacleIdsRef.current.add(obstacle.id);
        return count + 1;
      }, 0);

      const collision = obstacles.some((obstacle) => {
        const hitsRunnerX = mobilePlayfield
          ? obstacle.x < 15.7 && obstacle.x + obstacle.width > 13.2
          : obstacle.x < 17.2 && obstacle.x + obstacle.width > 14.4;
        return elapsed > (mobilePlayfield ? 1.35 : 1) && hitsRunnerX && runnerY < obstacle.hitHeight * (mobilePlayfield ? 0.68 : 0.88);
      });

      const cleared = current.cleared + clearedNow;
      const nearMisses = current.nearMisses + nearMissNow;
      const runScore = Math.floor(elapsed * 8 + cleared * 22);
      const apiScore = clampScore(runScore / 6);
      const crossedMilestone = Math.floor(runScore / 100) > Math.floor(current.runScore / 100);
      const shouldPulse = nearMissNow > 0 || clearedNow > 0 || crossedMilestone;
      const next = {
        elapsed,
        runScore,
        apiScore,
        speed,
        runnerY,
        velocity,
        obstacles,
        cleared,
        nearMisses,
        spawnIn,
        pulse: shouldPulse ? current.pulse + 1 : current.pulse,
        pulseKind: crossedMilestone ? "milestone" : nearMissNow > 0 ? "near" : clearedNow > 0 ? "clear" : current.pulseKind,
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
  }, [commitFrame, finishRun, mobilePlayfield, reducedMotion, status]);

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
    <section aria-labelledby="runtime-runner-title" ref={rootRef}>
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
          className={[
            styles.runnerStage,
            frame.runnerY > 0 ? styles.runnerStageAir : "",
            isDanger ? styles.runnerStageDanger : "",
            status === "paused" ? styles.runnerStagePaused : "",
            status === "gameOver" ? styles.runnerStageHit : "",
          ].join(" ")}
          onClick={handleStageClick}
          onKeyDown={handleKeyDown}
          onPointerDown={handleStagePointerDown}
          onTouchEnd={handleStageTouchEnd}
          onTouchStart={handleStageTouchStart}
          role="button"
          tabIndex={0}
        >
          <div className={styles.runnerHud}>
            <div>
              <span>{t.score}</span>
              <strong aria-live="polite" className={frame.pulse > 0 ? styles.runnerScorePulse : undefined} key={`runner-score-${frame.pulse}`}>
                {frame.runScore}
              </strong>
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

          <div className={styles.runnerStageBadge}>
            <span>{t.stage}</span>
            <strong>{currentStageLabel}</strong>
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
              className={`${styles.obstacle} ${obstacleToneClasses[obstacle.tone]} ${
                status === "running" && obstacle.x < 33 && obstacle.x > 13 ? styles.obstacleNear : ""
              }`}
              key={obstacle.id}
              style={{ "--x": obstacle.x, "--w": obstacle.width } as StyleVars}
            >
              {obstacle.label}
            </span>
          ))}

          {frame.pulse > 0 && frame.pulseKind ? (
            <span className={styles.collectPulse} key={frame.pulse}>
              {t.pulses[frame.pulseKind]}
            </span>
          ) : null}

          {isDanger ? <span className={styles.runnerDangerCue}>{t.near}</span> : null}

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
              <button
                className={`${styles.runnerAction} ${styles.runnerActionPrimary} ${status === "running" ? styles.mobileGameplayControl : ""}`}
                onClick={jump}
                type="button"
              >
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
