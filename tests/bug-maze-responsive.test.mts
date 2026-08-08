import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("Bug Maze owns its responsive board sizing inside the CSS Module", () => {
  const css = read("src/components/lab/bug-maze-v2.module.css");

  assert.match(css, /\.stage\s*\{[\s\S]*grid-template-rows: auto auto minmax\(0, 1fr\)/);
  assert.match(css, /\.board\s*\{[\s\S]*height: 100%/);
  assert.doesNotMatch(css, /aspect-ratio:\s*15\s*\/\s*11/);
});

test("Bug Maze actors are bounded by their grid cell instead of viewport-sized effects", () => {
  const css = read("src/components/lab/bug-maze-v2.module.css");

  assert.match(css, /\.player\s*\{[\s\S]*width: 68%[\s\S]*height: 68%/);
  assert.match(css, /\.virus\s*\{[\s\S]*width: 58%[\s\S]*height: 58%/);
  assert.match(css, /\.virus::before\s*\{[\s\S]*inset: -24%/);
  assert.doesNotMatch(css, /width:\s*min\([^\n]*50vw/);
});

test("global CSS imports only one Bug Maze modal integration layer", () => {
  const globals = read("src/app/globals.css");

  assert.match(globals, /bug-maze-modal\.css/);
  assert.doesNotMatch(globals, /bug-maze-responsive\.css/);
  assert.doesNotMatch(globals, /bug-maze-polish\.css/);
  assert.doesNotMatch(globals, /bug-maze-ranking-dock\.css/);
  assert.doesNotMatch(globals, /bug-maze-ranking-compact\.css/);
});

test("mobile keeps the real ranking compact and below gameplay", () => {
  const css = read("src/styles/bug-maze-modal.css");

  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /grid-template-rows: auto auto !important/);
  assert.match(css, /max-height: 9\.2rem !important/);
  assert.match(css, /@media \(max-width: 620px\) and \(max-height: 760px\)/);
  assert.match(css, /> li:nth-child\(n \+ 2\)/);
});
