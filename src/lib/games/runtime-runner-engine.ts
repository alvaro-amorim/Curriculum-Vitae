export type RuntimeStage =
  | "dev-server"
  | "staging"
  | "production"
  | "incident-mode"
  | "zero-downtime";

export type RuntimeDifficulty = {
  acceleration: number;
  baseSpeed: number;
  jitter: number;
  maxSpeed: number;
  minCadence: number;
  stage: RuntimeStage;
  startCadence: number;
};

export const RUNTIME_SCORE_REWARDS = {
  cleared: 22,
  nearMiss: 8,
  survivalPerSecond: 8,
} as const;

export const RUNTIME_STAGE_THRESHOLDS = [
  { stage: "dev-server", startsAt: 0 },
  { stage: "staging", startsAt: 18 },
  { stage: "production", startsAt: 38 },
  { stage: "incident-mode", startsAt: 62 },
  { stage: "zero-downtime", startsAt: 90 },
] as const satisfies readonly { stage: RuntimeStage; startsAt: number }[];

const DESKTOP_SAFE_MIN_CADENCE = 1.38;
const MOBILE_SAFE_MIN_CADENCE = 1.48;
const REDUCED_MOTION_SAFE_MIN_CADENCE = 1.58;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function runtimeStageReached(elapsed: number): RuntimeStage {
  const safeElapsed = Math.max(0, elapsed);

  for (let index = RUNTIME_STAGE_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    const threshold = RUNTIME_STAGE_THRESHOLDS[index];
    if (safeElapsed >= threshold.startsAt) {
      return threshold.stage;
    }
  }

  return "dev-server";
}

export function runtimeStageProgress(elapsed: number) {
  const safeElapsed = Math.max(0, elapsed);
  const currentIndex = RUNTIME_STAGE_THRESHOLDS.findIndex(
    (entry) => entry.stage === runtimeStageReached(safeElapsed),
  );
  const current = RUNTIME_STAGE_THRESHOLDS[Math.max(0, currentIndex)];
  const next = RUNTIME_STAGE_THRESHOLDS[currentIndex + 1];

  if (!next) {
    return {
      nextStage: null,
      progress: 1,
      secondsRemaining: 0,
    } as const;
  }

  const span = next.startsAt - current.startsAt;
  const progress = span <= 0 ? 1 : (safeElapsed - current.startsAt) / span;

  return {
    nextStage: next.stage,
    progress: clamp(progress, 0, 1),
    secondsRemaining: Math.max(0, next.startsAt - safeElapsed),
  } as const;
}

export function runtimeDifficulty(
  elapsed: number,
  mobilePlayfield: boolean,
  reducedMotion: boolean,
): RuntimeDifficulty {
  const stage = runtimeStageReached(elapsed);
  const stageLevel: Record<RuntimeStage, number> = {
    "dev-server": 0,
    staging: 1,
    production: 2,
    "incident-mode": 3,
    "zero-downtime": 4,
  };
  const level = stageLevel[stage];

  const minCadence = reducedMotion
    ? REDUCED_MOTION_SAFE_MIN_CADENCE
    : mobilePlayfield
      ? MOBILE_SAFE_MIN_CADENCE
      : DESKTOP_SAFE_MIN_CADENCE;

  return {
    acceleration:
      (reducedMotion ? 0.46 : mobilePlayfield ? 0.54 : 0.7) +
      level * (reducedMotion ? 0.02 : mobilePlayfield ? 0.06 : 0.075),
    baseSpeed: reducedMotion ? 16.5 : mobilePlayfield ? 18.2 : 18.5,
    jitter: reducedMotion ? 0.24 : mobilePlayfield ? 0.28 : 0.34,
    maxSpeed: reducedMotion ? 32 : mobilePlayfield ? 38 : 43.5,
    minCadence,
    stage,
    startCadence:
      (reducedMotion ? 1.78 : mobilePlayfield ? 1.68 : 1.72) -
      level * (reducedMotion ? 0.025 : mobilePlayfield ? 0.03 : 0.04),
  };
}

export function runtimeSpawnDelay(
  elapsed: number,
  mobilePlayfield: boolean,
  reducedMotion: boolean,
  randomUnit = Math.random(),
) {
  const difficulty = runtimeDifficulty(elapsed, mobilePlayfield, reducedMotion);
  const cadenceDecay = reducedMotion ? 0.0045 : mobilePlayfield ? 0.0065 : 0.008;
  const cadence = Math.max(
    difficulty.minCadence,
    difficulty.startCadence - Math.max(0, elapsed) * cadenceDecay,
  );

  return cadence + clamp(randomUnit, 0, 1) * difficulty.jitter;
}

export function calculateRuntimeScore(input: {
  cleared: number;
  elapsed: number;
  nearMisses: number;
}) {
  const survival = Math.floor(Math.max(0, input.elapsed) * RUNTIME_SCORE_REWARDS.survivalPerSecond);
  const cleared = Math.max(0, Math.floor(input.cleared)) * RUNTIME_SCORE_REWARDS.cleared;
  const nearMisses = Math.max(0, Math.floor(input.nearMisses)) * RUNTIME_SCORE_REWARDS.nearMiss;

  return survival + cleared + nearMisses;
}
