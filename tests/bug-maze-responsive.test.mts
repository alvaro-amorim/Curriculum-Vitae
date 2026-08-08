import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("Bug Maze v3 owns responsive sizing inside one CSS Module", () => {
  const css = read("src/components/lab/bug-maze-v3.module.css");

  assert.match(css, /\.stage\s*\{[\s\S]*grid-template-rows: auto auto minmax\(0, 1fr\) auto/);
  assert.match(css, /\.board\s*\{[\s\S]*height: 100%/);
  assert.doesNotMatch(css, /aspect-ratio:\s*15\s*\/\s*11/);
  assert.match(css, /contain: layout paint/);
});

test("mobile dedicates most of the viewport to gameplay while keeping HUD compact", () => {
  const css = read("src/components/lab/bug-maze-v3.module.css");

  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /height: clamp\(31rem, 64dvh, 38rem\)/);
  assert.match(css, /\.metrics span\s*\{[\s\S]*font-size: 0\.27rem/);
  assert.match(css, /\.statusRail\s*\{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto auto/);
  assert.match(css, /\.mobileFooter\s*\{[\s\S]*display: flex/);
});

test("game assets cannot grow beyond their own grid cell", () => {
  const css = read("src/components/lab/bug-maze-v3.module.css");

  assert.match(css, /\.player,[\s\S]*\.virus\s*\{[\s\S]*max-width: 78%[\s\S]*max-height: 78%/);
  assert.doesNotMatch(css, /50vw/);
  assert.doesNotMatch(css, /50vh/);
});

test("global CSS imports only the external Bug Maze modal integration layer", () => {
  const globals = read("src/app/globals.css");

  assert.match(globals, /bug-maze-modal\.css/);
  assert.doesNotMatch(globals, /bug-maze-responsive\.css/);
  assert.doesNotMatch(globals, /bug-maze-polish\.css/);
  assert.doesNotMatch(globals, /bug-maze-ranking-dock\.css/);
  assert.doesNotMatch(globals, /bug-maze-ranking-compact\.css/);
});

test("mobile real ranking remains below gameplay and reduces density on short screens", () => {
  const css = read("src/styles/bug-maze-modal.css");

  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /grid-template-rows: auto auto !important/);
  assert.match(css, /max-height: 9\.2rem !important/);
  assert.match(css, /@media \(max-width: 620px\) and \(max-height: 760px\)/);
  assert.match(css, /> li:nth-child\(n \+ 2\)/);
});
