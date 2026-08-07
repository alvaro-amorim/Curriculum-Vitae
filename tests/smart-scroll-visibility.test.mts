import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("smart scroll hook reads browser scroll position without waiting for interaction", () => {
  const source = read("src/hooks/use-smart-scroll-visibility.ts");

  assert.match(source, /window\.scrollY/);
  assert.match(source, /window\.pageYOffset/);
  assert.match(source, /document\.documentElement\.scrollTop/);
  assert.match(source, /window\.addEventListener\("scroll"/);
  assert.match(source, /requestAnimationFrame/);
});

test("smart scroll visibility resets whenever the public route changes", () => {
  const hook = read("src/hooks/use-smart-scroll-visibility.ts");
  const topbar = read("src/components/layout/topbar.tsx");

  assert.match(hook, /resetKey/);
  assert.match(hook, /\[directionThreshold, disabled, hideAfter, resetKey\]/);
  assert.match(topbar, /resetKey: pathname/);
});

test("menu and real keyboard focus may lock visibility, pointer focus may not", () => {
  const source = read("src/components/layout/topbar.tsx");

  assert.match(source, /disabled: open \|\| keyboardFocusInside/);
  assert.match(source, /keyboardInteractionRef\.current/);
  assert.doesNotMatch(source, /pointerInside/);
});

test("hidden scroll state cannot be overridden by hover or pointer focus", () => {
  const source = read("src/styles/topbar-scroll-authority.css");

  assert.match(source, /\[data-topbar="global"\]\[data-hidden="true"\]:hover/);
  assert.match(source, /\[data-topbar="global"\]\[data-hidden="true"\]:focus-within/);
  assert.match(source, /opacity: 0/);
  assert.match(source, /pointer-events: none/);
});
