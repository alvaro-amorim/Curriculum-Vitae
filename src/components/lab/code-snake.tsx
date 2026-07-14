"use client";

import type { CSSProperties, TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GAME_VERSIONS, detectGameDeviceType } from "@/lib/lab-score";
import type { GameScorePayloadV2, Locale } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type SnakeStatus = "idle" | "running" | "paused" | "gameOver";
type Direction = "up" | "down" | "left" | "right";
type TokenKind = "TOKEN" | "API" | "CACHE" | "FIX" | "TEST" | "TYPE";
type HazardKind = "BUG" | "MEMORY LEAK" | "TYPE ERROR" | "TIMEOUT" | "NULL" | "500";
type FeedbackKind = "collect" | "turn" | "hit" | "pause" | "start" | "wrap";

type Position = {
  x: number;
  y: number;
};

type BoardItem<TKind extends string> = {
  id: number;
  kind: TKind;
  position: Position;
};

type SnakeFrame = {
  snake: Position[];
  direction: Direction;
  token: BoardItem<TokenKind>;
  hazards: BoardItem<HazardKind>[];
  score: number;
  collected: number;
  combo: number;
  maxCombo: number;
  moves: number;
  pulse: number;
  feedback: FeedbackKind | null;
  crash: string | null;
};

type CodeSnakeProps = {
  locale: Locale;
  onComplete: (payload: Extract<GameScorePayloadV2, { game: "code-snake" }>) => void;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const GRID_SIZE = 13;
const BEST_SCORE_KEY = "alvaro-dev-code-snake-best-v1";
const WALLS_KEY = "alvaro-dev-code-snake-walls-v1";
const SWIPE_THRESHOLD = 34;
const MOBILE_QUERY = "(max-width: 640px)";
const tokenKinds: TokenKind[] = ["TOKEN", "API", "CACHE", "FIX", "TEST", "TYPE"];
const hazardKinds: HazardKind[] = ["BUG", "MEMORY LEAK", "TYPE ERROR", "TIMEOUT", "NULL", "500"];

const directionDelta: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const oppositeDirection: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const copy = {
  pt: {
    eyebrow: "Code Snake",
    title: "Conduza a pipeline viva.",
    subtitle:
      "Uma cobrinha técnica em grid: colete tokens úteis, cresça com controle e evite bugs antes da regressão.",
    start: "Iniciar Code Snake",
    restart: "Reiniciar",
    pause: "Pausar",
    resume: "Retomar",
    score: "score",
    best: "melhor",
    length: "tamanho",
    walls: "paredes",
    wallsOn: "ON / desafio",
    wallsOff: "OFF / wrap",
    wallsToggle: "Alternar paredes",
    wrapMode: "wrap ativo",
    tokens: "tokens",
    combo: "combo",
    speed: "cadência",
    danger: "perigo próximo",
    crashReason: "causa",
    status: {
      idle: "pipeline pronta",
      running: "execução viva",
      paused: "execução pausada",
      gameOver: "regressão detectada",
    },
    idleTitle: "Colete tokens sem quebrar a cadeia.",
    idleText:
      "Deslize no palco para virar. Com paredes OFF, atravesse as bordas e continue a pipeline.",
    gameOverTitle: "Pipeline colidiu.",
    gameOverText: "A colisão salva o melhor local e envia o score persistente sem bloquear a interface.",
    controlsTitle: "Controles",
    rulesTitle: "Regras",
    rules: [
      "Setas ou WASD mudam a direção.",
      "Space inicia, pausa e retoma.",
      "Tokens fazem a snake crescer e aceleram aos poucos.",
      "Com paredes OFF, bordas fazem wrap-around; com paredes ON, bater na parede encerra a rodada.",
      "Corpo ou bug encerram a rodada em qualquer modo.",
    ],
    reduced: "Modo reduced motion: efeitos decorativos reduzidos, loop preservado.",
    feedback: {
      collect: "+token coletado",
      turn: "direção ajustada",
      hit: "regressão introduzida",
      pause: "pipeline em hold",
      start: "pipeline online",
      wrap: "borda atravessada",
    },
    crashLabels: {
      wall: "parede",
      body: "corpo",
      BUG: "BUG",
      "MEMORY LEAK": "MEMORY LEAK",
      "TYPE ERROR": "TYPE ERROR",
      TIMEOUT: "TIMEOUT",
      NULL: "NULL",
      "500": "500",
    },
    directions: {
      up: "Mover para cima",
      down: "Mover para baixo",
      left: "Mover para esquerda",
      right: "Mover para direita",
    },
  },
  en: {
    eyebrow: "Code Snake",
    title: "Guide the living pipeline.",
    subtitle: "A technical grid snake: collect useful tokens, grow with control, and avoid bugs before regression.",
    start: "Start Code Snake",
    restart: "Restart",
    pause: "Pause",
    resume: "Resume",
    score: "score",
    best: "best",
    length: "length",
    walls: "walls",
    wallsOn: "ON / challenge",
    wallsOff: "OFF / wrap",
    wallsToggle: "Toggle walls",
    wrapMode: "wrap active",
    tokens: "tokens",
    combo: "combo",
    speed: "cadence",
    danger: "near hazard",
    crashReason: "cause",
    status: {
      idle: "pipeline ready",
      running: "live execution",
      paused: "execution paused",
      gameOver: "regression detected",
    },
    idleTitle: "Collect tokens without breaking the chain.",
    idleText:
      "Swipe on the stage to turn. With walls OFF, cross edges and keep the pipeline alive.",
    gameOverTitle: "Pipeline collided.",
    gameOverText: "The collision saves the local best and submits the persistent score without blocking the interface.",
    controlsTitle: "Controls",
    rulesTitle: "Rules",
    rules: [
      "Arrow keys or WASD change direction.",
      "Space starts, pauses, and resumes.",
      "Tokens grow the snake and slowly increase speed.",
      "With walls OFF, edges wrap around; with walls ON, hitting a wall ends the round.",
      "Body or bug ends the round in either mode.",
    ],
    reduced: "Reduced motion mode: decorative effects are reduced, the loop stays playable.",
    feedback: {
      collect: "+token collected",
      turn: "direction queued",
      hit: "regression introduced",
      pause: "pipeline on hold",
      start: "pipeline online",
      wrap: "edge wrapped",
    },
    crashLabels: {
      wall: "wall",
      body: "body",
      BUG: "BUG",
      "MEMORY LEAK": "MEMORY LEAK",
      "TYPE ERROR": "TYPE ERROR",
      TIMEOUT: "TIMEOUT",
      NULL: "NULL",
      "500": "500",
    },
    directions: {
      up: "Move up",
      down: "Move down",
      left: "Move left",
      right: "Move right",
    },
  },
} as const;

function samePosition(a: Position, b: Position) {
  return a.x === b.x && a.y === b.y;
}

function cellKey(position: Position) {
  return `${position.x}:${position.y}`;
}

function isInsideGrid(position: Position) {
  return position.x >= 0 && position.x < GRID_SIZE && position.y >= 0 && position.y < GRID_SIZE;
}

function wrapPosition(position: Position): Position {
  return {
    x: (position.x + GRID_SIZE) % GRID_SIZE,
    y: (position.y + GRID_SIZE) % GRID_SIZE,
  };
}

function createInitialFrame(): SnakeFrame {
  return {
    snake: [
      { x: 3, y: 6 },
      { x: 2, y: 6 },
      { x: 1, y: 6 },
    ],
    direction: "right",
    token: { id: 1, kind: "TOKEN", position: { x: 6, y: 6 } },
    hazards: [
      { id: 1, kind: "BUG", position: { x: 9, y: 2 } },
      { id: 2, kind: "TIMEOUT", position: { x: 9, y: 10 } },
      { id: 3, kind: "NULL", position: { x: 4, y: 10 } },
    ],
    score: 0,
    collected: 0,
    combo: 0,
    maxCombo: 0,
    moves: 0,
    pulse: 0,
    feedback: null,
    crash: null,
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

function readWallsEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(WALLS_KEY) === "true";
}

function randomFreeCell(occupied: Set<string>) {
  const freeCells: Position[] = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const position = { x, y };
      if (!occupied.has(cellKey(position))) {
        freeCells.push(position);
      }
    }
  }

  return freeCells[Math.floor(Math.random() * freeCells.length)] ?? { x: 6, y: 6 };
}

function createToken(id: number, snake: Position[], hazards: BoardItem<HazardKind>[]): BoardItem<TokenKind> {
  const occupied = new Set([...snake.map(cellKey), ...hazards.map((hazard) => cellKey(hazard.position))]);

  return {
    id,
    kind: tokenKinds[id % tokenKinds.length],
    position: randomFreeCell(occupied),
  };
}

function createHazard(id: number, snake: Position[], token: BoardItem<TokenKind>, hazards: BoardItem<HazardKind>[]) {
  const occupied = new Set([
    ...snake.map(cellKey),
    cellKey(token.position),
    ...hazards.map((hazard) => cellKey(hazard.position)),
  ]);

  return {
    id,
    kind: hazardKinds[id % hazardKinds.length],
    position: randomFreeCell(occupied),
  };
}

function keyToDirection(key: string): Direction | null {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "up";
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    case "arrowright":
    case "d":
      return "right";
    default:
      return null;
  }
}

export function CodeSnake({ locale, onComplete }: CodeSnakeProps) {
  const t = copy[locale];
  const [status, setStatus] = useState<SnakeStatus>("idle");
  const [frame, setFrame] = useState<SnakeFrame>(() => createInitialFrame());
  const [bestScore, setBestScore] = useState(0);
  const [wallsEnabled, setWallsEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobilePlayfield, setMobilePlayfield] = useState(false);
  const frameRef = useRef<SnakeFrame>(createInitialFrame());
  const statusRef = useRef<SnakeStatus>("idle");
  const rootRef = useRef<HTMLElement | null>(null);
  const queuedDirectionRef = useRef<Direction | null>(null);
  const completedRef = useRef(false);
  const tokenIdRef = useRef(2);
  const hazardIdRef = useRef(4);
  const touchStartRef = useRef<Position | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser preferences and localStorage are client-only.
    setBestScore(readBestScore());
    setWallsEnabled(readWallsEnabled());
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

  const toggleWalls = useCallback(() => {
    setWallsEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(WALLS_KEY, String(next));
      return next;
    });
  }, []);

  const delay = useMemo(
    () =>
      Math.max(
        reducedMotion ? 178 : mobilePlayfield ? 148 : 118,
        (reducedMotion ? 286 : mobilePlayfield ? 268 : 246) - frame.collected * (mobilePlayfield ? 8 : 11),
      ),
    [frame.collected, mobilePlayfield, reducedMotion],
  );
  const cadenceLabel = useMemo(() => `${Math.round(1000 / delay)}/s`, [delay]);
  const head = frame.snake[0] ?? { x: 0, y: 0 };
  const nearHazards = useMemo(
    () =>
      frame.hazards
        .map((hazard) => ({
          ...hazard,
          distance: Math.abs(hazard.position.x - head.x) + Math.abs(hazard.position.y - head.y),
        }))
        .filter((hazard) => hazard.distance <= 2)
        .sort((a, b) => a.distance - b.distance),
    [frame.hazards, head.x, head.y],
  );
  const nearHazardKeys = useMemo(() => new Set(nearHazards.map((hazard) => cellKey(hazard.position))), [nearHazards]);
  const isDanger = status === "running" && nearHazards.length > 0;
  const nearestHazardLabel = nearHazards[0] ? t.crashLabels[nearHazards[0].kind] : null;
  const crashLabel = frame.crash ? t.crashLabels[frame.crash as keyof typeof t.crashLabels] ?? frame.crash : null;

  const commitFrame = useCallback((next: SnakeFrame) => {
    frameRef.current = next;
    setFrame(next);
  }, []);

  const startGame = useCallback(() => {
    const next = createInitialFrame();
    completedRef.current = false;
    tokenIdRef.current = 2;
    hazardIdRef.current = 4;
    queuedDirectionRef.current = null;
    startedAtRef.current = performance.now();
    commitFrame({ ...next, feedback: "start" });
    setStatus("running");
  }, [commitFrame]);

  const finishGame = useCallback(
    (next: SnakeFrame, reason: string) => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;
      queuedDirectionRef.current = null;
      const completedFrame = {
        ...next,
        crash: reason,
        feedback: "hit" as const,
        pulse: next.pulse + 1,
      };
      commitFrame(completedFrame);
      setStatus("gameOver");
      setBestScore((current) => {
        const best = Math.max(current, completedFrame.score);
        window.localStorage.setItem(BEST_SCORE_KEY, String(best));
        return best;
      });
      onComplete({
        deviceType: detectGameDeviceType(),
        durationMs: Math.max(250, Math.round(performance.now() - startedAtRef.current)),
        game: "code-snake",
        gameVersion: GAME_VERSIONS["code-snake"],
        metadata: {
          hazardsHit: reason === "wall" || reason === "body" ? 0 : 1,
          length: completedFrame.snake.length,
          maxCombo: completedFrame.maxCombo,
          tokensCollected: completedFrame.collected,
          wallsEnabled,
          wrapAround: !wallsEnabled,
        },
        score: completedFrame.score,
      });
    },
    [commitFrame, onComplete, wallsEnabled],
  );

  const togglePause = useCallback(() => {
    const currentStatus = statusRef.current;

    if (currentStatus === "idle" || currentStatus === "gameOver") {
      startGame();
      return;
    }

    if (currentStatus === "running") {
      setStatus("paused");
      commitFrame({ ...frameRef.current, feedback: "pause", pulse: frameRef.current.pulse + 1 });
      return;
    }

    setStatus("running");
    commitFrame({ ...frameRef.current, feedback: "start", pulse: frameRef.current.pulse + 1 });
  }, [commitFrame, startGame]);

  const queueDirection = useCallback(
    (direction: Direction) => {
      const current = frameRef.current.direction;
      const queued = queuedDirectionRef.current ?? current;

      if (direction === oppositeDirection[current] || direction === oppositeDirection[queued]) {
        return;
      }

      if (statusRef.current === "idle" || statusRef.current === "gameOver") {
        startGame();
      }

      queuedDirectionRef.current = direction;
      if (!mobilePlayfield || statusRef.current !== "running") {
        commitFrame({ ...frameRef.current, feedback: "turn", pulse: frameRef.current.pulse + 1 });
      }
    },
    [commitFrame, mobilePlayfield, startGame],
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
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      if (distance < SWIPE_THRESHOLD) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }
      queueDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    },
    [queueDirection],
  );

  const advanceFrame = useCallback(() => {
    const current = frameRef.current;
    const direction = queuedDirectionRef.current ?? current.direction;
    queuedDirectionRef.current = null;

    const delta = directionDelta[direction];
    const rawHead = { x: current.snake[0].x + delta.x, y: current.snake[0].y + delta.y };
    const wrapped = !wallsEnabled && !isInsideGrid(rawHead);
    const nextHead = wallsEnabled ? rawHead : wrapPosition(rawHead);

    if (!isInsideGrid(nextHead)) {
      finishGame(current, "wall");
      return;
    }

    const collidesWithBody = current.snake.some((segment, index) => index > 0 && samePosition(segment, nextHead));
    if (collidesWithBody) {
      finishGame(current, "body");
      return;
    }

    const hazardHit = current.hazards.find((hazard) => samePosition(hazard.position, nextHead));
    if (hazardHit) {
      finishGame(current, hazardHit.kind);
      return;
    }

    const collected = samePosition(current.token.position, nextHead);
    let nextSnake = [nextHead, ...current.snake];
    let nextToken = current.token;
    let nextHazards = current.hazards;
    let nextScore = current.score;
    let nextCollected = current.collected;
    let nextCombo = current.combo > 0 && (current.moves + 1) % 10 === 0 ? current.combo - 1 : current.combo;
    let nextMaxCombo = current.maxCombo;
    let nextFeedback: FeedbackKind | null = wrapped ? "wrap" : null;
    let nextPulse = wrapped ? current.pulse + 1 : current.pulse;

    if (collected) {
      nextCollected += 1;
      nextCombo = Math.min(9, current.combo + 1);
      nextMaxCombo = Math.max(current.maxCombo, nextCombo);
      nextScore += 18 + Math.min(24, nextCollected * 2) + nextCombo * 3;
      nextPulse += 1;
      nextFeedback = "collect";
      nextToken = createToken(tokenIdRef.current, nextSnake, nextHazards);
      tokenIdRef.current += 1;

      if (nextCollected % 3 === 0 && nextHazards.length < 8) {
        nextHazards = [...nextHazards, createHazard(hazardIdRef.current, nextSnake, nextToken, nextHazards)];
        hazardIdRef.current += 1;
      }
    } else {
      nextSnake = nextSnake.slice(0, current.snake.length);
    }

    const nextMoves = current.moves + 1;
    commitFrame({
      ...current,
      snake: nextSnake,
      direction,
      token: nextToken,
      hazards: nextHazards,
      score: nextScore,
      collected: nextCollected,
      combo: nextCombo,
      maxCombo: nextMaxCombo,
      moves: nextMoves,
      pulse: nextPulse,
      feedback: nextFeedback,
      crash: null,
    });
  }, [commitFrame, finishGame, wallsEnabled]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const timer = window.setInterval(advanceFrame, delay);
    return () => window.clearInterval(timer);
  }, [advanceFrame, delay, status]);

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

      const direction = keyToDirection(event.key);
      if (direction) {
        event.preventDefault();
        queueDirection(direction);
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePause();
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        startGame();
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [queueDirection, startGame, togglePause]);

  const occupiedBySnake = useMemo(() => new Map(frame.snake.map((segment, index) => [cellKey(segment), index])), [frame.snake]);
  const hazardsByCell = useMemo(() => new Map(frame.hazards.map((hazard) => [cellKey(hazard.position), hazard])), [frame.hazards]);
  const tokenKey = cellKey(frame.token.position);
  const currentBest = Math.max(bestScore, frame.score);
  const showOverlay = status === "idle" || status === "gameOver" || status === "paused";
  const primaryLabel = status === "idle" ? t.start : status === "paused" ? t.resume : status === "gameOver" ? t.restart : t.pause;
  const overlayTitle = status === "gameOver" ? t.gameOverTitle : t.idleTitle;
  const overlayText = status === "gameOver" ? t.gameOverText : t.idleText;
  const feedbackLabel = frame.feedback ? t.feedback[frame.feedback] : null;
  const wallsLabel = wallsEnabled ? t.wallsOn : t.wallsOff;

  return (
    <section aria-labelledby="code-snake-title" ref={rootRef}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h2 className={styles.sectionTitle} id="code-snake-title">
            {t.title}
          </h2>
        </div>
        <p className={styles.trainingNote}>{t.subtitle}</p>
      </div>

      <div className={styles.snakeLayout}>
        <div
          aria-label={`${t.eyebrow}: ${t.status[status]}`}
          className={[
            styles.snakeStage,
            frame.feedback === "collect" ? styles.snakeStageCollect : "",
            frame.feedback === "wrap" ? styles.snakeStageWrap : "",
            isDanger ? styles.snakeStageDanger : "",
            status === "paused" ? styles.snakeStagePaused : "",
            status === "gameOver" ? styles.snakeStageHit : "",
          ].join(" ")}
          onTouchEnd={handleStageTouchEnd}
          onTouchStart={handleStageTouchStart}
          role="group"
          tabIndex={0}
        >
          <div className={styles.snakeHud}>
            <div>
              <span>{t.score}</span>
              <strong aria-live="polite" className={frame.feedback === "collect" ? styles.snakeScorePulse : undefined} key={`score-${frame.pulse}`}>
                {frame.score}
              </strong>
            </div>
            <div>
              <span>{t.best}</span>
              <strong>{currentBest}</strong>
            </div>
            <div>
              <span>{t.length}</span>
              <strong>{frame.snake.length}</strong>
            </div>
            <div>
              <span>{t.speed}</span>
              <strong>{cadenceLabel}</strong>
            </div>
            <div>
              <span>{t.walls}</span>
              <strong>{wallsEnabled ? "ON" : "OFF"}</strong>
            </div>
          </div>

          <div className={styles.snakeMeta}>
            <span>
              {t.tokens}: {frame.collected}
            </span>
            {frame.combo > 0 ? (
              <span className={styles.snakeComboBadge}>
                {t.combo} x{frame.combo}
              </span>
            ) : null}
            <span>{t.status[status]}</span>
            {!wallsEnabled ? <span className={styles.snakeWrapBadge}>{t.wrapMode}</span> : null}
            {isDanger && nearestHazardLabel ? (
              <span className={styles.snakeDangerBadge}>
                {t.danger}: {nearestHazardLabel}
              </span>
            ) : null}
            {crashLabel ? <span>{crashLabel}</span> : null}
          </div>

          <div
            aria-hidden="true"
            className={styles.snakeGrid}
            data-snake-grid="true"
            style={{ "--snake-size": GRID_SIZE } as StyleVars}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
              const position = { x: index % GRID_SIZE, y: Math.floor(index / GRID_SIZE) };
              const key = cellKey(position);
              const snakeIndex = occupiedBySnake.get(key);
              const hazard = hazardsByCell.get(key);
              const isHead = snakeIndex === 0;
              const isBody = typeof snakeIndex === "number" && snakeIndex > 0;
              const hasToken = key === tokenKey;
              const nearHazard = hazard && nearHazardKeys.has(key);

              return (
                <span
                  className={[
                    styles.snakeCell,
                    isHead ? styles.snakeHead : "",
                    isBody ? styles.snakeBody : "",
                    hasToken ? styles.snakeToken : "",
                    hazard ? styles.snakeHazard : "",
                    nearHazard ? styles.snakeHazardNear : "",
                  ].join(" ")}
                  data-head={isHead ? "true" : undefined}
                  data-kind={hasToken ? "token" : hazard ? "hazard" : isHead ? "head" : isBody ? "body" : "empty"}
                  data-snake-cell={key}
                  data-token={hasToken ? frame.token.kind : undefined}
                  data-x={position.x}
                  data-y={position.y}
                  key={key}
                >
                  {hasToken ? <span className={styles.snakeCellLabel}>{frame.token.kind}</span> : null}
                  {hazard ? <span className={styles.snakeCellLabel}>{hazard.kind}</span> : null}
                  {isHead ? <span className={styles.snakeHeadCore} /> : null}
                  {isBody ? <span className={styles.snakeBodyCore} /> : null}
                </span>
              );
            })}
          </div>

          {feedbackLabel ? (
            <span
              aria-live="polite"
              className={[
                styles.snakeFeedback,
                frame.feedback === "collect" || frame.feedback === "start" || frame.feedback === "wrap" ? styles.snakeFeedbackGood : "",
                frame.feedback === "hit" ? styles.snakeFeedbackHit : "",
              ].join(" ")}
              key={frame.pulse}
            >
              {feedbackLabel}
            </span>
          ) : null}

          {showOverlay ? (
            <div className={styles.snakeOverlay}>
              <div className={styles.stageMessageInner}>
                <p className={styles.gameStatus}>{t.status[status]}</p>
                <h3>{overlayTitle}</h3>
                <p>{overlayText}</p>
                {crashLabel ? (
                  <p className={styles.snakeCrashReason}>
                    {t.crashReason}: {crashLabel}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <aside className={styles.snakeSide}>
          <div className={styles.runnerPanel}>
            <p className={styles.gameStatus}>{t.status[status]}</p>
            <div className={styles.snakeActions}>
              <button className={`${styles.runnerAction} ${styles.runnerActionPrimary}`} onClick={togglePause} type="button">
                {primaryLabel}
              </button>
              <button className={styles.runnerAction} onClick={startGame} type="button">
                {t.restart}
              </button>
            </div>
          </div>

          <div className={styles.runnerPanel}>
            <div className={styles.snakeWallHeader}>
              <h3>{t.walls}</h3>
              <span>{wallsLabel}</span>
            </div>
            <button
              aria-pressed={wallsEnabled}
              className={`${styles.runnerAction} ${styles.snakeWallToggle}`}
              onClick={toggleWalls}
              type="button"
            >
              {t.wallsToggle}
            </button>
          </div>

          <div className={styles.runnerPanel}>
            <h3>{t.controlsTitle}</h3>
            <div className={styles.snakeDpad} aria-label={t.controlsTitle}>
              <button aria-label={t.directions.up} className={styles.snakeDirection} onClick={() => queueDirection("up")} type="button">
                {"\u2191"}
              </button>
              <button aria-label={t.directions.left} className={styles.snakeDirection} onClick={() => queueDirection("left")} type="button">
                {"\u2190"}
              </button>
              <button aria-label={t.directions.right} className={styles.snakeDirection} onClick={() => queueDirection("right")} type="button">
                {"\u2192"}
              </button>
              <button aria-label={t.directions.down} className={styles.snakeDirection} onClick={() => queueDirection("down")} type="button">
                {"\u2193"}
              </button>
            </div>
          </div>

          <div className={styles.runnerPanel}>
            <h3>{t.rulesTitle}</h3>
            <ul>
              {t.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            {reducedMotion ? <p>{t.reduced}</p> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
