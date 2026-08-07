import assert from "node:assert/strict";
import test from "node:test";

import {
  isTopbarNearTop,
  resolveTopbarScrollAction,
  shouldLockTopbarVisibility,
} from "../src/lib/topbar-visibility.ts";

test("topbar stays visible near the top of the page", () => {
  assert.equal(isTopbarNearTop(40, 900), true);
  assert.equal(resolveTopbarScrollAction({
    currentY: 40,
    lastY: 0,
    viewportHeight: 900,
    menuOpen: false,
    focusInside: false,
    keyboardInteraction: false,
  }), "show");
});

test("pointer focus from a clicked navigation link does not pin the topbar", () => {
  assert.equal(shouldLockTopbarVisibility({
    menuOpen: false,
    focusInside: true,
    keyboardInteraction: false,
  }), false);

  assert.equal(resolveTopbarScrollAction({
    currentY: 360,
    lastY: 320,
    viewportHeight: 900,
    menuOpen: false,
    focusInside: true,
    keyboardInteraction: false,
  }), "hide");
});

test("keyboard focus keeps the topbar visible for accessibility", () => {
  assert.equal(shouldLockTopbarVisibility({
    menuOpen: false,
    focusInside: true,
    keyboardInteraction: true,
  }), true);

  assert.equal(resolveTopbarScrollAction({
    currentY: 360,
    lastY: 320,
    viewportHeight: 900,
    menuOpen: false,
    focusInside: true,
    keyboardInteraction: true,
  }), "show");
});

test("scroll direction hides on descent and reveals on ascent", () => {
  assert.equal(resolveTopbarScrollAction({
    currentY: 420,
    lastY: 390,
    viewportHeight: 900,
    menuOpen: false,
    focusInside: false,
    keyboardInteraction: false,
  }), "hide");

  assert.equal(resolveTopbarScrollAction({
    currentY: 360,
    lastY: 390,
    viewportHeight: 900,
    menuOpen: false,
    focusInside: false,
    keyboardInteraction: false,
  }), "show");
});

test("open mobile menu always locks the topbar visible", () => {
  assert.equal(resolveTopbarScrollAction({
    currentY: 500,
    lastY: 450,
    viewportHeight: 900,
    menuOpen: true,
    focusInside: false,
    keyboardInteraction: false,
  }), "show");
});
