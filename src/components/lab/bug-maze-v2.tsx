"use client";

import type { CSSProperties, KeyboardEvent, TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GAME_VERSIONS, detectGameDeviceType } from "@/lib/lab-score";
import type { GameScorePayloadV2, Locale } from "@/types/portfolio";

import labStyles from "./developer-lab.module.css";
import styles from "./bug-maze-v2.module.css";

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
const TRAIL_LIMIT = 12;
const SWIPE_THRESHOLD = 28;
const DAMAGE_GRACE_MS = 850;
const VIRUS_WAKE_GRACE_MOVES = 2;

const mazeDefinitions: MazeDefinition[] = [
  {
    name: { pt: "Pacote de deploy", en: "Deploy package" },
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
    name: { pt: "Incidente em produção", en: "Production incident" },
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

const copy = {
  pt: {
    eyebrow: "Bug Maze / Debug Route",
    title: "Depure a rota. Libere o deploy.",
    subtitle: "Colete os artefatos obrigatórios, leia o labirinto e escape do processo infectado antes de liberar produção.",
    start: "Iniciar debug",
    restart: "Nova execução",
    switchMap: "Trocar incidente",
    score: "score",
    best: "recorde",
    moves: "movimentos",
    time: "tempo",
    tokens: "artefatos",
    lives: "integridade",
    threat: "ameaça",
    deploy: "deploy",
    dormant: "dormente",
    active: "ativa",
    locked: "bloqueado",
    ready: "liberado",
    mission: "Missão",
    missionText: "Colete todos os artefatos antes de entrar no Safe Deploy.",
    controls: "Controles",
    keyboard: "Setas / WASD",
    mobile: "Swipe ou direcional",
    chase: "O processo infectado acorda após o primeiro artefato e recalcula a rota até você.",
    status: {
      idle: "aguardando execução",
      running: "debug em andamento",
      won: "deploy seguro",
      failed: "execução interrompida",
    },
    idleTitle: "Mapeie a rota antes de executar.",
    idleText: "Colete os seis artefatos. O vírus só acorda depois da primeira coleta e recebe uma pequena janela de reação.",
    wonTitle: "Safe Deploy liberado.",
    wonText: "A rota foi saneada e o resultado entrou no ranking.",
    failedTitle: "Integridade esgotada.",
    failedText: "O processo infectado encontrou seu node. Inicie uma nova execução para tentar outra rota.",
    blocked: "rota bloqueada",
    item: "artefato coletado",
    hit: "integridade -1",
    win: "deploy liberado",
    fail: "processo infectado",
    lockedFeedback: "deploy ainda bloqueado",
    virus: "ameaça ativada",
    remaining: (count: number) => `${count} restantes`,
    directions: { up: "Mover para cima", down: "Mover para baixo", left: "Mover para esquerda", right: "Mover para direita" },
  },
  en: {
    eyebrow: "Bug Maze / Debug Route",
    title: "Debug the route. Clear the deploy.",
    subtitle: "Collect the required artifacts, read the maze, and escape the infected process before releasing production.",
    start: "Start debug",
    restart: "New run",
    switchMap: "Switch incident",
    score: "score",
    best: "record",
    moves: "moves",
    time: "time",
    tokens: "artifacts",
    lives: "integrity",
    threat: "threat",
    deploy: "deploy",
    dormant: "dormant",
    active: "active",
    locked: "locked",
    ready: "ready",
    mission: "Mission",
    missionText: "Collect every artifact before entering Safe Deploy.",
    controls: "Controls",
    keyboard: "Arrows / WASD",
    mobile: "Swipe or d-pad",
    chase: "The infected process wakes after the first artifact and recalculates its route toward you.",
    status: {
      idle: "awaiting execution",
      running: "debug running",
      won: "safe deploy",
      failed: "execution interrupted",
    },
    idleTitle: "Map the route before execution.",
    idleText: "Collect all six artifacts. The virus wakes after the first pickup and gives you a short reaction window.",
    wonTitle: "Safe Deploy cleared.",
    wonText: "The route was sanitized and the result entered the ranking.",
    failedTitle: "Integrity depleted.",
    failedText: "The infected process reached your node. Start a new run to try another route.",
    blocked: "route blocked",
    item: "artifact collected",
    hit: "integrity -1",
    win: "deploy cleared",
    fail: "infected process",
    lockedFeedback: "deploy still locked",
    virus: "threat activated",
    remaining: (count: number) => `${count} remaining`,
    directions: { up: "Move up", down: "Move down", left: "Move left", right: "Move right" },
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
        enemies.push({ id: `virus-${x}-${y}`, position, start: position });
        cells.push({ ...position, kind: "path" });
      } else if (token in itemTokens) {
        items.push({ id: cellKey(position), kind: itemTokens[token], position });
        cells.push({ ...position, kind: "item" });
      } else cells.push({ ...position, kind: "path" });
    });
  });

  return { cells, columns: definition.rows[0]?.length ?? 0, enemies, goal, items, rows: definition.rows.length, start };
}

function getCell(maze: ParsedMaze, position: Position) {
  return maze.cells.find((cell) => cell.x === position.x && cell.y === position.y);
}

function isWalkable(maze: ParsedMaze, position: Position) {
  const cell = getCell(maze, position);
  return Boolean(cell && cell.kind !== "wall");
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
    const options = (Object.values(directionDelta) as Position[])
      .map((delta) => ({ x: enemy.position.x + delta.x, y: enemy.position.y + delta.y }))
      .filter((candidate) => isWalkable(maze, candidate))
      .filter((candidate) => samePosition(candidate, target) || !occupied.has(cellKey(candidate)))
      .sort((a, b) => (distances.get(cellKey(a)) ?? Number.POSITIVE_INFINITY) - (distances.get(cellKey(b)) ?? Number.POSITIVE_INFINITY));

    const position = options[0] ?? enemy.position;
    occupied.add(cellKey(position));
    return { ...enemy, position };
  });
}

function resetEnemies(maze: ParsedMaze) {
  return maze.enemies.map((enemy) => ({ ...enemy, position: enemy.start }));
}

function readBestScore() {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(BEST_SCORE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateMazeScore(input: { elapsed: number; itemCount: number; lives: number; moves: number; totalItems: number; won: boolean }) {
  const allItemsBonus = input.itemCount === input.totalItems ? 24 : 0;
  const itemBonus = input.itemCount * 11 + allItemsBonus;
  const lifeBonus = input.lives * 9;
  const base = input.won ? 92 : 42;
  return Math.max(0, Math.round(base + itemBonus + lifeBonus - input.moves * 1.25 - input.elapsed * 0.9));
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

export function BugMazeV2({ locale, onComplete }: BugMazeProps) {
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
  const [threatStartedAtMove, setThreatStartedAtMove] = useState<number | null>(null);
  const [invulnerableUntil, setInvulnerableUntil] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
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
  const currentScore = useMemo(() => finalScore ?? (status === "idle" ? 0 : calculateMazeScore({ elapsed, itemCount: collectedItems.size, lives, moves, totalItems: maze.items.length, won: status === "won" })), [collectedItems.size, elapsed, finalScore, lives, maze.items.length, moves, status]);
  const itemsByCell = useMemo(() => new Map(maze.items.map((item) => [item.id, item])), [maze.items]);
  const enemiesByCell = useMemo(() => new Map(enemies.map((enemy) => [cellKey(enemy.position), enemy])), [enemies]);

  const triggerFeedback = useCallback((kind: FeedbackKind, count?: number) => {
    setFeedback({ id: Date.now(), kind, count });
  }, []);

  const startGame = useCallback((nextLayout = layoutIndex) => {
    const nextMaze = parseMaze(mazeDefinitions[nextLayout]);
    setLayoutIndex(nextLayout);
    setPosition(nextMaze.start);
    setTrail([]);
    setCollectedItems(new Set());
    setMoves(0);
    setElapsed(0);
    setLives(MAX_LIVES);
    setEnemies(resetEnemies(nextMaze));
    setThreatStartedAtMove(null);
    setInvulnerableUntil(0);
    setFinalScore(null);
    setFeedback(null);
    setStatus("running");
    window.requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>("[data-maze-board]")?.focus());
  }, [layoutIndex]);

  const finishGame = useCallback((nextStatus: "won" | "failed", snapshot: { elapsed: number; itemCount: number; lives: number; moves: number; totalItems: number }) => {
    const score = calculateMazeScore({ ...snapshot, won: nextStatus === "won" });
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
        deployStage: layoutIndex + 1,
        livesRemaining: snapshot.lives,
        tokensCollected: snapshot.itemCount,
        totalTokens: snapshot.totalItems,
        virusesActive: threatActive ? maze.enemies.length : 0,
      },
      score,
    });
  }, [layoutIndex, maze.enemies.length, onComplete, threatActive, triggerFeedback]);

  const applyDamage = useCallback((snapshot: { itemCount: number; moves: number; totalItems: number }, nextEnemies: MazeEnemy[]) => {
    if (Date.now() < invulnerableUntil) {
      setEnemies(nextEnemies);
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setInvulnerableUntil(Date.now() + DAMAGE_GRACE_MS);

    if (nextLives <= 0) {
      setEnemies(nextEnemies);
      finishGame("failed", { elapsed, itemCount: snapshot.itemCount, lives: 0, moves: snapshot.moves, totalItems: snapshot.totalItems });
      return;
    }

    triggerFeedback("hit");
    setPosition(maze.start);
    setTrail([]);
    setEnemies(resetEnemies(maze));
  }, [elapsed, finishGame, invulnerableUntil, lives, maze, triggerFeedback]);

  const move = useCallback((direction: Direction) => {
    if (status !== "running") return;

    const delta = directionDelta[direction];
    const nextPosition = { x: position.x + delta.x, y: position.y + delta.y };
    const nextCell = getCell(maze, nextPosition);

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
      } else {
        triggerFeedback("item");
      }
    }

    let nextEnemies = enemies;
    const threatAge = nextThreatStartedAtMove === null ? 0 : nextMoves - nextThreatStartedAtMove;
    const enemyInterval = nextCollected.size >= 3 ? 3 : 4;
    const shouldMoveEnemies = nextThreatStartedAtMove !== null && threatAge >= VIRUS_WAKE_GRACE_MOVES && threatAge % enemyInterval === 0;

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
      finishGame("won", { elapsed, itemCount: nextCollected.size, lives, moves: nextMoves, totalItems: maze.items.length });
    }
  }, [applyDamage, collectedItems, elapsed, enemies, finishGame, lives, maze, moves, position, status, threatStartedAtMove, triggerFeedback]);

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
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
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

  return (
    <section aria-labelledby="bug-maze-title" className={styles.root} ref={rootRef}>
      <div className={labStyles.sectionHeader}>
        <div>
          <p className={labStyles.eyebrow}>{t.eyebrow}</p>
          <h2 className={labStyles.sectionTitle} id="bug-maze-title">{t.title}</h2>
        </div>
        <p className={labStyles.trainingNote}>{t.subtitle}</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.stage} data-status={status} data-threat={threatActive ? "active" : "dormant"}>
          <div className={styles.telemetry}>
            <div><span>{t.score}</span><strong>{currentScore}</strong></div>
            <div><span>{t.best}</span><strong>{Math.max(bestScore, currentScore)}</strong></div>
            <div><span>{t.moves}</span><strong>{moves}</strong></div>
            <div><span>{t.time}</span><strong>{elapsed}s</strong></div>
          </div>

          <div className={styles.runline}>
            <span className={styles.mapName}>{mazeDefinitions[layoutIndex].name[locale]}</span>
            <span>{t.tokens} <strong>{collectedItems.size}/{maze.items.length}</strong></span>
            <span>{t.lives} <strong>{lives}/{MAX_LIVES}</strong></span>
            <span data-tone={threatActive ? "danger" : "quiet"}>{t.threat} <strong>{threatActive ? t.active : t.dormant}</strong></span>
            <span data-tone={allItemsCollected ? "good" : "warning"}>{t.deploy} <strong>{allItemsCollected ? t.ready : t.locked}</strong></span>
          </div>

          <div
            aria-label={`${t.eyebrow}: ${mazeDefinitions[layoutIndex].name[locale]}`}
            className={styles.board}
            data-maze-board
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
                const enemy = enemiesByCell.get(key);
                const hasPlayer = samePosition(position, cell);
                const isTrail = trail.includes(key) && !hasPlayer;

                return (
                  <span
                    className={[
                      styles.cell,
                      cell.kind === "wall" ? styles.wall : styles.path,
                      cell.kind === "start" ? styles.start : "",
                      cell.kind === "goal" ? styles.goal : "",
                      cell.kind === "goal" && !allItemsCollected ? styles.goalLocked : "",
                      item && !itemCollected ? styles.itemCell : "",
                      itemCollected ? styles.itemCollected : "",
                      enemy ? styles.enemyCell : "",
                      isTrail ? styles.trail : "",
                    ].join(" ")}
                    key={key}
                  >
                    {cell.kind === "goal" ? <span className={styles.goalMark}>{allItemsCollected ? "DEPLOY" : "LOCK"}</span> : null}
                    {item && !itemCollected ? <span className={styles.artifact}>{item.kind}</span> : null}
                    {enemy ? <span className={styles.virus} aria-label="virus"><i>!</i></span> : null}
                    {hasPlayer ? <span className={[styles.player, invulnerableUntil > 0 ? styles.playerInvulnerable : ""].join(" ")}><b>&gt;_</b></span> : null}
                  </span>
                );
              })}
            </div>

            {feedback ? <div aria-live="polite" className={styles.feedback} data-kind={feedback.kind} key={feedback.id}>{feedbackLabel}</div> : null}

            {status !== "running" ? (
              <div className={styles.overlay}>
                <div className={styles.overlayPanel}>
                  <span>{t.status[status]}</span>
                  <h3>{statusTitle}</h3>
                  <p>{statusText}</p>
                  <div className={styles.overlayActions}>
                    <button className={styles.primaryButton} onClick={() => startGame()} type="button">{status === "idle" ? t.start : t.restart}</button>
                    <button className={styles.secondaryButton} onClick={() => startGame((layoutIndex + 1) % mazeDefinitions.length)} type="button">{t.switchMap}</button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.panel}>
            <span className={styles.panelEyebrow}>{t.mission}</span>
            <strong>{t.status[status]}</strong>
            <p>{t.missionText}</p>
            <div className={styles.integrity} aria-label={`${t.lives}: ${lives}/${MAX_LIVES}`}>
              {Array.from({ length: MAX_LIVES }, (_, index) => <i data-active={index < lives ? "true" : "false"} key={index} />)}
            </div>
          </div>

          <div className={styles.panel}>
            <span className={styles.panelEyebrow}>{t.controls}</span>
            <p><strong>{t.keyboard}</strong><br />{t.mobile}</p>
            <div className={styles.dpad}>
              <button aria-label={t.directions.up} onClick={() => move("up")} type="button">↑</button>
              <button aria-label={t.directions.left} onClick={() => move("left")} type="button">←</button>
              <button aria-label={t.directions.right} onClick={() => move("right")} type="button">→</button>
              <button aria-label={t.directions.down} onClick={() => move("down")} type="button">↓</button>
            </div>
          </div>

          <div className={styles.panel}>
            <span className={styles.panelEyebrow}>{t.threat}</span>
            <p>{t.chase}</p>
            <button className={styles.secondaryButton} onClick={() => startGame((layoutIndex + 1) % mazeDefinitions.length)} type="button">{t.switchMap}</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
