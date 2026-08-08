import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("Bug Maze public entry points to progressive v3", () => {
  const entry = read("src/components/lab/bug-maze.tsx");
  const source = read("src/components/lab/bug-maze-v3.tsx");

  assert.match(entry, /BugMazeV3 as BugMaze/);
  assert.match(source, /bug-maze-v3\.module\.css/);
});

test("progression rotates handcrafted maps and scales threats from one to five", () => {
  const source = read("src/components/lab/bug-maze-v3.tsx");

  assert.match(source, /const MAX_ACTIVE_VIRUSES = 5/);
  assert.match(source, /const mazeDefinitions:[\s\S]*Pacote de deploy[\s\S]*Incidente em produção[\s\S]*Hotfix de gateway[\s\S]*Falha de autenticação[\s\S]*Rollback crítico/);
  assert.match(source, /function virusCountForPhase/);
  assert.match(source, /Math\.min\(MAX_ACTIVE_VIRUSES, Math\.max\(1, phaseNumber\)\)/);
  assert.match(source, /phaseIndex % mazeDefinitions\.length/);
});

test("completed incidents accumulate one run score instead of resetting each phase", () => {
  const source = read("src/components/lab/bug-maze-v3.tsx");

  assert.match(source, /const \[runScore, setRunScore\] = useState\(0\)/);
  assert.match(source, /const totalScore = runScore \+ phaseScore/);
  assert.match(source, /setRunScore\(totalScore\)/);
  assert.match(source, /preparePhase\(phaseIndex \+ 1\)/);
  assert.match(source, /preparePhase\(0, \{ resetRun: true \}\)/);
});

test("ranking payload receives cumulative score and current incident metadata", () => {
  const source = read("src/components/lab/bug-maze-v3.tsx");

  assert.match(source, /deployStage: phaseNumber/);
  assert.match(source, /virusesActive: virusCount/);
  assert.match(source, /score: totalScore/);
});

test("Bug Maze keeps path-distance pursuit with phase-dependent reaction and cadence", () => {
  const source = read("src/components/lab/bug-maze-v3.tsx");

  assert.match(source, /function buildDistanceMap/);
  assert.match(source, /function moveEnemies/);
  assert.match(source, /function enemyMoveInterval/);
  assert.match(source, /function wakeGraceForPhase/);
  assert.match(source, /distances\.get/);
});

test("movement cannot restart a completed run", () => {
  const source = read("src/components/lab/bug-maze-v3.tsx");

  assert.match(source, /if \(status !== "running"\) return;/);
  assert.doesNotMatch(source, /status === "won" \|\| status === "failed"[\s\S]{0,220}setStatus\("running"\)/);
});

test("player, viruses, connected walls and artifacts remain bounded game assets", () => {
  const source = read("src/components/lab/bug-maze-v3.tsx");
  const styles = read("src/components/lab/bug-maze-v3.module.css");

  assert.match(source, /function actorStyle/);
  assert.match(source, /className=\{styles\.actors\}/);
  assert.match(source, /data-role="player"/);
  assert.match(source, /data-role="virus"/);
  assert.match(source, /data-join-top/);
  assert.match(styles, /\.actor\s*\{[\s\S]*transition: left 135ms[\s\S]*top 135ms/);
  assert.match(styles, /\.player,[\s\S]*\.virus\s*\{[\s\S]*max-width: 78%[\s\S]*max-height: 78%/);
  assert.match(styles, /\.artifact\[data-kind="KEY"\]/);
  assert.match(styles, /\.portal\[data-ready="true"\]/);
});
