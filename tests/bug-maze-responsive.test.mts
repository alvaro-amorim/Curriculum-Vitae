import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("Bug Maze owns one bounded visual system inside its CSS Module", () => {
  const css = read("src/components/lab/bug-maze-v3.module.css");

  assert.match(css, /\.stage\s*\{[\s\S]*grid-template-rows: auto auto minmax\(0, 1fr\) auto/);
  assert.match(css, /contain: layout paint/);
  assert.match(css, /\.hud,[\s\S]*\.board,[\s\S]*width: min\(100%, 68rem\)/);
  assert.match(css, /\.board\s*\{[\s\S]*align-self: stretch[\s\S]*max-height: 38rem/);
  assert.doesNotMatch(css, /height: clamp\([^\n]*dvh/);
});

test("mobile lets the shared modal allocate remaining viewport space to gameplay", () => {
  const css = read("src/styles/bug-maze-modal.css");

  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /height: 100dvh !important/);
  assert.match(css, /grid-template-rows: minmax\(0, 1fr\) auto !important/);
  assert.match(css, /> div:last-child[\s\S]*height: 100% !important/);
  assert.match(css, /\[data-lab-game-arena="true"\][\s\S]*height: 100% !important/);
});

test("mobile HUD stays compact without hiding run identity", () => {
  const css = read("src/components/lab/bug-maze-v3.module.css");

  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /\.metrics span\s*\{[\s\S]*font-size: 0\.25rem/);
  assert.match(css, /\.statusRail\s*\{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto auto/);
  assert.match(css, /\.mobileFooter\s*\{[\s\S]*display: flex/);
});

test("game actors stay bounded to their grid cell and avoid viewport-sized effects", () => {
  const css = read("src/components/lab/bug-maze-v3.module.css");

  assert.match(css, /\.player,[\s\S]*\.virus\s*\{[\s\S]*max-width: 76%[\s\S]*max-height: 76%/);
  assert.match(css, /\.virus\s*\{[\s\S]*width: 54%/);
  assert.doesNotMatch(css, /50vw/);
  assert.doesNotMatch(css, /50vh/);
});

test("global CSS keeps only the external Bug Maze modal integration layer", () => {
  const globals = read("src/app/globals.css");

  assert.match(globals, /bug-maze-modal\.css/);
  assert.doesNotMatch(globals, /bug-maze-responsive\.css/);
  assert.doesNotMatch(globals, /bug-maze-polish\.css/);
  assert.doesNotMatch(globals, /bug-maze-ranking-dock\.css/);
  assert.doesNotMatch(globals, /bug-maze-ranking-compact\.css/);
});

test("mobile real ranking sits directly after gameplay and reduces density on short screens", () => {
  const css = read("src/styles/bug-maze-modal.css");

  assert.match(css, /grid-template-rows: minmax\(0, 1fr\) auto !important/);
  assert.match(css, /max-height: 8\.2rem !important/);
  assert.match(css, /@media \(max-width: 620px\) and \(max-height: 760px\)/);
  assert.match(css, /max-height: 5\.3rem !important/);
  assert.match(css, /> li:nth-child\(n \+ 2\)/);
});
