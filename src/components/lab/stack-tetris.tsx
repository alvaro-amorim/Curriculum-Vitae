"use client";

import type { CSSProperties, TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GAME_VERSIONS, clampScore, detectGameDeviceType } from "@/lib/lab-score";
import type { GameScorePayloadV2, Locale } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type TetrisStatus = "idle" | "running" | "paused" | "gameOver";
type ModuleKind = "UI" | "API" | "DB" | "CACHE" | "TEST" | "CI" | "AUTH";
type FeedbackKind = "start" | "move" | "rotate" | "drop" | "clear" | "lock" | "pause" | "hit";

type Position = {
  x: number;
  y: number;
};

type Cell = {
  kind: ModuleKind;
  id: number;
};

type Board = (Cell | null)[][];

type PieceDefinition = {
  kind: ModuleKind;
  blocks: Position[];
};

type Piece = {
  id: number;
  kind: ModuleKind;
  blocks: Position[];
  x: number;
  y: number;
};

type TetrisFrame = {
  board: Board;
  active: Piece;
  next: Piece;
  combo: number;
  score: number;
  apiScore: number;
  lines: number;
  level: number;
  pieces: number;
  hardDrops: number;
  maxCombo: number;
  pulse: number;
  feedback: FeedbackKind | null;
  lastClear: number;
  lastDrop: number;
  levelUp: boolean;
};

type StackTetrisProps = {
  locale: Locale;
  onComplete: (payload: Extract<GameScorePayloadV2, { game: "stack-tetris" }>) => void;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 18;
const PREVIEW_SIZE = 4;
const BEST_SCORE_KEY = "alvaro-dev-stack-tetris-best-v1";
const SWIPE_THRESHOLD = 34;

const pieceDefinitions: PieceDefinition[] = [
  {
    kind: "DB",
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    kind: "UI",
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ],
  },
  {
    kind: "API",
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
  },
  {
    kind: "CACHE",
    blocks: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
  },
  {
    kind: "TEST",
    blocks: [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
  },
  {
    kind: "CI",
    blocks: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    kind: "AUTH",
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
  },
];

const copy = {
  pt: {
    eyebrow: "Stack Tetris",
    title: "Monte a stack sem quebrar o build.",
    subtitle:
      "Um puzzle técnico em queda: encaixe módulos, limpe linhas e mantenha a pipeline saudável antes do stack overflow.",
    start: "Iniciar Stack Tetris",
    restart: "Reiniciar",
    pause: "Pausar",
    resume: "Retomar",
    score: "score",
    best: "melhor",
    lines: "linhas",
    level: "nível",
    speed: "cadência",
    next: "próxima peça",
    status: {
      idle: "build pronto",
      running: "build em execução",
      paused: "build pausado",
      gameOver: "stack overflow",
    },
    idleTitle: "Compile módulos em linhas estáveis.",
    idleText:
      "Mobile: deslize para mover/descer e para cima para rotacionar. Desktop: setas/WASD e Space.",
    gameOverTitle: "Build quebrado.",
    gameOverText: "A pilha saturou. O melhor local foi salvo e o score persistente foi enviado sem bloquear a interface.",
    controlsTitle: "Controles",
    swipeHint: "Swipe: esquerda/direita move, baixo desce, cima rotaciona.",
    rulesTitle: "Regras",
    rules: [
      "A/D ou setas laterais movem o módulo.",
      "W ou ArrowUp rotaciona a peça.",
      "S ou ArrowDown acelera a queda.",
      "Space faz hard drop; P pausa; R reinicia.",
      "Linhas completas limpam o build e aumentam o nível.",
    ],
    combo: "combo",
    dropBonus: "drop",
    levelUp: "level up",
    buttons: {
      left: "Mover para esquerda",
      right: "Mover para direita",
      down: "Descer módulo",
      rotate: "Rotacionar módulo",
      drop: "Hard drop",
    },
    feedback: {
      start: "build online",
      move: "módulo ajustado",
      rotate: "rotação aplicada",
      drop: "hard drop",
      clear: "linha compilada",
      lock: "módulo fixado",
      pause: "build em hold",
      hit: "stack overflow",
    },
    reduced: "Modo reduced motion: efeitos decorativos reduzidos, queda e controles preservados.",
  },
  en: {
    eyebrow: "Stack Tetris",
    title: "Assemble the stack without breaking the build.",
    subtitle: "A technical falling puzzle: place modules, clear lines, and keep the pipeline healthy before stack overflow.",
    start: "Start Stack Tetris",
    restart: "Restart",
    pause: "Pause",
    resume: "Resume",
    score: "score",
    best: "best",
    lines: "lines",
    level: "level",
    speed: "cadence",
    next: "next piece",
    status: {
      idle: "build ready",
      running: "build running",
      paused: "build paused",
      gameOver: "stack overflow",
    },
    idleTitle: "Compile modules into stable lines.",
    idleText:
      "Mobile: swipe to move/drop and swipe up to rotate. Desktop: arrows/WASD and Space.",
    gameOverTitle: "Build broken.",
    gameOverText: "The stack saturated. Local best was saved and the persistent score was submitted without blocking the UI.",
    controlsTitle: "Controls",
    swipeHint: "Swipe: left/right moves, down drops, up rotates.",
    rulesTitle: "Rules",
    rules: [
      "A/D or lateral arrows move the module.",
      "W or ArrowUp rotates the piece.",
      "S or ArrowDown accelerates the fall.",
      "Space hard-drops; P pauses; R restarts.",
      "Full lines clear the build and increase the level.",
    ],
    combo: "combo",
    dropBonus: "drop",
    levelUp: "level up",
    buttons: {
      left: "Move left",
      right: "Move right",
      down: "Move down",
      rotate: "Rotate module",
      drop: "Hard drop",
    },
    feedback: {
      start: "build online",
      move: "module adjusted",
      rotate: "rotation applied",
      drop: "hard drop",
      clear: "line compiled",
      lock: "module locked",
      pause: "build on hold",
      hit: "stack overflow",
    },
    reduced: "Reduced motion mode: decorative effects are reduced, falling and controls stay playable.",
  },
} as const;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array<Cell | null>(BOARD_WIDTH).fill(null));
}

function createWarmBoard(): Board {
  const board = createEmptyBoard();
  const modules: ModuleKind[] = ["UI", "API", "CACHE", "TEST", "CI", "AUTH", "DB", "UI"];

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (x === 4 || x === 5) {
      continue;
    }

    board[BOARD_HEIGHT - 1][x] = {
      id: 900 + x,
      kind: modules[x % modules.length],
    };
  }

  return board;
}

function pieceBounds(blocks: Position[]) {
  const width = Math.max(...blocks.map((block) => block.x)) + 1;
  const height = Math.max(...blocks.map((block) => block.y)) + 1;
  return { height, width };
}

function createPiece(id: number): Piece {
  const definition = pieceDefinitions[(id - 1) % pieceDefinitions.length];
  const { width } = pieceBounds(definition.blocks);

  return {
    id,
    kind: definition.kind,
    blocks: definition.blocks,
    x: Math.floor((BOARD_WIDTH - width) / 2),
    y: 0,
  };
}

function createInitialFrame(): TetrisFrame {
  return {
    active: createPiece(1),
    apiScore: 0,
    board: createWarmBoard(),
    combo: 0,
    feedback: null,
    lastClear: 0,
    lastDrop: 0,
    level: 1,
    levelUp: false,
    lines: 0,
    hardDrops: 0,
    maxCombo: 0,
    next: createPiece(2),
    pieces: 0,
    pulse: 0,
    score: 0,
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

function pieceCells(piece: Piece) {
  return piece.blocks.map((block) => ({
    x: piece.x + block.x,
    y: piece.y + block.y,
  }));
}

function isValidPosition(board: Board, piece: Piece) {
  return pieceCells(piece).every((cell) => {
    if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y >= BOARD_HEIGHT) {
      return false;
    }

    if (cell.y < 0) {
      return true;
    }

    return board[cell.y][cell.x] === null;
  });
}

function mergePiece(board: Board, piece: Piece): Board {
  const next = board.map((row) => [...row]);

  pieceCells(piece).forEach((cell) => {
    if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
      next[cell.y][cell.x] = {
        id: piece.id,
        kind: piece.kind,
      };
    }
  });

  return next;
}

function clearCompletedLines(board: Board) {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = BOARD_HEIGHT - remaining.length;
  const emptyRows = Array.from({ length: cleared }, () => Array<Cell | null>(BOARD_WIDTH).fill(null));

  return {
    board: [...emptyRows, ...remaining],
    cleared,
  };
}

function rotateBlocks(blocks: Position[]) {
  const { height } = pieceBounds(blocks);
  const rotated = blocks.map((block) => ({
    x: height - 1 - block.y,
    y: block.x,
  }));
  const minX = Math.min(...rotated.map((block) => block.x));
  const minY = Math.min(...rotated.map((block) => block.y));

  return rotated.map((block) => ({
    x: block.x - minX,
    y: block.y - minY,
  }));
}

function getGhostPiece(board: Board, piece: Piece) {
  let ghost = { ...piece };

  while (isValidPosition(board, { ...ghost, y: ghost.y + 1 })) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }

  return ghost;
}

function calculateApiScore(input: { level: number; lines: number; pieces: number; score: number }) {
  return clampScore(input.score / 18 + input.lines * 6 + input.level * 4 + Math.min(18, input.pieces * 1.4));
}

function lineScore(lines: number, level: number) {
  const table = [0, 120, 320, 620, 980];
  return (table[lines] ?? table[4]) * level;
}

export function StackTetris({ locale, onComplete }: StackTetrisProps) {
  const t = copy[locale];
  const [status, setStatus] = useState<TetrisStatus>("idle");
  const [frame, setFrame] = useState<TetrisFrame>(() => createInitialFrame());
  const [bestScore, setBestScore] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const frameRef = useRef<TetrisFrame>(createInitialFrame());
  const statusRef = useRef<TetrisStatus>("idle");
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const lastHardDropAtRef = useRef(0);
  const nextIdRef = useRef(3);
  const completedRef = useRef(false);
  const touchStartRef = useRef<Position | null>(null);
  const startedAtRef = useRef(0);

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

  const delay = useMemo(() => Math.max(reducedMotion ? 280 : 150, (reducedMotion ? 760 : 620) - (frame.level - 1) * 54), [frame.level, reducedMotion]);
  const cadenceLabel = useMemo(() => `${Math.round(1000 / delay)}/s`, [delay]);
  const ghost = useMemo(() => getGhostPiece(frame.board, frame.active), [frame.active, frame.board]);
  const currentBest = Math.max(bestScore, frame.score);

  const commitFrame = useCallback((next: TetrisFrame) => {
    frameRef.current = next;
    setFrame(next);
  }, []);

  const startGame = useCallback(() => {
    const next = createInitialFrame();
    completedRef.current = false;
    nextIdRef.current = 3;
    startedAtRef.current = performance.now();
    commitFrame({ ...next, feedback: "start" });
    setStatus("running");
    window.requestAnimationFrame(() => stageRef.current?.focus());
  }, [commitFrame]);

  const finishGame = useCallback(
    (next: TetrisFrame) => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;
      const completedFrame = {
        ...next,
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
        game: "stack-tetris",
        gameVersion: GAME_VERSIONS["stack-tetris"],
        metadata: {
          hardDrops: completedFrame.hardDrops,
          level: completedFrame.level,
          linesCleared: completedFrame.lines,
          maxCombo: completedFrame.maxCombo,
          piecesPlaced: completedFrame.pieces,
        },
        score: completedFrame.apiScore,
      });
    },
    [commitFrame, onComplete],
  );

  const lockPiece = useCallback(
    (piece: Piece, dropBonus = 0) => {
      const current = frameRef.current;
      const merged = mergePiece(current.board, piece);
      const result = clearCompletedLines(merged);
      const totalLines = current.lines + result.cleared;
      const nextLevel = 1 + Math.floor(totalLines / 3);
      const levelUp = nextLevel > current.level;
      const combo = result.cleared > 0 ? current.combo + 1 : 0;
      const hardDrops = current.hardDrops + (dropBonus > 0 ? 1 : 0);
      const maxCombo = Math.max(current.maxCombo, combo);
      const clearBonus = lineScore(result.cleared, nextLevel);
      const comboBonus = result.cleared > 0 ? combo * 24 : 0;
      const nextScore = current.score + clearBonus + comboBonus + dropBonus + (result.cleared === 0 ? 12 : 0);
      const nextActive = createPiece(current.next.id);
      const nextPiece = createPiece(nextIdRef.current);
      nextIdRef.current += 1;
      const nextPieces = current.pieces + 1;
      const nextFrame: TetrisFrame = {
        ...current,
        active: nextActive,
        apiScore: calculateApiScore({ level: nextLevel, lines: totalLines, pieces: nextPieces, score: nextScore }),
        board: result.board,
        combo,
        feedback: result.cleared > 0 ? "clear" : "lock",
        hardDrops,
        lastClear: result.cleared,
        lastDrop: dropBonus > 0 ? Math.round(dropBonus / 2) : 0,
        level: nextLevel,
        levelUp,
        lines: totalLines,
        maxCombo,
        next: nextPiece,
        pieces: nextPieces,
        pulse: current.pulse + 1,
        score: nextScore,
      };

      if (!isValidPosition(nextFrame.board, nextFrame.active)) {
        finishGame(nextFrame);
        return;
      }

      commitFrame(nextFrame);
    },
    [commitFrame, finishGame],
  );

  const movePiece = useCallback(
    (dx: number, dy: number, feedback: FeedbackKind = "move") => {
      if (statusRef.current === "idle" || statusRef.current === "gameOver") {
        startGame();
        return;
      }

      if (statusRef.current !== "running") {
        return;
      }

      const current = frameRef.current;
      const nextPiece = {
        ...current.active,
        x: current.active.x + dx,
        y: current.active.y + dy,
      };

      if (isValidPosition(current.board, nextPiece)) {
        const softDropScore = dy > 0 ? 1 : 0;
        const nextScore = current.score + softDropScore;
        commitFrame({
          ...current,
          active: nextPiece,
          apiScore: calculateApiScore({ level: current.level, lines: current.lines, pieces: current.pieces, score: nextScore }),
          feedback,
          lastClear: 0,
          lastDrop: dy > 0 ? 1 : 0,
          levelUp: false,
          pulse: feedback === "move" ? current.pulse : current.pulse + 1,
          score: nextScore,
        });
        return;
      }

      if (dy > 0) {
        lockPiece(current.active);
      }
    },
    [commitFrame, lockPiece, startGame],
  );

  const rotatePiece = useCallback(() => {
    if (statusRef.current === "idle" || statusRef.current === "gameOver") {
      startGame();
      return;
    }

    if (statusRef.current !== "running") {
      return;
    }

    const now = window.performance.now();
    if (now - lastHardDropAtRef.current < 130) {
      return;
    }
    lastHardDropAtRef.current = now;

    const current = frameRef.current;
    const rotated = {
      ...current.active,
      blocks: rotateBlocks(current.active.blocks),
    };
    const kicks = [0, -1, 1, -2, 2];
    const candidate = kicks.map((offset) => ({ ...rotated, x: rotated.x + offset })).find((piece) => isValidPosition(current.board, piece));

    if (!candidate) {
      return;
    }

    commitFrame({
      ...current,
      active: candidate,
      feedback: "rotate",
      lastClear: 0,
      lastDrop: 0,
      levelUp: false,
      pulse: current.pulse + 1,
    });
  }, [commitFrame, startGame]);

  const hardDrop = useCallback(() => {
    if (statusRef.current === "idle" || statusRef.current === "gameOver") {
      startGame();
      return;
    }

    if (statusRef.current !== "running") {
      return;
    }

    const current = frameRef.current;
    let dropped = current.active;
    let distance = 0;

    while (isValidPosition(current.board, { ...dropped, y: dropped.y + 1 })) {
      dropped = { ...dropped, y: dropped.y + 1 };
      distance += 1;
    }

    commitFrame({
      ...current,
      active: dropped,
      feedback: "drop",
      lastClear: 0,
      lastDrop: distance,
      levelUp: false,
      pulse: current.pulse + 1,
    });
    lockPiece(dropped, distance * 2);
  }, [commitFrame, lockPiece, startGame]);

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

      event.preventDefault();
      if (Math.abs(dx) > Math.abs(dy)) {
        movePiece(dx > 0 ? 1 : -1, 0);
        return;
      }

      if (dy > 0) {
        movePiece(0, 1, "drop");
        return;
      }

      rotatePiece();
    },
    [movePiece, rotatePiece],
  );

  const togglePause = useCallback(() => {
    const currentStatus = statusRef.current;

    if (currentStatus === "idle" || currentStatus === "gameOver") {
      startGame();
      return;
    }

    if (currentStatus === "running") {
      setStatus("paused");
      commitFrame({ ...frameRef.current, feedback: "pause", lastClear: 0, lastDrop: 0, levelUp: false, pulse: frameRef.current.pulse + 1 });
      return;
    }

    setStatus("running");
    commitFrame({ ...frameRef.current, feedback: "start", lastClear: 0, lastDrop: 0, levelUp: false, pulse: frameRef.current.pulse + 1 });
    window.requestAnimationFrame(() => stageRef.current?.focus());
  }, [commitFrame, startGame]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const timer = window.setInterval(() => movePiece(0, 1, "move"), delay);
    return () => window.clearInterval(timer);
  }, [delay, movePiece, status]);

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

      switch (event.key.toLowerCase()) {
        case "arrowleft":
        case "a":
          event.preventDefault();
          movePiece(-1, 0);
          break;
        case "arrowright":
        case "d":
          event.preventDefault();
          movePiece(1, 0);
          break;
        case "arrowdown":
        case "s":
          event.preventDefault();
          movePiece(0, 1, "drop");
          break;
        case "arrowup":
        case "w":
          event.preventDefault();
          rotatePiece();
          break;
        case "p":
          event.preventDefault();
          togglePause();
          break;
        case "r":
          event.preventDefault();
          startGame();
          break;
        default:
          if (event.code === "Space") {
            event.preventDefault();
            if (statusRef.current === "paused") {
              togglePause();
            } else {
              hardDrop();
            }
          }
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [hardDrop, movePiece, rotatePiece, startGame, togglePause]);

  const activeCells = useMemo(() => new Map(pieceCells(frame.active).map((cell) => [`${cell.x}:${cell.y}`, frame.active.kind])), [frame.active]);
  const ghostCells = useMemo(() => new Set(pieceCells(ghost).map((cell) => `${cell.x}:${cell.y}`)), [ghost]);
  const showOverlay = status === "idle" || status === "paused" || status === "gameOver";
  const overlayTitle = status === "gameOver" ? t.gameOverTitle : t.idleTitle;
  const overlayText = status === "gameOver" ? t.gameOverText : t.idleText;
  const primaryLabel = status === "idle" ? t.start : status === "paused" ? t.resume : status === "gameOver" ? t.restart : t.pause;
  const feedbackLabel = frame.feedback ? t.feedback[frame.feedback] : null;

  return (
    <section aria-labelledby="stack-tetris-title" ref={rootRef}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h2 className={styles.sectionTitle} id="stack-tetris-title">
            {t.title}
          </h2>
        </div>
        <p className={styles.trainingNote}>{t.subtitle}</p>
      </div>

      <div className={styles.tetrisLayout}>
        <div
          aria-label={`${t.eyebrow}: ${t.status[status]}`}
          className={[
            styles.tetrisStage,
            frame.lastClear > 0 ? styles.tetrisStageClear : "",
            frame.feedback === "drop" ? styles.tetrisStageDrop : "",
            status === "paused" ? styles.tetrisStagePaused : "",
            status === "gameOver" ? styles.tetrisStageHit : "",
          ].join(" ")}
          onTouchEnd={handleStageTouchEnd}
          onTouchStart={handleStageTouchStart}
          role="group"
          ref={stageRef}
          tabIndex={0}
        >
          <div className={styles.tetrisHud}>
            <div>
              <span>{t.score}</span>
              <strong aria-live="polite" className={frame.feedback === "clear" || frame.feedback === "drop" ? styles.tetrisScorePulse : undefined} key={`tetris-score-${frame.pulse}`}>
                {frame.score}
              </strong>
            </div>
            <div>
              <span>{t.best}</span>
              <strong>{currentBest}</strong>
            </div>
            <div>
              <span>{t.lines}</span>
              <strong>{frame.lines}</strong>
            </div>
            <div>
              <span>{t.level}</span>
              <strong>{frame.level}</strong>
            </div>
          </div>

          <div className={styles.tetrisMeta}>
            <span>{t.status[status]}</span>
            <span>
              {t.speed}: {cadenceLabel}
            </span>
            {frame.lastClear > 0 ? (
              <span className={styles.tetrisClearBadge}>
                +{frame.lastClear} {t.lines}
              </span>
            ) : null}
            {frame.combo > 1 ? (
              <span className={styles.tetrisComboBadge}>
                {t.combo} x{frame.combo}
              </span>
            ) : null}
            {frame.lastDrop > 0 ? (
              <span className={styles.tetrisDropBadge}>
                +{frame.lastDrop} {t.dropBonus}
              </span>
            ) : null}
            {frame.levelUp ? <span className={styles.tetrisLevelBadge}>{t.levelUp}</span> : null}
          </div>

          <div
            aria-hidden="true"
            className={styles.tetrisGrid}
            data-tetris-grid="true"
            style={{ "--tetris-height": BOARD_HEIGHT, "--tetris-width": BOARD_WIDTH } as StyleVars}
          >
            {frame.board.flatMap((row, y) =>
              row.map((cell, x) => {
                const key = `${x}:${y}`;
                const activeKind = activeCells.get(key);
                const ghosted = ghostCells.has(key) && !activeKind && !cell;
                const kind = activeKind ?? cell?.kind ?? frame.active.kind;

                return (
                  <span
                    className={[
                      styles.tetrisCell,
                      cell ? styles.tetrisFilled : "",
                      activeKind ? styles.tetrisActive : "",
                      ghosted ? styles.tetrisGhost : "",
                    ].join(" ")}
                    data-kind={cell ? "locked" : activeKind ? "active" : ghosted ? "ghost" : "empty"}
                    data-module={kind}
                    data-tetris-cell={key}
                    key={key}
                  >
                    {cell || activeKind ? <span className={styles.tetrisCellLabel}>{activeKind ?? cell?.kind}</span> : null}
                  </span>
                );
              }),
            )}
          </div>

          {frame.lastClear > 0 ? (
            <div aria-hidden="true" className={styles.tetrisLineBurst} key={`line-burst-${frame.pulse}`}>
              <span />
              <span />
              <span />
            </div>
          ) : null}

          {feedbackLabel ? (
            <span
              aria-live="polite"
              className={[
                styles.tetrisFeedback,
                frame.feedback === "clear" || frame.feedback === "start" || frame.feedback === "drop" ? styles.tetrisFeedbackGood : "",
                frame.feedback === "hit" ? styles.tetrisFeedbackHit : "",
              ].join(" ")}
              key={frame.pulse}
            >
              {feedbackLabel}
            </span>
          ) : null}

          {showOverlay ? (
            <div className={styles.tetrisOverlay}>
              <div className={styles.stageMessageInner}>
                <p className={styles.gameStatus}>{t.status[status]}</p>
                <h3>{overlayTitle}</h3>
                <p>{overlayText}</p>
              </div>
            </div>
          ) : null}
        </div>

        <aside className={styles.tetrisSide}>
          <div className={styles.runnerPanel}>
            <p className={styles.gameStatus}>{t.status[status]}</p>
            <div className={styles.tetrisActions}>
              <button className={`${styles.runnerAction} ${styles.runnerActionPrimary}`} onClick={togglePause} type="button">
                {primaryLabel}
              </button>
              <button className={styles.runnerAction} onClick={startGame} type="button">
                {t.restart}
              </button>
            </div>
          </div>

          <div className={styles.runnerPanel}>
            <h3>{t.next}</h3>
            <p className={styles.tetrisNextKind}>{frame.next.kind}</p>
            <div
              aria-hidden="true"
              className={styles.tetrisPreviewGrid}
              style={{ "--tetris-preview": PREVIEW_SIZE } as StyleVars}
            >
              {Array.from({ length: PREVIEW_SIZE * PREVIEW_SIZE }, (_, index) => {
                const position = { x: index % PREVIEW_SIZE, y: Math.floor(index / PREVIEW_SIZE) };
                const filled = frame.next.blocks.some((block) => block.x === position.x && block.y === position.y);

                return (
                  <span
                    className={[styles.tetrisPreviewCell, filled ? styles.tetrisActive : ""].join(" ")}
                    data-module={frame.next.kind}
                    key={`${position.x}:${position.y}`}
                  >
                    {filled ? <span className={styles.tetrisCellLabel}>{frame.next.kind}</span> : null}
                  </span>
                );
              })}
            </div>
          </div>

          <div className={styles.runnerPanel}>
            <h3>{t.controlsTitle}</h3>
            <p className={styles.tetrisSwipeHint}>{t.swipeHint}</p>
            <div className={styles.tetrisControls} aria-label={t.controlsTitle}>
              <button aria-label={t.buttons.left} className={styles.tetrisControl} onClick={() => movePiece(-1, 0)} type="button">
                <span aria-hidden="true" className={styles.tetrisControlIcon}>
                  {"\u2190"}
                </span>
                <span className={styles.tetrisControlHint}>A</span>
              </button>
              <button aria-label={t.buttons.rotate} className={styles.tetrisControl} onClick={rotatePiece} type="button">
                <span aria-hidden="true" className={styles.tetrisControlIcon}>
                  {"\u21bb"}
                </span>
                <span className={styles.tetrisControlHint}>W</span>
              </button>
              <button aria-label={t.buttons.right} className={styles.tetrisControl} onClick={() => movePiece(1, 0)} type="button">
                <span aria-hidden="true" className={styles.tetrisControlIcon}>
                  {"\u2192"}
                </span>
                <span className={styles.tetrisControlHint}>D</span>
              </button>
              <button aria-label={t.buttons.down} className={styles.tetrisControl} onClick={() => movePiece(0, 1, "drop")} type="button">
                <span aria-hidden="true" className={styles.tetrisControlIcon}>
                  {"\u2193"}
                </span>
                <span className={styles.tetrisControlHint}>S</span>
              </button>
              <button aria-label={t.buttons.drop} className={`${styles.tetrisControl} ${styles.tetrisDropControl}`} onClick={hardDrop} type="button">
                {t.buttons.drop}
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
