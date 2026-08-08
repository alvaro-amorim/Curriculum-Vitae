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
  assert.match(styles, /@media \(max-width: 620px\)/);
});

test("player and viruses move through one bounded actor layer", () => {
  const source = read("src/components/lab/bug-maze-v2.tsx");
  const styles = read("src/components/lab/bug-maze-v2.module.css");

  assert.match(source, /function actorStyle/);
  assert.match(source, /data-maze-actors/);
  assert.match(source, /data-role="player"/);
  assert.match(source, /data-role="virus"/);
  assert.match(styles, /\.board \[data-maze-actor\][\s\S]*transition:/);
  assert.match(styles, /left 145ms/);
  assert.match(styles, /top 145ms/);
});

test("maze art distinguishes connected walls, artifacts, portal and threat state without viewport overlays", () => {
  const source = read("src/components/lab/bug-maze-v2.tsx");
  const styles = read("src/components/lab/bug-maze-v2.module.css");

  assert.match(source, /data-join-top/);
  assert.match(source, /data-maze-item/);
  assert.match(source, /data-maze-goal/);
  assert.match(source, /threatDistance/);
  assert.match(styles, /\.wall\[data-join-top="true"\]/);
  assert.match(styles, /\.artifact\[data-kind="KEY"\]/);
  assert.match(styles, /\.goalLocked \.goalMark/);
  assert.match(styles, /\.board\[data-threat="critical"\]/);
});

test("mobile ranking remains subordinate to gameplay", () => {
  const modal = read("src/styles/bug-maze-modal.css");

  assert.match(modal, /grid-template-rows: auto auto !important/);
  assert.match(modal, /max-height: 9\.2rem/);
  assert.match(modal, /max-height: 6\.6rem/);
  assert.match(modal, /li:nth-child\(n \+ 2\)/);
});
