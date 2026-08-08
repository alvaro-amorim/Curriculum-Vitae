import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("Bug Maze no longer auto-starts from movement after a completed run", () => {
  const source = read("src/components/lab/bug-maze-v2.tsx");

  assert.match(source, /if \(status !== "running"\) return;/);
  assert.doesNotMatch(source, /status === "won" \|\| status === "failed"[\s\S]{0,220}setStatus\("running"\)/);
});

test("Bug Maze uses path-distance pursuit instead of greedy Manhattan-only movement", () => {
  const source = read("src/components/lab/bug-maze-v2.tsx");

  assert.match(source, /function buildDistanceMap/);
  assert.match(source, /function moveEnemies/);
  assert.match(source, /distances\.get/);
});

test("virus activation includes a reaction window and progressive move interval", () => {
  const source = read("src/components/lab/bug-maze-v2.tsx");

  assert.match(source, /VIRUS_WAKE_GRACE_MOVES = 2/);
  assert.match(source, /nextCollected\.size >= 3 \? 3 : 4/);
});

test("Bug Maze v2 owns its visual system without changing other arcade games", () => {
  const entry = read("src/components/lab/bug-maze.tsx");
  const source = read("src/components/lab/bug-maze-v2.tsx");
  const styles = read("src/components/lab/bug-maze-v2.module.css");

  assert.match(entry, /BugMazeV2 as BugMaze/);
  assert.match(source, /bug-maze-v2\.module\.css/);
  assert.match(styles, /\.board/);
  assert.match(styles, /@media \(max-width: 720px\)/);
});
