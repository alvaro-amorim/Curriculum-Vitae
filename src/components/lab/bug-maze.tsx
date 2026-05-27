"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { clampScore } from "@/lib/lab-score";
import type { Locale } from "@/types/portfolio";

import styles from "./developer-lab.module.css";

type MazeStatus = "idle" | "running" | "won" | "failed";
type Direction = "up" | "down" | "left" | "right";
type CellKind = "wall" | "path" | "start" | "goal" | "patch" | "hazard";
type HazardKind = "bug" | "deadlock" | "memory" | "route";
type FeedbackKind = "blocked" | "patch" | "hit" | "win" | "fail";

type MazeCell = {
  x: number;
  y: number;
  kind: CellKind;
  hazard?: HazardKind;
};

type MazeDefinition = {
  rows: string[];
  name: Record<Locale, string>;
};

type ParsedMaze = {
  cells: MazeCell[];
  columns: number;
  rows: number;
  start: Position;
  patches: string[];
};

type Position = {
  x: number;
  y: number;
};

type BugMazeProps = {
  locale: Locale;
  onComplete: (score: number) => void;
};

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const BEST_SCORE_KEY = "alvaro-dev-bug-maze-best-v1";
const FAILURE_LIMIT = 3;
const TRAIL_LIMIT = 7;

const mazeDefinitions: MazeDefinition[] = [
  {
    name: {
      pt: "Pipeline quebrada",
      en: "Broken pipeline",
    },
    rows: [
      "#########",
      "#S..#..G#",
      "#.#.#.#.#",
      "#.#P..#.#",
      "#...##..#",
      "#B.P..D.#",
      "#########",
    ],
  },
  {
    name: {
      pt: "Deploy em risco",
      en: "Risky deploy",
    },
    rows: [
      "#########",
      "#S..P#..#",
      "#.###.#G#",
      "#...M.#.#",
      "###.#...#",
      "#R..P.B.#",
      "#########",
    ],
  },
  {
    name: {
      pt: "Rollback quente",
      en: "Hot rollback",
    },
    rows: [
      "#########",
      "#S#..P.G#",
      "#.#.###.#",
      "#...B...#",
      "###.#.#.#",
      "#P..M.R.#",
      "#########",
    ],
  },
];

const directionDelta: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const hazardLabels: Record<HazardKind, string> = {
  bug: "BUG",
  deadlock: "DEADLOCK",
  memory: "MEMORY",
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
    title: "Navegue at\u00e9 o deploy seguro.",
    subtitle:
      "Um labirinto técnico com grid real, patches visíveis, bugs agressivos, penalidade, vitória e score local.",
    start: "Iniciar labirinto",
    restart: "Reiniciar layout",
    nextLayout: "Trocar mapa",
    score: "score",
    best: "melhor",
    moves: "movimentos",
    time: "tempo",
    incidents: "incidentes",
    patches: "patches",
    status: {
      idle: "pronto para mapear",
      running: "debug em execu\u00e7\u00e3o",
      won: "safe deploy alcan\u00e7ado",
      failed: "debug interrompido",
    },
    idleTitle: "Leve o n\u00f3 de debug at\u00e9 o deploy.",
    idleText:
      "Use setas, WASD ou os controles de toque. O primeiro movimento já inicia a rodada; colete patches e evite três incidentes.",
    wonTitle: "Deploy seguro.",
    wonText: "O caminho foi validado e o score local foi registrado sem ranking real.",
    failedTitle: "Incidentes demais.",
    failedText: "Reinicie o mapa, colete patches e evite bugs, deadlocks e rotas quebradas.",
    blocked: "parede de execu\u00e7\u00e3o",
    patch: "+patch aplicado",
    hit: "incidente detectado",
    win: "deploy liberado",
    fail: "limite de incidentes",
    controlsTitle: "Controles",
    rulesTitle: "Regras",
    rules: [
      "Setas ou WASD movem o n\u00f3 de debug.",
      "Toque nos controles no mobile.",
      "Patches aumentam o score final.",
      "Tr\u00eas incidentes encerram a rodada.",
    ],
    reduced: "Modo reduced motion: efeitos decorativos reduzidos, gameplay preservado.",
    directions: {
      up: "Mover para cima",
      down: "Mover para baixo",
      left: "Mover para esquerda",
      right: "Mover para direita",
    },
  },
  en: {
    eyebrow: "Bug Maze",
    title: "Navigate to the safe deploy.",
    subtitle: "A technical maze with a real grid, visible patches, aggressive bugs, penalty, win state, and local score.",
    start: "Start maze",
    restart: "Restart layout",
    nextLayout: "Switch map",
    score: "score",
    best: "best",
    moves: "moves",
    time: "time",
    incidents: "incidents",
    patches: "patches",
    status: {
      idle: "ready to map",
      running: "debug running",
      won: "safe deploy reached",
      failed: "debug interrupted",
    },
    idleTitle: "Move the debug node to deploy.",
    idleText: "Use arrows, WASD, or touch controls. The first move starts the round; collect patches and avoid three incidents.",
    wonTitle: "Safe deploy.",
    wonText: "The route was validated and the local score was recorded without a real ranking.",
    failedTitle: "Too many incidents.",
    failedText: "Restart the map, collect patches, and avoid bugs, deadlocks, and broken routes.",
    blocked: "execution wall",
    patch: "+patch applied",
    hit: "incident detected",
    win: "deploy cleared",
    fail: "incident limit",
    controlsTitle: "Controls",
    rulesTitle: "Rules",
    rules: [
      "Arrow keys or WASD move the debug node.",
      "Use touch controls on mobile.",
      "Patches increase the final score.",
      "Three incidents end the round.",
    ],
    reduced: "Reduced motion mode: decorative effects are reduced, gameplay stays available.",
    directions: {
      up: "Move up",
      down: "Move down",
      left: "Move left",
      right: "Move right",
    },
  },
} as const;

function cellKey(position: Position) {
  return `${position.x}:${position.y}`;
}

function parseMaze(definition: MazeDefinition): ParsedMaze {
  const cells: MazeCell[] = [];
  const patches: string[] = [];
  let start: Position = { x: 1, y: 1 };

  definition.rows.forEach((row, y) => {
    [...row].forEach((token, x) => {
      const base = { x, y };
      let cell: MazeCell;

      if (token === "#") {
        cell = { ...base, kind: "wall" };
      } else if (token === "S") {
        start = base;
        cell = { ...base, kind: "start" };
      } else if (token === "G") {
        cell = { ...base, kind: "goal" };
      } else if (token === "P") {
        patches.push(cellKey(base));
        cell = { ...base, kind: "patch" };
      } else if (token === "B") {
        cell = { ...base, hazard: "bug", kind: "hazard" };
      } else if (token === "D") {
        cell = { ...base, hazard: "deadlock", kind: "hazard" };
      } else if (token === "M") {
        cell = { ...base, hazard: "memory", kind: "hazard" };
      } else if (token === "R") {
        cell = { ...base, hazard: "route", kind: "hazard" };
      } else {
        cell = { ...base, kind: "path" };
      }

      cells.push(cell);
    });
  });

  return {
    cells,
    columns: definition.rows[0]?.length ?? 0,
    rows: definition.rows.length,
    start,
    patches,
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
  hits: number;
  moves: number;
  patchCount: number;
  totalPatches: number;
  won: boolean;
}) {
  const patchBonus = input.patchCount * 12 + (input.patchCount === input.totalPatches ? 8 : 0);
  const base = input.won ? 94 : 52;
  return clampScore(base + patchBonus - input.moves * 1.9 - input.elapsed * 1.15 - input.hits * 17);
}

export function BugMaze({ locale, onComplete }: BugMazeProps) {
  const t = copy[locale];
  const [layoutIndex, setLayoutIndex] = useState(0);
  const maze = useMemo(() => parseMaze(mazeDefinitions[layoutIndex]), [layoutIndex]);
  const [status, setStatus] = useState<MazeStatus>("idle");
  const [position, setPosition] = useState<Position>(() => parseMaze(mazeDefinitions[0]).start);
  const [trail, setTrail] = useState<string[]>([]);
  const [collectedPatches, setCollectedPatches] = useState<Set<string>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [hits, setHits] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ id: number; kind: FeedbackKind } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);

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

  const currentScore = useMemo(
    () =>
      finalScore ??
      (status === "idle"
        ? 0
        : calculateMazeScore({
            elapsed,
            hits,
            moves,
            patchCount: collectedPatches.size,
            totalPatches: maze.patches.length,
            won: status === "won",
          })),
    [collectedPatches.size, elapsed, finalScore, hits, maze.patches.length, moves, status],
  );

  const triggerFeedback = useCallback((kind: FeedbackKind) => {
    setFeedback({ id: Date.now(), kind });
  }, []);

  const startGame = useCallback(
    (nextLayout = layoutIndex) => {
      const nextMaze = parseMaze(mazeDefinitions[nextLayout]);
      setLayoutIndex(nextLayout);
      setPosition(nextMaze.start);
      setTrail([]);
      setCollectedPatches(new Set());
      setMoves(0);
      setElapsed(0);
      setHits(0);
      setFinalScore(null);
      setFeedback(null);
      setStatus("running");
    },
    [layoutIndex],
  );

  const finishGame = useCallback(
    (nextStatus: "won" | "failed", snapshot: { elapsed: number; hits: number; moves: number; patchCount: number; totalPatches: number }) => {
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
      onComplete(score);
    },
    [onComplete, triggerFeedback],
  );

  const move = useCallback(
    (direction: Direction) => {
      let activePosition = position;
      let activeMoves = moves;
      let activeHits = hits;
      let activeElapsed = elapsed;
      let nextCollected = new Set(collectedPatches);

      if (status === "idle" || status === "won" || status === "failed") {
        activePosition = maze.start;
        activeMoves = 0;
        activeHits = 0;
        activeElapsed = 0;
        nextCollected = new Set();
        setPosition(maze.start);
        setTrail([]);
        setCollectedPatches(nextCollected);
        setMoves(0);
        setElapsed(0);
        setHits(0);
        setFinalScore(null);
        setFeedback(null);
        setStatus("running");
      }

      if (status !== "running" && status !== "idle" && status !== "won" && status !== "failed") {
        return;
      }

      const delta = directionDelta[direction];
      const nextPosition = { x: activePosition.x + delta.x, y: activePosition.y + delta.y };
      const nextCell = maze.cells.find((cell) => cell.x === nextPosition.x && cell.y === nextPosition.y);

      if (!nextCell || nextCell.kind === "wall") {
        triggerFeedback("blocked");
        return;
      }

      const nextMoves = activeMoves + 1;
      let nextHits = activeHits;
      const currentKey = cellKey(activePosition);

      setPosition(nextPosition);
      setMoves(nextMoves);
      setTrail((current) => [currentKey, ...current.filter((key) => key !== currentKey)].slice(0, TRAIL_LIMIT));

      if (nextCell.kind === "patch" && !nextCollected.has(cellKey(nextPosition))) {
        nextCollected.add(cellKey(nextPosition));
        setCollectedPatches(nextCollected);
        triggerFeedback("patch");
      }

      if (nextCell.kind === "hazard") {
        nextHits += 1;
        setHits(nextHits);
        triggerFeedback("hit");
      }

      const snapshot = {
        elapsed: activeElapsed,
        hits: nextHits,
        moves: nextMoves,
        patchCount: nextCollected.size,
        totalPatches: maze.patches.length,
      };

      if (nextCell.kind === "goal") {
        finishGame("won", snapshot);
      } else if (nextHits >= FAILURE_LIMIT) {
        finishGame("failed", snapshot);
      }
    },
    [collectedPatches, elapsed, finishGame, hits, maze.cells, maze.patches.length, maze.start, moves, position, status, triggerFeedback],
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

  function switchMap() {
    startGame((layoutIndex + 1) % mazeDefinitions.length);
  }

  const statusTitle = status === "won" ? t.wonTitle : status === "failed" ? t.failedTitle : t.idleTitle;
  const statusText = status === "won" ? t.wonText : status === "failed" ? t.failedText : t.idleText;
  const feedbackLabel = feedback ? t[feedback.kind] : "";

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
            hits >= FAILURE_LIMIT - 1 && status === "running" ? styles.mazeStageDanger : "",
            status === "won" ? styles.mazeStageWon : "",
            status === "failed" ? styles.mazeStageFailed : "",
            feedback?.kind === "hit" || feedback?.kind === "fail" ? styles.mazeStageHitFlash : "",
            feedback?.kind === "blocked" ? styles.mazeStageBlocked : "",
          ].join(" ")}
          onKeyDown={handleBoardKeyDown}
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
              {t.patches}: {collectedPatches.size}/{maze.patches.length}
            </span>
            <span>
              {t.incidents}: {hits}/{FAILURE_LIMIT}
              <span className={styles.mazeIncidentPips} aria-hidden="true">
                {Array.from({ length: FAILURE_LIMIT }, (_, index) => (
                  <span className={index < hits ? styles.mazeIncidentPipActive : ""} key={index} />
                ))}
              </span>
            </span>
          </div>

          <div aria-hidden="true" className={styles.mazeGrid} style={{ "--maze-columns": maze.columns } as StyleVars}>
            {maze.cells.map((cell) => {
              const key = cellKey(cell);
              const hasPlayer = position.x === cell.x && position.y === cell.y;
              const isTrail = trail.includes(key) && !hasPlayer;
              const patchCollected = cell.kind === "patch" && collectedPatches.has(key);
              const classNames = [
                styles.mazeCell,
                cell.kind === "wall" ? styles.mazeWall : "",
                cell.kind === "goal" ? styles.mazeGoal : "",
                cell.kind === "patch" ? styles.mazePatch : "",
                cell.kind === "start" ? styles.mazeStart : "",
                cell.kind === "hazard" && cell.hazard ? `${styles.mazeHazard} ${hazardClassNames[cell.hazard]}` : "",
                patchCollected ? styles.mazePatchCollected : "",
                isTrail ? styles.mazeTrail : "",
              ].join(" ");

              return (
                <span className={classNames} key={key}>
                  {cell.kind === "goal" ? <span className={styles.mazeCellLabel}>SAFE DEPLOY</span> : null}
                  {cell.kind === "patch" && !patchCollected ? <span className={styles.mazeCellLabel}>PATCH</span> : null}
                  {cell.kind === "hazard" && cell.hazard ? <span className={styles.mazeCellLabel}>{hazardLabels[cell.hazard]}</span> : null}
                  {hasPlayer ? <span className={styles.mazePlayer} key={`${key}-${moves}`} /> : null}
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
                feedback.kind === "win" || feedback.kind === "patch" ? styles.mazeFeedbackGood : "",
                feedback.kind === "blocked" ? styles.mazeFeedbackBlocked : "",
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
