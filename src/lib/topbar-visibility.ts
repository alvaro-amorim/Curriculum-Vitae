export const TOPBAR_SCROLL_THRESHOLDS = {
  hideDelta: 8,
  showDelta: 6,
  nearTopMin: 120,
  nearTopViewportRatio: 0.15,
} as const;

export type TopbarScrollAction = "show" | "hide" | "keep";

type TopbarScrollInput = {
  currentY: number;
  lastY: number;
  viewportHeight: number;
  menuOpen: boolean;
  focusInside: boolean;
  keyboardInteraction: boolean;
};

export function isTopbarNearTop(scrollY: number, viewportHeight: number) {
  return scrollY < Math.max(
    TOPBAR_SCROLL_THRESHOLDS.nearTopMin,
    viewportHeight * TOPBAR_SCROLL_THRESHOLDS.nearTopViewportRatio,
  );
}

export function shouldLockTopbarVisibility({
  menuOpen,
  focusInside,
  keyboardInteraction,
}: Pick<TopbarScrollInput, "menuOpen" | "focusInside" | "keyboardInteraction">) {
  return menuOpen || (keyboardInteraction && focusInside);
}

export function resolveTopbarScrollAction({
  currentY,
  lastY,
  viewportHeight,
  menuOpen,
  focusInside,
  keyboardInteraction,
}: TopbarScrollInput): TopbarScrollAction {
  if (isTopbarNearTop(currentY, viewportHeight)) {
    return "show";
  }

  if (shouldLockTopbarVisibility({ menuOpen, focusInside, keyboardInteraction })) {
    return "show";
  }

  const delta = currentY - lastY;

  if (delta > TOPBAR_SCROLL_THRESHOLDS.hideDelta) {
    return "hide";
  }

  if (delta < -TOPBAR_SCROLL_THRESHOLDS.showDelta) {
    return "show";
  }

  return "keep";
}
