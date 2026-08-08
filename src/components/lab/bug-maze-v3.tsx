"use client";

import type { CSSProperties, KeyboardEvent, TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GAME_VERSIONS, detectGameDeviceType } from "@/lib/lab-score";
import type { GameScorePayloadV2, Locale } from "@/types/portfolio";

import styles from "./bug-maze-v3.module.css";

type MazeStatus = "idle" | "running" | "won" | "failed";
type Direction = "up" | "down" | "left" | "right";
type CellKind = "wall" | "path" | "start" | "goal" | "item";
type ItemKind = "TEST" | "FIX" | "TOKEN" | "PATCH" | "KEY" | "API";
type FeedbackKind = "blocked" | "item" | "hit" | "win" | "fail" | "locked" | "virus";
type Position = { x: number; y: number };
type MazeCell = Position & { kind: CellKind };
type MazeItem = { id: string; kind: ItemKind; position: Position };
type MazeEnemy = { id: string; position: Position; start: Position };
type MazeDefinition = { rows: string[]; name: Record<Locale, string> };
type ParsedMaze = {
  cells: MazeCell[];
  columns: number;
  enemySpawns: MazeEnemy[];
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

type PhaseSnapshot = {
  elapsed: number;
  itemCount: number;
  lives: number;
  moves: number;
  totalItems: number;
};

const BEST_SCORE_KEY = "alvaro-dev-bug-maze-best-v3";
const MAX_LIVES = 3;
const MAX_ACTIVE_VIRUSES = 5;
const TRAIL_LIMIT = 10;
const SWIPE_THRESHOLD = 26;
const DAMAGE_GRACE_MS = 850;

const mazeDefinitions: MazeDefinition[] = [
  {
    name: { pt: "Pacote de deploy", en: "Deploy package" },
    rows: [
      "###############",
      "#S.V..#T.V..G.#",
      "#.###.#.###.#.#",
      "#...#...#...#.#",
      "###.#####.#.#.#",
      "#K..#..F#.#V..#",
      "#.###.#.#.###.#",
      "#..V#.#...#A..#",
      "#.###.###.#.###",
      "#P....V...C...#",
      "###############",
    ],
  },
  {
    name: { pt: "Incidente em produção", en: "Production incident" },
    rows: [
      "###############",
      "#S..#V..A...VG#",
      "#.#.#.#####.#.#",
      "#.#...#V..#.#.#",
      "#.###.#T#.#.#.#",
      "#...#...#...#.#",
      "###.#.###.###.#",
      "#P.V#...#...K.#",
      "#.#####.#.###.#",
      "#..F...V...C..#",
      "###############",
    ],
  },
  {
    name: { pt: "Hotfix de gateway", en: "Gateway hotfix" },
    rows: [
      "###############",
      "#S....#...V..G#",
      "###.#.#.#.###.#",
      "#T..#...#...V.#",
      "#.#####.###.#.#",
      "#..K..#...#.#.#",
      "#.###.#.#.#.#.#",
      "#V..#...#F..#A#",
      "#.#.#####.#.#.#",
      "#P..V..C..V...#",
      "###############",
    ],
  },
  {
    name: { pt: "Falha de autenticação", en: "Authentication failure" },
    rows: [
      "###############",
      "#S..V....#...G#",
      "#.#####.#.#.#.#",
      "#T....#.#.#V#.#",
      "###.#.#.#.#.#.#",
      "#K..#...#...#.#",
      "#.#.###.###.#.#",
      "#.#V..#F..#A#.#",
      "#.###.#.#.###.#",
      "#P..V.C...V...#",
      "###############",
    ],
  },
  {
    name: { pt: "Rollback crítico", en: "Critical rollback" },
    rows: [
      "###############",
      "#S...#V......G#",
      "#.#.#.#####.#.#",
      "#T#...#...#.#.#",
      "#.###.#V#.#.#.#",
      "#K....#.#...#.#",
      "#####.#.###.#.#",
      "#P..V.#F..#A..#",
      "#.###.###.#.###",
      "#..V..C...V...#",
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

const itemGlyphs: Record<ItemKind, string> = {
  API: "↔",
  FIX: "</>",
  KEY: "◆",
  PATCH: "+",
  TEST: "✓",
  TOKEN: "●",
};

const copy = {
  pt: {
    game: "Bug Maze",
    start: "Iniciar run",
    next: "Próximo incidente",
    restart: "Nova run",
    score: "run score",
    best: "recorde",
    phase: "incidente",
    time: "tempo",
    tokens: "artefatos",
    lives: "integridade",
    threat: "ameaças",
    distance: "distância",
    deploy: "deploy",
    dormant: "dormentes",
    active: "rastreando",
    locked: "bloqueado",
    ready: "liberado",
    idleTitle: "Saneie a rota de produção.",
    idleText: "Colete os seis artefatos, evite a ameaça e alcance o Safe Deploy. Cada incidente troca o mapa e adiciona um novo processo infectado.",
    wonTitle: "Incidente resolvido.",
    wonText: "A próxima rota aumenta o nível de ameaça sem zerar o score da sua run.",
    failedTitle: "Run interrompida.",
    failedText: "Sua pontuação acumulada foi registrada. Uma nova run recomeça no Incidente 01.",
    collectBrief: "6 artefatos obrigatórios",
    deployBrief: "Safe Deploy após a coleta",
    threatBrief: (count: number) => `${count} ${count === 1 ? "processo infectado" : "processos infectados"}`,
    blocked: "rota bloqueada",
    item: "artefato coletado",
    hit: "integridade -1",
    win: "incidente resolvido",
    fail: "processo infectado",
    lockedFeedback: "deploy ainda bloqueado",
    virus: "ameaça detectada",
    remaining: (count: number) => `${count} restantes`,
    steps: (count: number) => `${count} passos`,
    map: "rota",
    phaseScore: "fase",
    runScore: "run",
    reached: "alcançado",
  },
  en: {
    game: "Bug Maze",
    start: "Start run",
    next: "Next incident",
    restart: "New run",
    score: "run score",
    best: "record",
    phase: "incident",
    time: "time",
    tokens: "artifacts",
    lives: "integrity",
    threat: "threats",
    distance: "distance",
    deploy: "deploy",
    dormant: "dormant",
    active: "tracking",
    locked: "locked",
    ready: "ready",
    idleTitle: "Sanitize the production route.",
    idleText: "Collect all six artifacts, avoid the threat, and reach Safe Deploy. Every incident changes the map and adds another infected process.",
    wonTitle: "Incident resolved.",
    wonText: "The next route raises the threat level without resetting your run score.",
    failedTitle: "Run interrupted.",
    failedText: "Your accumulated score was registered. A new run restarts at Incident 01.",
    collectBrief: "6 required artifacts",
    deployBrief: "Safe Deploy after collection",
    threatBrief: (count: number) => `${count} infected ${count === 1 ? "process" : "processes"}`,
    blocked: "route blocked",
    item: "artifact collected",
    hit: "integrity -1",
    win: "incident resolved",
    fail: "infected process",
    lockedFeedback: "deploy still locked",
    virus: "threat detected",
    remaining: (count: number) => `${count} remaining`,
    steps: (count: number) => `${count} steps`,
    map: "route",
    phaseScore: "stage",
    runScore: "run",
    reached: "reached",
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
  const enemySpawns: MazeEnemy[] = [];
  const items: MazeItem[] = [];
  let goal = { x: 1, y: 1 };
  let start = { x: 1, y: 1 };

  definition.rows.forEach((row, y) => {
    [...row].forEach((token, x) => {
      const position = { x, y };
      if (token === "#") cells.push({ ...position, kind: "wall" });
      else if (token === "S") {
        start = position;
        cells.push({ ...position, kind: "start" });
      } else if (token === "G") {
        goal = position;
        cells.push({ ...position, kind: "goal" });
      } else if (token === "V") {
        enemySpawns.push({ id: `virus-${x}-${y}`, position, start: position });
        cells.push({ ...position, kind: "path" });
      } else if (token in itemTokens) {
        items.push({ id: cellKey(position), kind: itemTokens[token], position });
        cells.push({ ...position, kind: "item" });
      } else cells.push({ ...position, kind: "path" });
    });
  });

  return {
    cells,
    columns: definition.rows[0]?.length ?? 0,
    enemySpawns,
    goal,
    items,
    rows: definition.rows.length,
    start,
  };
}

function getCell(maze: ParsedMaze, position: Position) {
  return maze.cells.find((cell) => cell.x === position.x && cell.y === position.y);
}

function isWalkable(maze: ParsedMaze, position: Position) {
  const cell = getCell(maze, position);
  return Boolean(cell && cell.kind !== "wall");
}

function isWall(maze: ParsedMaze, position: Position) {
  return getCell(maze, position)?.kind === "wall";
}

function buildDistanceMap(maze: ParsedMaze, target: Position) {
  const distances = new Map<string, number>([[cellKey(target), 0]]);
  const queue: Position[] = [target];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const currentDistance = distances.get(cellKey(current)) ?? 0;

    for (const delta of Object.values(directionDelta)) {
      const next = { x: current.x + delta.x, y: current.y + delta.y };
      const key = cellKey(next);
      if (!isWalkable(maze, next) || distances.has(key)) continue;
      distances.set(key, currentDistance + 1);
      queue.push(next);
    }
  }

  return distances;
}

function moveEnemies(enemies: MazeEnemy[], target: Position, maze: ParsedMaze) {
  const distances = buildDistanceMap(maze, target);
  const occupied = new Set(enemies.map((enemy) => cellKey(enemy.position)));

  return enemies.map((enemy) => {
    occupied.delete(cellKey(enemy.position));
    const options = Object.values(directionDelta)
      .map((delta) => ({ x: enemy.position.x + delta.x, y: enemy.position.y + delta.y }))
      .filter((candidate) => isWalkable(maze, candidate))
      .filter((candidate) => samePosition(candidate, target) || !occupied.has(cellKey(candidate)))
      .sort((a, b) => (distances.get(cellKey(a)) ?? Number.POSITIVE_INFINITY) - (distances.get(cellKey(b)) ?? Number.POSITIVE_INFINITY));
    const position = options[0] ?? enemy.position;
    occupied.add(cellKey(position));
    return { ...enemy, position };
  });
}

function virusCountForPhase(phaseNumber: number) {
  return Math.min(MAX_ACTIVE_VIRUSES, Math.max(1, phaseNumber));
}

function spawnEnemies(maze: ParsedMaze, phaseNumber: number) {
  return maze.enemySpawns
    .slice(0, virusCountForPhase(phaseNumber))
    .map((enemy, index) => ({ ...enemy, id: `${enemy.id}-${phaseNumber}-${index}`, position: enemy.start }));
}

function enemyMoveInterval(phaseNumber: number, itemCount: number) {
  const base = phaseNumber <= 2 ? 4 : phaseNumber <= 4 ? 3 : 2;
  return Math.max(2, base - (itemCount >= 4 && phaseNumber >= 3 ? 1 : 0));
}

function wakeGraceForPhase(phaseNumber: number) {
  return phaseNumber <= 2 ? 3 : 2;
}

function readBestScore() {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(BEST_SCORE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculatePhaseScore(input: PhaseSnapshot & { phaseNumber: number; won: boolean }) {
  const multiplier = 1 + Math.min(1.5, (input.phaseNumber - 1) * 0.12);
  const itemBonus = input.itemCount * 9;
  const completionBonus = input.won ? 34 : 0;
  const lifeBonus = input.lives * 7;
  const phaseBase = input.won ? 42 : 10;
  const efficiencyPenalty = input.moves * 0.58 + input.elapsed * 0.35;
  return Math.max(0, Math.round((phaseBase + itemBonus + completionBonus + lifeBonus - efficiencyPenalty) * multiplier));
}

function keyToDirection(key: string): Direction | null {
  switch (key.toLowerCase()) {
    case "arrowdown": case "s": return "down";
    case "arrowleft": case "a": return "left";
    case "arrowright": case "d": return "right";
    case "arrowup": case "w": return "up";
    default: return null;
  }
}

function nextSwipeDirection(start: Position, end: Position): Direction | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

function actorStyle(position: Position, maze: ParsedMaze): CSSProperties {
  return {
    height: `${100 / maze.rows}%`,
    left: `${(position.x / maze.columns) * 100}%`,
    top: `${(position.y / maze.rows) * 100}%`,
    width: `${100 / maze.columns}%`,
  };
}

export function BugMazeV3({ locale, onComplete }: BugMazeProps) {
  const t = copy[locale];
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phaseNumber = phaseIndex + 1;
  const mapIndex = phaseIndex % mazeDefinitions.length;
  const mazeDefinition = mazeDefinitions[mapIndex];
  const maze = useMemo(() => parseMaze(mazeDefinition), [mazeDefinition]);
  const virusCount = virusCountForPhase(phaseNumber);

  const [status, setStatus] = useState<MazeStatus>("idle");
  const [position, setPosition] = useState<Position>(() => parseMaze(mazeDefinitions[0]).start);
  const [playerDirection, setPlayerDirection] = useState<Direction>("right");
  const [trail, setTrail] = useState<string[]>([]);
  const [collectedItems, setCollectedItems] = useState<Set<string>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [enemies, setEnemies] = useState<MazeEnemy[]>(() => spawnEnemies(parseMaze(mazeDefinitions[0]), 1));
  const [threatStartedAtMove, setThreatStartedAtMove] = useState<number | null>(null);
  const [invulnerableUntil, setInvulnerableUntil] = useState(0);
  const [runScore, setRunScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lastPhaseScore, setLastPhaseScore] = useState(0);
  const [feedback, setFeedback] = useState<{ id: number; kind: FeedbackKind; count?: number } | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<Position | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is client-only.
    setBestScore(readBestScore());
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (invulnerableUntil <= 0) return;
    const timeout = window.setTimeout(() => setInvulnerableUntil(0), Math.max(0, invulnerableUntil - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [invulnerableUntil]);

  const allItemsCollected = collectedItems.size === maze.items.length;
  const threatActive = threatStartedAtMove !== null;
  const phasePreviewScore = useMemo(
    () => status === "running"
      ? calculatePhaseScore({ elapsed, itemCount: collectedItems.size, lives, moves, phaseNumber, totalItems: maze.items.length, won: false })
      : 0,
    [collectedItems.size, elapsed, lives, maze.items.length, moves, phaseNumber, status],
  );
  const displayScore = status === "running" ? runScore + phasePreviewScore : runScore;
  const itemsByCell = useMemo(() => new Map(maze.items.map((item) => [item.id, item])), [maze.items]);
  const threatDistance = useMemo(() => {
    if (!threatActive || enemies.length === 0) return null;
    const distances = buildDistanceMap(maze, position);
    const values = enemies.map((enemy) => distances.get(cellKey(enemy.position)) ?? Number.POSITIVE_INFINITY);
    const minimum = Math.min(...values);
    return Number.isFinite(minimum) ? minimum : null;
  }, [enemies, maze, position, threatActive]);
  const threatLevel = threatDistance === null ? "dormant" : threatDistance <= 2 ? "critical" : threatDistance <= 4 ? "near" : "tracking";

  const triggerFeedback = useCallback((kind: FeedbackKind, count?: number) => {
    setFeedback({ id: Date.now(), kind, count });
  }, []);

  const preparePhase = useCallback((nextPhaseIndex: number, options?: { resetRun?: boolean }) => {
    const nextPhaseNumber = nextPhaseIndex + 1;
    const nextDefinition = mazeDefinitions[nextPhaseIndex % mazeDefinitions.length];
    const nextMaze = parseMaze(nextDefinition);
    if (options?.resetRun) setRunScore(0);
    setPhaseIndex(nextPhaseIndex);
    setPosition(nextMaze.start);
    setPlayerDirection("right");
    setTrail([]);
    setCollectedItems(new Set());
    setMoves(0);
    setElapsed(0);
    setLives(MAX_LIVES);
    setEnemies(spawnEnemies(nextMaze, nextPhaseNumber));
    setThreatStartedAtMove(null);
    setInvulnerableUntil(0);
    setLastPhaseScore(0);
    setFeedback(null);
    setStatus("running");
    window.requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>("[data-maze-board]")?.focus());
  }, []);

  const recordResult = useCallback((nextStatus: "won" | "failed", snapshot: PhaseSnapshot) => {
    const phaseScore = calculatePhaseScore({ ...snapshot, phaseNumber, won: nextStatus === "won" });
    const totalScore = runScore + phaseScore;
    setLastPhaseScore(phaseScore);
    setRunScore(totalScore);
    setStatus(nextStatus);
    triggerFeedback(nextStatus === "won" ? "win" : "fail");
    setBestScore((current) => {
      const best = Math.max(current, totalScore);
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
        deployStage: phaseNumber,
        livesRemaining: snapshot.lives,
        tokensCollected: snapshot.itemCount,
        totalTokens: snapshot.totalItems,
        virusesActive: virusCount,
      },
      score: totalScore,
    });
  }, [onComplete, phaseNumber, runScore, triggerFeedback, virusCount]);

  const applyDamage = useCallback((snapshot: Omit<PhaseSnapshot, "elapsed" | "lives">, nextEnemies: MazeEnemy[]) => {
    if (Date.now() < invulnerableUntil) {
      setEnemies(nextEnemies);
      return;
    }
    const nextLives = lives - 1;
    setLives(nextLives);
    setInvulnerableUntil(Date.now() + DAMAGE_GRACE_MS);
    if (nextLives <= 0) {
      setEnemies(nextEnemies);
      recordResult("failed", { ...snapshot, elapsed, lives: 0 });
      return;
    }
    triggerFeedback("hit");
    setPosition(maze.start);
    setPlayerDirection("right");
    setTrail([]);
    setEnemies(spawnEnemies(maze, phaseNumber));
  }, [elapsed, invulnerableUntil, lives, maze, phaseNumber, recordResult, triggerFeedback]);

  const move = useCallback((direction: Direction) => {
    if (status !== "running") return;
    const delta = directionDelta[direction];
    const nextPosition = { x: position.x + delta.x, y: position.y + delta.y };
    const nextCell = getCell(maze, nextPosition);
    setPlayerDirection(direction);

    if (!nextCell || nextCell.kind === "wall") {
      triggerFeedback("blocked");
      return;
    }
    if (nextCell.kind === "goal" && collectedItems.size < maze.items.length) {
      triggerFeedback("locked", maze.items.length - collectedItems.size);
      return;
    }

    const nextMoves = moves + 1;
    const currentKey = cellKey(position);
    const nextKey = cellKey(nextPosition);
    const nextCollected = new Set(collectedItems);
    let nextThreatStartedAtMove = threatStartedAtMove;

    setPosition(nextPosition);
    setMoves(nextMoves);
    setTrail((current) => [currentKey, ...current.filter((key) => key !== currentKey)].slice(0, TRAIL_LIMIT));

    if (nextCell.kind === "item" && !nextCollected.has(nextKey)) {
      nextCollected.add(nextKey);
      setCollectedItems(nextCollected);
      if (nextThreatStartedAtMove === null) {
        nextThreatStartedAtMove = nextMoves;
        setThreatStartedAtMove(nextMoves);
        triggerFeedback("virus");
      } else triggerFeedback("item");
    }

    let nextEnemies = enemies;
    const threatAge = nextThreatStartedAtMove === null ? 0 : nextMoves - nextThreatStartedAtMove;
    const interval = enemyMoveInterval(phaseNumber, nextCollected.size);
    const shouldMoveEnemies = nextThreatStartedAtMove !== null
      && threatAge >= wakeGraceForPhase(phaseNumber)
      && threatAge % interval === 0;

    if (shouldMoveEnemies) {
      nextEnemies = moveEnemies(enemies, nextPosition, maze);
      setEnemies(nextEnemies);
    }

    const hitEnemy = nextThreatStartedAtMove !== null && nextEnemies.some((enemy) => samePosition(enemy.position, nextPosition));
    if (hitEnemy) {
      applyDamage({ itemCount: nextCollected.size, moves: nextMoves, totalItems: maze.items.length }, nextEnemies);
      return;
    }

    if (nextCell.kind === "goal") {
      recordResult("won", { elapsed, itemCount: nextCollected.size, lives, moves: nextMoves, totalItems: maze.items.length });
    }
  }, [applyDamage, collectedItems, elapsed, enemies, lives, maze, moves, phaseNumber, position, recordResult, status, threatStartedAtMove, triggerFeedback]);

  useEffect(() => {
    function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      const direction = keyToDirection(event.key);
      if (!direction || status !== "running") return;
      event.preventDefault();
      move(direction);
    }
    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [move, status]);

  function handleBoardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = keyToDirection(event.key);
    if (!direction || status !== "running") return;
    event.preventDefault();
    move(direction);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch || status !== "running") return;
    const direction = nextSwipeDirection(start, { x: touch.clientX, y: touch.clientY });
    if (!direction) return;
    if (event.cancelable) event.preventDefault();
    move(direction);
  }

  const feedbackLabel = feedback
    ? feedback.kind === "locked" && typeof feedback.count === "number"
      ? `${t.lockedFeedback} · ${t.remaining(feedback.count)}`
      : t[feedback.kind]
    : "";
  const statusTitle = status === "won" ? t.wonTitle : status === "failed" ? t.failedTitle : t.idleTitle;
  const statusText = status === "won" ? t.wonText : status === "failed" ? t.failedText : t.idleText;
  const nextVirusCount = virusCountForPhase(phaseNumber + 1);

  return (
    <section aria-labelledby="bug-maze-title" className={styles.root} ref={rootRef}>
      <h2 className={styles.srOnly} id="bug-maze-title">{t.game}</h2>
      <div className={styles.stage} data-status={status} data-threat={threatLevel}>
        <header className={styles.hud}>
          <div className={styles.phaseIdentity}>
            <span>{t.phase} {String(phaseNumber).padStart(2, "0")}</span>
            <strong>{mazeDefinition.name[locale]}</strong>
          </div>
          <div className={styles.metrics}>
            <div><span>{t.score}</span><strong>{displayScore}</strong></div>
            <div><span>{t.best}</span><strong>{Math.max(bestScore, displayScore)}</strong></div>
            <div><span>{t.threat}</span><strong>{virusCount}</strong></div>
            <div><span>{t.time}</span><strong>{elapsed}s</strong></div>
          </div>
        </header>

        <div className={styles.statusRail}>
          <span className={styles.progressPill}><i style={{ "--phase-progress": `${Math.min(100, (collectedItems.size / maze.items.length) * 100)}%` } as StyleVars} />{t.tokens} <b>{collectedItems.size}/{maze.items.length}</b></span>
          <span>{t.lives} <b>{"●".repeat(lives)}{"○".repeat(MAX_LIVES - lives)}</b></span>
          <span data-tone={threatActive ? "danger" : "quiet"}>{t.threat} <b>{threatActive ? t.active : t.dormant}</b></span>
          <span className={styles.distance} data-tone={threatDistance !== null && threatDistance <= 2 ? "danger" : "quiet"}>{t.distance} <b>{threatDistance === null ? "—" : t.steps(threatDistance)}</b></span>
          <span data-tone={allItemsCollected ? "good" : "warning"}>{t.deploy} <b>{allItemsCollected ? t.ready : t.locked}</b></span>
        </div>

        <div
          aria-label={`${t.game}: ${mazeDefinition.name[locale]}`}
          className={styles.board}
          data-status={status}
          data-threat={threatLevel}
          onKeyDown={handleBoardKeyDown}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
          role="application"
          style={{ "--maze-columns": maze.columns, "--maze-rows": maze.rows } as StyleVars}
          tabIndex={0}
        >
          <div aria-hidden="true" className={styles.grid}>
            {maze.cells.map((cell) => {
              const key = cellKey(cell);
              const item = itemsByCell.get(key);
              const itemCollected = Boolean(item && collectedItems.has(key));
              const hasPlayer = samePosition(position, cell);
              const isTrail = trail.includes(key) && !hasPlayer;
              const wallTop = cell.kind === "wall" && isWall(maze, { x: cell.x, y: cell.y - 1 });
              const wallRight = cell.kind === "wall" && isWall(maze, { x: cell.x + 1, y: cell.y });
              const wallBottom = cell.kind === "wall" && isWall(maze, { x: cell.x, y: cell.y + 1 });
              const wallLeft = cell.kind === "wall" && isWall(maze, { x: cell.x - 1, y: cell.y });
              return (
                <span
                  className={[
                    styles.cell,
                    cell.kind === "wall" ? styles.wall : styles.path,
                    cell.kind === "start" ? styles.startCell : "",
                    cell.kind === "goal" ? styles.goalCell : "",
                    itemCollected ? styles.collectedCell : "",
                    isTrail ? styles.trailCell : "",
                  ].join(" ")}
                  data-join-bottom={wallBottom || undefined}
                  data-join-left={wallLeft || undefined}
                  data-join-right={wallRight || undefined}
                  data-join-top={wallTop || undefined}
                  key={key}
                >
                  {cell.kind === "goal" ? (
                    <span className={styles.portal} data-ready={allItemsCollected}>
                      <i />
                      <b>{allItemsCollected ? "DEPLOY" : "LOCK"}</b>
                    </span>
                  ) : null}
                  {item && !itemCollected ? (
                    <span className={styles.artifact} data-kind={item.kind}>
                      <i>{itemGlyphs[item.kind]}</i>
                      <b>{item.kind}</b>
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>

          <div aria-hidden="true" className={styles.actors}>
            {enemies.map((enemy, index) => (
              <span className={styles.actor} data-role="virus" key={enemy.id} style={actorStyle(enemy.position, maze)}>
                <i className={styles.virus} data-active={threatActive} data-index={index + 1}>
                  <span />
                  <b>!</b>
                </i>
              </span>
            ))}
            <span className={styles.actor} data-direction={playerDirection} data-role="player" style={actorStyle(position, maze)}>
              <i className={[styles.player, invulnerableUntil > 0 ? styles.invulnerable : ""].join(" ")}>
                <span>&gt;_</span>
                <em />
              </i>
            </span>
          </div>

          {feedback ? <div aria-live="polite" className={styles.feedback} data-kind={feedback.kind} key={feedback.id}>{feedbackLabel}</div> : null}

          {status !== "running" ? (
            <div className={styles.overlay}>
              <div className={styles.overlayPanel}>
                <div className={styles.overlayTopline}>
                  <span>{t.phase} {String(phaseNumber).padStart(2, "0")}</span>
                  <span>{virusCount}× BUG</span>
                </div>
                <h3>{statusTitle}</h3>
                <p>{statusText}</p>

                {status === "idle" ? (
                  <div className={styles.briefing}>
                    <span><i>01</i>{t.collectBrief}</span>
                    <span><i>02</i>{t.threatBrief(virusCount)}</span>
                    <span><i>03</i>{t.deployBrief}</span>
                  </div>
                ) : (
                  <div className={styles.results}>
                    <div><span>{t.phaseScore}</span><strong>+{lastPhaseScore}</strong></div>
                    <div><span>{t.runScore}</span><strong>{runScore}</strong></div>
                    <div><span>{t.phase}</span><strong>{String(phaseNumber).padStart(2, "0")}</strong></div>
                    <div><span>{t.lives}</span><strong>{lives}/{MAX_LIVES}</strong></div>
                  </div>
                )}

                {status === "won" ? (
                  <div className={styles.nextThreat}>NEXT · {t.map} {String((mapIndex + 1) % mazeDefinitions.length + 1).padStart(2, "0")} · {nextVirusCount}× BUG</div>
                ) : null}

                <button
                  className={styles.primaryButton}
                  onClick={() => {
                    if (status === "won") preparePhase(phaseIndex + 1);
                    else preparePhase(0, { resetRun: true });
                  }}
                  type="button"
                >
                  {status === "idle" ? t.start : status === "won" ? t.next : t.restart}
                  <span>↗</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <footer className={styles.mobileFooter}>
          <span>SWIPE</span>
          <span>{t.phase} {phaseNumber}</span>
          <span>{virusCount}× BUG</span>
        </footer>
      </div>
    </section>
  );
}
