"use client";

import type { CSSProperties, KeyboardEvent, TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GAME_VERSIONS, clampScore, detectGameDeviceType } from "@/lib/lab-score";
import type { GameScorePayloadV2, Locale } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type MazeStatus = "idle" | "running" | "won" | "failed";
type Direction = "up" | "down" | "left" | "right";
type CellKind = "wall" | "path" | "start" | "goal" | "item" | "hazard";
type ItemKind = "TEST" | "FIX" | "TOKEN" | "PATCH" | "KEY" | "API";
type HazardKind = "bug" | "deadlock" | "memory" | "route";
type FeedbackKind = "blocked" | "item" | "hit" | "win" | "fail" | "locked" | "virus";

type Position = {
  x: number;
  y: number;
};

type MazeCell = Position & {
  kind: CellKind;
  hazard?: HazardKind;
};

type MazeItem = {
  id: string;
  kind: ItemKind;
  position: Position;
};

type MazeEnemy = {
  id: string;
  label: string;
  position: Position;
  start: Position;
};

type MazeDefinition = {
  rows: string[];
  name: Record<Locale, string>;
};

type ParsedMaze = {
  cells: MazeCell[];
  columns: number;
  enemies: MazeEnemy[];
  goal: Position;
  items: MazeItem[];
  rows: number;
  start: Position;
};

type BugMazeProps = {
  locale: Locale;
  onComplete: (payload: Extract<GameScorePayloadV2, { game: "bug-maze" }>) => void;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BEST_SCORE_KEY = "alvaro-dev-bug-maze-best-v2";
const MAX_LIVES = 3;
const TRAIL_LIMIT = 10;
const SWIPE_THRESHOLD = 34;
const DAMAGE_GRACE_MS = 900;

const mazeDefinitions: MazeDefinition[] = [
  {
    name: {
      pt: "Pacote de deploy",
      en: "Deploy package",
    },
    rows: [
      "###############",
      "#S....#T....G.#",
      "#.###.#.###.#.#",
      "#...#...#...#.#",
      "###.#####.#.#.#",
      "#K..#..F#.#...#",
      "#.###.#.#.###.#",
      "#...#.#...#A..#",
      "#.###.###.#.###",
      "#P....V...C...#",
      "###############",
    ],
  },
  {
    name: {
      pt: "Incidente em produção",
      en: "Production incident",
    },
    rows: [
      "###############",
      "#S..#...A....G#",
      "#.#.#.#####.#.#",
      "#.#...#...#.#.#",
      "#.###.#T#.#.#.#",
      "#...#...#...#.#",
      "###.#.###.###.#",
      "#P..#...#...K.#",
      "#.#####.#.###.#",
      "#..F...V...C..#",
      "###############",
    ],
  },
];

const directionDelta: Record<Direction, Position> = {
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
};

const itemTokens: Record<string, ItemKind> = {
  A: "API",
  C: "TOKEN",
  F: "FIX",
  K: "KEY",
  P: "PATCH",
  T: "TEST",
};

const hazardLabels: Record<HazardKind, string> = {
  bug: "BUG",
  deadlock: "DEADLOCK",
  memory: "MEM",
  route: "ROUTE",
};

const hazardClassNames: Record<HazardKind, string> = {
  bug: styles.mazeHazardBug,
  deadlock: styles.mazeHazardDeadlock,
  memory: styles.mazeHazardMemory,
  route: styles.mazeHazardRoute,
};

const copy = {
  pt: {
    eyebrow: "Bug Maze",
    title: "Colete os tokens antes do deploy.",
    subtitle:
      "Um mini Pac-Man dev: maze maior, tokens vivos, Safe Deploy bloqueado, vírus perseguidores e três vidas.",
    start: "Iniciar labirinto",
    restart: "Reiniciar layout",
    nextLayout: "Trocar mapa",
    score: "score",
    best: "melhor",
    moves: "movimentos",
    time: "tempo",
    lives: "vidas",
    items: "tokens",
    threat: "vírus",
    deploy: "deploy",
    virusMode: "Modo vírus",
    virusModeOn: "vírus forçado",
    virusModeOff: "vírus após 1 token",
    status: {
      failed: "debug interrompido",
      idle: "pronto para mapear",
      running: "ameaça em execução",
      won: "safe deploy alcançado",
    },
    idleTitle: "Colete todos os tokens e libere o Safe Deploy.",
    idleText:
      "Mobile: deslize para mover. Colete tokens, fuja dos vírus e faça deploy. Desktop: setas ou WASD.",
    wonTitle: "Deploy seguro.",
    wonText: "Todos os tokens foram aplicados, o melhor local foi salvo e o score entrou no ranking.",
    failedTitle: "Vidas esgotadas.",
    failedText: "Reinicie o mapa, colete tokens e use os becos para escapar dos vírus.",
    blocked: "parede de execução",
    item: "+token coletado",
    hit: "-1 vida",
    win: "deploy liberado",
    fail: "stack infectada",
    locked: "Safe Deploy bloqueado",
    virus: "vírus ativados",
    lockedCount: (count: number) => `faltam ${count} tokens`,
    active: "ativo",
    dormant: "dormente",
    controlsTitle: "Controles",
    rulesTitle: "Regras",
    rules: [
      "No mobile, swipe move o debug node; no desktop, setas ou WASD.",
      "Todos os tokens precisam ser coletados antes do Safe Deploy.",
      "Vírus perseguem depois do primeiro token ou com Modo vírus ativo.",
      "Três vidas; dano concede invulnerabilidade curta.",
    ],
    reduced: "Modo reduced motion: efeitos decorativos reduzidos, gameplay preservado.",
    directions: {
      down: "Mover para baixo",
      left: "Mover para esquerda",
      right: "Mover para direita",
      up: "Mover para cima",
    },
  },
  en: {
    eyebrow: "Bug Maze",
    title: "Collect tokens before deploy.",
    subtitle: "A dev mini Pac-Man: larger maze, living tokens, locked Safe Deploy, chasing viruses, and three lives.",
    start: "Start maze",
    restart: "Restart layout",
    nextLayout: "Switch map",
    score: "score",
    best: "best",
    moves: "moves",
    time: "time",
    lives: "lives",
    items: "tokens",
    threat: "virus",
    deploy: "deploy",
    virusMode: "Virus mode",
    virusModeOn: "virus forced",
    virusModeOff: "virus after 1 token",
    status: {
      failed: "debug interrupted",
      idle: "ready to map",
      running: "threat running",
      won: "safe deploy reached",
    },
    idleTitle: "Collect every token and unlock Safe Deploy.",
    idleText:
      "Mobile: swipe to move. Collect tokens, avoid viruses, and deploy. Desktop: arrows or WASD.",
    wonTitle: "Safe deploy.",
    wonText: "Every token was applied, the local best was saved, and the score entered the ranking.",
    failedTitle: "Lives depleted.",
    failedText: "Restart the map, collect tokens, and use dead ends to escape viruses.",
    blocked: "execution wall",
    item: "+token collected",
    hit: "-1 life",
    win: "deploy cleared",
    fail: "stack infected",
    locked: "Safe Deploy locked",
    virus: "viruses active",
    lockedCount: (count: number) => `${count} tokens left`,
    active: "active",
    dormant: "dormant",
    controlsTitle: "Controls",
    rulesTitle: "Rules",
    rules: [
      "On mobile, swipe moves the debug node; on desktop, arrows or WASD.",
      "Every token must be collected before Safe Deploy.",
      "Viruses chase after the first token or when Virus mode is enabled.",
      "Three lives; damage grants a short invulnerability window.",
    ],
    reduced: "Reduced motion mode: decorative effects are reduced, gameplay stays available.",
    directions: {
      down: "Move down",
      left: "Move left",
      right: "Move right",
      up: "Move up",
    },
  },
} as const;

function cellKey(position: Position) {
  return `${position.x}:${position.y}`;
}

function samePosition(a: Position, b: Position) {
  return a.x === b.x && a.y === b.y;
}

function parseMaze(definition: MazeDefinition): ParsedMaze {
  const cells: MazeCell[] = [];
  const enemies: MazeEnemy[] = [];
  const items: MazeItem[] = [];
  let goal: Position = { x: 1, y: 1 };
  let start: Position = { x: 1, y: 1 };

  definition.rows.forEach((row, y) => {
    [...row].forEach((token, x) => {
      const position = { x, y };
      let cell: MazeCell;

      if (token === "#") {
        cell = { ...position, kind: "wall" };
      } else if (token === "S") {
        start = position;
        cell = { ...position, kind: "start" };
      } else if (token === "G") {
        goal = position;
        cell = { ...position, kind: "goal" };
      } else if (token === "V") {
        enemies.push({
          id: `virus-${x}-${y}`,
          label: "VIRUS",
          position,
          start: position,
        });
        cell = { ...position, kind: "path" };
      } else if (token in itemTokens) {
        items.push({
          id: cellKey(position),
          kind: itemTokens[token],
          position,
        });
        cell = { ...position, kind: "item" };
      } else if (token === "B") {
        cell = { ...position, hazard: "bug", kind: "hazard" };
      } else if (token === "D") {
        cell = { ...position, hazard: "deadlock", kind: "hazard" };
      } else if (token === "M") {
        cell = { ...position, hazard: "memory", kind: "hazard" };
      } else if (token === "R") {
        cell = { ...position, hazard: "route", kind: "hazard" };
      } else {
        cell = { ...position, kind: "path" };
      }

      cells.push(cell);
    });
  });

  return {
    cells,
    columns: definition.rows[0]?.length ?? 0,
    enemies,
    goal,
    items,
    rows: definition.rows.length,
    start,
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

function calculateMazeScore(input: {
  elapsed: number;
  itemCount: number;
  lives: number;
  moves: number;
  totalItems: number;
  won: boolean;
}) {
  const allItemsBonus = input.itemCount === input.totalItems ? 24 : 0;
  const itemBonus = input.itemCount * 11 + allItemsBonus;
  const lifeBonus = input.lives * 9;
  const base = input.won ? 92 : 42;
  return clampScore(base + itemBonus + lifeBonus - input.moves * 1.25 - input.elapsed * 0.9);
}

function resetEnemies(maze: ParsedMaze) {
  return maze.enemies.map((enemy) => ({
    ...enemy,
    position: enemy.start,
  }));
}

function keyToDirection(key: string): Direction | null {
  switch (key.toLowerCase()) {
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    case "arrowright":
    case "d":
      return "right";
    case "arrowup":
    case "w":
      return "up";
    default:
      return null;
  }
}

function getCell(maze: ParsedMaze, position: Position) {
  return maze.cells.find((cell) => cell.x === position.x && cell.y === position.y);
}

function isWalkableForEnemy(maze: ParsedMaze, position: Position) {
  const cell = getCell(maze, position);
  return Boolean(cell && cell.kind !== "wall");
}

function enemyStep(enemy: MazeEnemy, target: Position, maze: ParsedMaze) {
  const options = (Object.keys(directionDelta) as Direction[])
    .map((direction) => {
      const delta = directionDelta[direction];
      const position = {
        x: enemy.position.x + delta.x,
        y: enemy.position.y + delta.y,
      };

      return {
        distance: Math.abs(position.x - target.x) + Math.abs(position.y - target.y),
        position,
      };
    })
    .filter((candidate) => isWalkableForEnemy(maze, candidate.position))
    .sort((a, b) => a.distance - b.distance);

  return options[0]?.position ?? enemy.position;
}

function nextSwipeDirection(start: Position, end: Position): Direction | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) {
    return null;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }

  return dy > 0 ? "down" : "up";
}

export function BugMaze({ locale, onComplete }: BugMazeProps) {
  const t = copy[locale];
  const [layoutIndex, setLayoutIndex] = useState(0);
  const maze = useMemo(() => parseMaze(mazeDefinitions[layoutIndex]), [layoutIndex]);
  const [status, setStatus] = useState<MazeStatus>("idle");
  const [position, setPosition] = useState<Position>(() => parseMaze(mazeDefinitions[0]).start);
  const [trail, setTrail] = useState<string[]>([]);
  const [collectedItems, setCollectedItems] = useState<Set<string>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [enemies, setEnemies] = useState<MazeEnemy[]>(() => resetEnemies(parseMaze(mazeDefinitions[0])));
  const [virusMode, setVirusMode] = useState(false);
  const [invulnerableUntil, setInvulnerableUntil] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ count?: number; id: number; kind: FeedbackKind } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<Position | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser preferences and localStorage are client-only.
    setBestScore(readBestScore());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const timer = window.setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (invulnerableUntil <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => setInvulnerableUntil(0), Math.max(0, invulnerableUntil - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [invulnerableUntil]);

  const allItemsCollected = collectedItems.size === maze.items.length;
  const threatActive = virusMode || collectedItems.size > 0;
  const currentScore = useMemo(
    () =>
      finalScore ??
      (status === "idle"
        ? 0
        : calculateMazeScore({
            elapsed,
            itemCount: collectedItems.size,
            lives,
            moves,
            totalItems: maze.items.length,
            won: status === "won",
          })),
    [collectedItems.size, elapsed, finalScore, lives, maze.items.length, moves, status],
  );

  const itemsByCell = useMemo(() => new Map(maze.items.map((item) => [item.id, item])), [maze.items]);
  const enemiesByCell = useMemo(() => new Map(enemies.map((enemy) => [cellKey(enemy.position), enemy])), [enemies]);

  const triggerFeedback = useCallback((kind: FeedbackKind, count?: number) => {
    setFeedback({ count, id: Date.now(), kind });
  }, []);

  const startGame = useCallback(
    (nextLayout = layoutIndex) => {
      const nextMaze = parseMaze(mazeDefinitions[nextLayout]);
      setLayoutIndex(nextLayout);
      setPosition(nextMaze.start);
      setTrail([]);
      setCollectedItems(new Set());
      setMoves(0);
      setElapsed(0);
      setLives(MAX_LIVES);
      setEnemies(resetEnemies(nextMaze));
      setInvulnerableUntil(0);
      setFinalScore(null);
      setFeedback(null);
      setStatus("running");
    },
    [layoutIndex],
  );

  const finishGame = useCallback(
    (
      nextStatus: "won" | "failed",
      snapshot: { deployStage: number; elapsed: number; itemCount: number; lives: number; moves: number; totalItems: number; virusesActive: number },
    ) => {
      const score = calculateMazeScore({
        ...snapshot,
        won: nextStatus === "won",
      });
      setFinalScore(score);
      setStatus(nextStatus);
      triggerFeedback(nextStatus === "won" ? "win" : "fail");
      setBestScore((current) => {
        const best = Math.max(current, score);
        window.localStorage.setItem(BEST_SCORE_KEY, String(best));
        return best;
      });
      onComplete({
        deviceType: detectGameDeviceType(),
        durationMs: Math.max(250, snapshot.elapsed * 1000),
        game: "bug-maze",
        gameVersion: GAME_VERSIONS["bug-maze"],
        metadata: {
          damageTaken: MAX_LIVES - snapshot.lives,
          deployStage: snapshot.deployStage,
          livesRemaining: snapshot.lives,
          tokensCollected: snapshot.itemCount,
          totalTokens: snapshot.totalItems,
          virusesActive: snapshot.virusesActive,
        },
        score,
      });
    },
    [onComplete, triggerFeedback],
  );

  const applyDamage = useCallback(
    (snapshot: { activeElapsed: number; itemCount: number; moves: number; totalItems: number }, nextEnemies: MazeEnemy[]) => {
      if (Date.now() < invulnerableUntil) {
        setEnemies(nextEnemies);
        return;
      }

      const nextLives = lives - 1;
      setLives(nextLives);
      setInvulnerableUntil(Date.now() + DAMAGE_GRACE_MS);
      triggerFeedback(nextLives <= 0 ? "fail" : "hit");

      if (nextLives <= 0) {
        setEnemies(nextEnemies);
        finishGame("failed", {
          elapsed: snapshot.activeElapsed,
          deployStage: layoutIndex + 1,
          itemCount: snapshot.itemCount,
          lives: 0,
          moves: snapshot.moves,
          totalItems: snapshot.totalItems,
          virusesActive: snapshot.itemCount > 0 || virusMode ? maze.enemies.length : 0,
        });
        return;
      }

      setPosition(maze.start);
      setTrail([]);
      setEnemies(resetEnemies(maze));
    },
    [finishGame, invulnerableUntil, layoutIndex, lives, maze, triggerFeedback, virusMode],
  );

  const move = useCallback(
    (direction: Direction) => {
      let activePosition = position;
      let activeMoves = moves;
      let activeElapsed = elapsed;
      let nextCollected = new Set(collectedItems);
      let nextEnemies = enemies;

      if (status === "idle" || status === "won" || status === "failed") {
        activePosition = maze.start;
        activeMoves = 0;
        activeElapsed = 0;
        nextCollected = new Set();
        nextEnemies = resetEnemies(maze);
        setPosition(maze.start);
        setTrail([]);
        setCollectedItems(nextCollected);
        setMoves(0);
        setElapsed(0);
        setLives(MAX_LIVES);
        setEnemies(nextEnemies);
        setInvulnerableUntil(0);
        setFinalScore(null);
        setFeedback(null);
        setStatus("running");
      }

      const delta = directionDelta[direction];
      const nextPosition = { x: activePosition.x + delta.x, y: activePosition.y + delta.y };
      const nextCell = getCell(maze, nextPosition);

      if (!nextCell || nextCell.kind === "wall") {
        triggerFeedback("blocked");
        return;
      }

      if (nextCell.kind === "goal" && nextCollected.size < maze.items.length) {
        triggerFeedback("locked", maze.items.length - nextCollected.size);
        return;
      }

      const nextMoves = activeMoves + 1;
      const currentKey = cellKey(activePosition);
      const nextKey = cellKey(nextPosition);

      setPosition(nextPosition);
      setMoves(nextMoves);
      setTrail((current) => [currentKey, ...current.filter((key) => key !== currentKey)].slice(0, TRAIL_LIMIT));

      if (nextCell.kind === "item" && !nextCollected.has(nextKey)) {
        nextCollected.add(nextKey);
        setCollectedItems(nextCollected);
        triggerFeedback(nextCollected.size === 1 ? "virus" : "item");
      }

      const nextThreatActive = virusMode || nextCollected.size > 0;
      const shouldMoveEnemies = nextThreatActive && nextMoves % 3 === 0;

      if (shouldMoveEnemies) {
        nextEnemies = nextEnemies.map((enemy) => ({
          ...enemy,
          position: enemyStep(enemy, nextPosition, maze),
        }));
        setEnemies(nextEnemies);
      }

      const snapshot = {
        activeElapsed,
        itemCount: nextCollected.size,
        moves: nextMoves,
        totalItems: maze.items.length,
      };

      if (nextCell.kind === "hazard" || (nextThreatActive && nextEnemies.some((enemy) => samePosition(enemy.position, nextPosition)))) {
        applyDamage(snapshot, nextEnemies);
        return;
      }

      if (nextCell.kind === "goal") {
        finishGame("won", {
          elapsed: activeElapsed,
          deployStage: layoutIndex + 1,
          itemCount: nextCollected.size,
          lives,
          moves: nextMoves,
          totalItems: maze.items.length,
          virusesActive: nextThreatActive ? maze.enemies.length : 0,
        });
      }
    },
    [applyDamage, collectedItems, elapsed, enemies, finishGame, layoutIndex, lives, maze, moves, position, status, triggerFeedback, virusMode],
  );

  useEffect(() => {
    function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      const activeElement = document.activeElement;
      const isFocusedInside = activeElement instanceof HTMLElement && rootRef.current?.contains(activeElement);
      if (!isFocusedInside && status === "idle") {
        return;
      }

      const direction = keyToDirection(event.key);

      if (direction) {
        event.preventDefault();
        move(direction);
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        startGame();
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [move, startGame, status]);

  function handleBoardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = keyToDirection(event.key);

    if (direction) {
      event.preventDefault();
      move(direction);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;

    if (!start || !touch) {
      return;
    }

    const direction = nextSwipeDirection(start, {
      x: touch.clientX,
      y: touch.clientY,
    });

    if (!direction) {
      return;
    }

    event.preventDefault();
    move(direction);
  }

  function switchMap() {
    startGame((layoutIndex + 1) % mazeDefinitions.length);
  }

  const statusTitle = status === "won" ? t.wonTitle : status === "failed" ? t.failedTitle : t.idleTitle;
  const statusText = status === "won" ? t.wonText : status === "failed" ? t.failedText : t.idleText;
  const feedbackLabel = feedback
    ? feedback.kind === "locked" && typeof feedback.count === "number"
      ? `${t.locked}: ${t.lockedCount(feedback.count)}`
      : t[feedback.kind]
    : "";

  return (
    <section aria-labelledby="bug-maze-title" ref={rootRef}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h2 className={styles.sectionTitle} id="bug-maze-title">
            {t.title}
          </h2>
        </div>
        <p className={styles.trainingNote}>{t.subtitle}</p>
      </div>

      <div className={styles.mazeLayout}>
        <div
          aria-label={`${t.eyebrow}: ${mazeDefinitions[layoutIndex].name[locale]}`}
          className={[
            styles.mazeStage,
            threatActive && status === "running" ? styles.mazeStageDanger : "",
            status === "won" ? styles.mazeStageWon : "",
            status === "failed" ? styles.mazeStageFailed : "",
            feedback?.kind === "hit" || feedback?.kind === "fail" ? styles.mazeStageHitFlash : "",
            feedback?.kind === "blocked" || feedback?.kind === "locked" ? styles.mazeStageBlocked : "",
          ].join(" ")}
          onKeyDown={handleBoardKeyDown}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
          role="group"
          tabIndex={0}
        >
          <div className={styles.mazeHud}>
            <div>
              <span>{t.score}</span>
              <strong aria-live="polite">{currentScore}</strong>
            </div>
            <div>
              <span>{t.best}</span>
              <strong>{Math.max(bestScore, currentScore)}</strong>
            </div>
            <div>
              <span>{t.moves}</span>
              <strong>{moves}</strong>
            </div>
            <div>
              <span>{t.time}</span>
              <strong>{elapsed}s</strong>
            </div>
          </div>

          <div className={styles.mazeMeta}>
            <span>{mazeDefinitions[layoutIndex].name[locale]}</span>
            <span>
              {t.items}: {collectedItems.size}/{maze.items.length}
            </span>
            <span>
              {t.lives}: {lives}/{MAX_LIVES}
              <span className={styles.mazeLifePips} aria-hidden="true">
                {Array.from({ length: MAX_LIVES }, (_, index) => (
                  <span className={index >= lives ? styles.mazeLifeLost : ""} key={index} />
                ))}
              </span>
            </span>
            <span className={threatActive ? styles.mazeVirusModeActive : ""}>
              {t.threat}: {threatActive ? t.active : t.dormant}
            </span>
            <span className={allItemsCollected ? styles.mazeDeployOpen : styles.mazeDeployLocked}>
              {t.deploy}: {allItemsCollected ? t.active : t.locked}
            </span>
          </div>

          <div aria-hidden="true" className={styles.mazeGrid} style={{ "--maze-columns": maze.columns } as StyleVars}>
            {maze.cells.map((cell) => {
              const key = cellKey(cell);
              const hasPlayer = position.x === cell.x && position.y === cell.y;
              const isTrail = trail.includes(key) && !hasPlayer;
              const item = itemsByCell.get(key);
              const itemCollected = Boolean(item && collectedItems.has(key));
              const enemy = enemiesByCell.get(key);
              const classNames = [
                styles.mazeCell,
                cell.kind === "wall" ? styles.mazeWall : "",
                cell.kind === "goal" ? styles.mazeGoal : "",
                cell.kind === "goal" && !allItemsCollected ? styles.mazeGoalLocked : "",
                item ? styles.mazePatch : "",
                cell.kind === "start" ? styles.mazeStart : "",
                cell.kind === "hazard" && cell.hazard ? `${styles.mazeHazard} ${hazardClassNames[cell.hazard]}` : "",
                itemCollected ? styles.mazePatchCollected : "",
                enemy ? styles.mazeVirusCell : "",
                isTrail ? styles.mazeTrail : "",
              ].join(" ");

              return (
                <span className={classNames} key={key}>
                  {cell.kind === "goal" ? (
                    <span className={styles.mazeCellLabel}>{allItemsCollected ? "SAFE DEPLOY" : "LOCKED"}</span>
                  ) : null}
                  {item && !itemCollected ? <span className={styles.mazeCellLabel}>{item.kind}</span> : null}
                  {cell.kind === "hazard" && cell.hazard ? <span className={styles.mazeCellLabel}>{hazardLabels[cell.hazard]}</span> : null}
                  {enemy ? <span className={styles.mazeVirus}>{enemy.label}</span> : null}
                  {hasPlayer ? (
                    <span
                      className={[styles.mazePlayer, invulnerableUntil > 0 ? styles.mazePlayerInvulnerable : ""].join(" ")}
                      key={`${key}-${moves}-${lives}`}
                    />
                  ) : null}
                </span>
              );
            })}
          </div>

          {status !== "running" ? (
            <div className={styles.mazeOverlay}>
              <div className={styles.stageMessageInner}>
                <p className={styles.gameStatus}>{t.status[status]}</p>
                <h3>{statusTitle}</h3>
                <p>{statusText}</p>
              </div>
            </div>
          ) : null}

          {feedback ? (
            <span
              aria-live="polite"
              className={[
                styles.mazeFeedback,
                feedback.kind === "hit" || feedback.kind === "fail" ? styles.mazeFeedbackHit : "",
                feedback.kind === "win" || feedback.kind === "item" || feedback.kind === "virus" ? styles.mazeFeedbackGood : "",
                feedback.kind === "blocked" || feedback.kind === "locked" ? styles.mazeFeedbackBlocked : "",
              ].join(" ")}
              key={feedback.id}
            >
              {feedbackLabel}
            </span>
          ) : null}
        </div>

        <aside className={styles.mazeSide}>
          <div className={styles.runnerPanel}>
            <p className={styles.gameStatus}>{t.status[status]}</p>
            <div className={styles.mazeActions}>
              <button className={`${styles.runnerAction} ${styles.runnerActionPrimary}`} onClick={() => startGame()} type="button">
                {status === "idle" ? t.start : t.restart}
              </button>
              <button className={styles.runnerAction} onClick={switchMap} type="button">
                {t.nextLayout}
              </button>
              <button
                aria-pressed={virusMode}
                className={styles.runnerAction}
                onClick={() => setVirusMode((current) => !current)}
                type="button"
              >
                {t.virusMode}: {virusMode ? t.virusModeOn : t.virusModeOff}
              </button>
            </div>
          </div>

          <div className={styles.runnerPanel}>
            <h3>{t.controlsTitle}</h3>
            <div className={styles.mazeDpad} aria-label={t.controlsTitle}>
              <button aria-label={t.directions.up} className={styles.mazeDirection} onClick={() => move("up")} type="button">
                {"\u2191"}
              </button>
              <button aria-label={t.directions.left} className={styles.mazeDirection} onClick={() => move("left")} type="button">
                {"\u2190"}
              </button>
              <button aria-label={t.directions.right} className={styles.mazeDirection} onClick={() => move("right")} type="button">
                {"\u2192"}
              </button>
              <button aria-label={t.directions.down} className={styles.mazeDirection} onClick={() => move("down")} type="button">
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
