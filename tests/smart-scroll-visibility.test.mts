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
  assert.match(hook, /\[directionThreshold, disabled, hideAfter, idleDelay, resetKey\]/);
  assert.match(topbar, /resetKey: pathname/);
});

test("navbar idle hide is scheduled without requiring a click", () => {
  const source = read("src/hooks/use-smart-scroll-visibility.ts");

  assert.match(source, /idleDelay = 2800/);
  assert.match(source, /scheduleIdleHide/);
  assert.match(source, /window\.setTimeout/);
  assert.doesNotMatch(source, /pointerdown/);
});

test("menu and real keyboard focus may lock visibility, pointer focus may not", () => {
  const source = read("src/components/layout/topbar.tsx");

  assert.match(source, /disabled: open \|\| keyboardFocusInside/);
  assert.match(source, /keyboardInteractionRef\.current/);
  assert.doesNotMatch(source, /pointerInside/);
});

test("hidden scroll state wins over hover and focus regardless of CSS module order", () => {
  const source = read("src/styles/topbar-scroll-authority.css");

  assert.match(source, /\[data-topbar="global"\]\[data-hidden="true"\]:hover/);
  assert.match(source, /\[data-topbar="global"\]\[data-hidden="true"\]:focus-within/);
  assert.match(source, /opacity: 0 !important/);
  assert.match(source, /transform: translate\(-50%, -145%\) !important/);
  assert.match(source, /pointer-events: none !important/);
});

test("global navigation loader starts on internal route clicks and releases after pathname changes", () => {
  const source = read("src/components/layout/global-navigation-loader.tsx");
  const layout = read("src/app/layout.tsx");

  assert.match(source, /document\.addEventListener\("click", handleDocumentClick, true\)/);
  assert.match(source, /pendingPathRef/);
  assert.match(source, /previousPathRef/);
  assert.match(source, /document\.fonts\?\.ready/);
  assert.match(source, /ROUTE_FAILSAFE_MS/);
  assert.match(layout, /<GlobalNavigationLoader \/>/);
});
