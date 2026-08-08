import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("Bug Maze board is constrained by available modal height instead of fixed aspect ratio", () => {
  const css = read("src/styles/bug-maze-responsive.css");

  assert.match(css, /section\[aria-labelledby="bug-maze-title"\] \[data-maze-board\]/);
  assert.match(css, /height: 100% !important/);
  assert.match(css, /aspect-ratio: auto !important/);
  assert.match(css, /contain: layout paint/);
});

test("compact desktop collapses arcade chrome before shrinking gameplay", () => {
  const css = read("src/styles/bug-maze-responsive.css");

  assert.match(css, /@media \(max-width: 1480px\), \(max-height: 850px\)/);
  assert.match(css, /> nav \{\s*display: none !important/);
  assert.match(css, /section\[aria-labelledby="bug-maze-title"\] > div:first-child \{\s*display: none !important/);
});

test("mobile keeps the maze primary and moves auxiliary UI out of the arena", () => {
  const responsive = read("src/styles/bug-maze-responsive.css");
  const dock = read("src/styles/bug-maze-ranking-dock.css");

  assert.match(responsive, /@media \(max-width: 620px\)/);
  assert.match(responsive, /height: clamp\(27rem, 67dvh, 34rem\)/);
  assert.match(responsive, /content: "SWIPE"/);
  assert.match(dock, /real leaderboard/i);
  assert.match(dock, /section\[role="dialog"\]:has\(section\[aria-labelledby="bug-maze-title"\]\)/);
});

test("very short phones preserve gameplay and reduce leaderboard density", () => {
  const css = read("src/styles/bug-maze-ranking-dock.css");

  assert.match(css, /@media \(max-width: 620px\) and \(max-height: 570px\)/);
  assert.match(css, /> li:nth-child\(n \+ 2\)/);
  assert.match(css, /display: none !important/);
});

test("global stylesheet loads Bug Maze responsive layers after Runtime Runner layers", () => {
  const globals = read("src/app/globals.css");

  const runtimeIndex = globals.indexOf("runtime-runner-ranking-dock.css");
  const mazeResponsiveIndex = globals.indexOf("bug-maze-responsive.css");
  const mazeDockIndex = globals.indexOf("bug-maze-ranking-dock.css");

  assert.ok(runtimeIndex >= 0);
  assert.ok(mazeResponsiveIndex > runtimeIndex);
  assert.ok(mazeDockIndex > mazeResponsiveIndex);
});
