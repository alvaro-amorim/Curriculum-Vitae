"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./custom-cursor.module.css";

type CursorState = "default" | "text" | "interactive" | "primary" | "hidden";

const CURSOR_SELECTOR = "[data-cursor]";
const TEXT_SELECTOR = [
  "textarea",
  "select",
  "[contenteditable='true']",
  "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio'])",
].join(", ");
const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "[role='button']",
  "summary",
  "label",
  "input[type='button']",
  "input[type='submit']",
  "input[type='reset']",
].join(", ");

function normalizeCursorState(value: string | null): CursorState | null {
  switch (value) {
    case "primary":
      return "primary";
    case "button":
    case "link":
    case "interactive":
      return "interactive";
    case "text":
      return "text";
    case "hidden":
      return "hidden";
    case "default":
      return "default";
    default:
      return null;
  }
}

function resolveCursorState(target: EventTarget | null): CursorState {
  if (!(target instanceof Element)) {
    return "default";
  }

  const explicitTarget = target.closest(CURSOR_SELECTOR);
  const explicitState = normalizeCursorState(explicitTarget?.getAttribute("data-cursor") ?? null);

  if (explicitState) {
    return explicitState;
  }

  if (target.closest(TEXT_SELECTOR)) {
    return "text";
  }

  const interactiveTarget = target.closest(INTERACTIVE_SELECTOR);

  if (
    interactiveTarget instanceof HTMLButtonElement ||
    interactiveTarget instanceof HTMLInputElement ||
    interactiveTarget instanceof HTMLSelectElement
  ) {
    return interactiveTarget.disabled ? "default" : "interactive";
  }

  return interactiveTarget ? "interactive" : "default";
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<CursorState>("hidden");
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine) and (hover: hover)");

    const syncPointerMode = () => {
      setIsEnabled(pointerQuery.matches);
    };

    syncPointerMode();
    pointerQuery.addEventListener("change", syncPointerMode);

    return () => {
      pointerQuery.removeEventListener("change", syncPointerMode);
    };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor || !isEnabled) {
      document.documentElement.removeAttribute("data-custom-cursor");
      return undefined;
    }

    document.documentElement.dataset.customCursor = "active";

    const applyState = (nextState: CursorState) => {
      if (stateRef.current === nextState) {
        return;
      }

      stateRef.current = nextState;
      cursor.dataset.state = nextState;
    };

    const moveTo = (event: PointerEvent) => {
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        applyState("hidden");
        return;
      }

      moveTo(event);
      applyState(resolveCursorState(event.target));
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        applyState("hidden");
        return;
      }

      moveTo(event);
      applyState(resolveCursorState(event.target));
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        applyState("hidden");
      }
    };

    const handleBlur = () => {
      applyState("hidden");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    window.addEventListener("blur", handleBlur);

    return () => {
      document.documentElement.removeAttribute("data-custom-cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isEnabled]);

  return (
    <div aria-hidden="true" className={styles.root} data-enabled={isEnabled ? "true" : "false"}>
      <div className={styles.cursor} data-state="hidden" ref={cursorRef}>
        <span className={styles.halo} />
        <span className={`${styles.cursorImage} ${styles.defaultCursor}`} />
        <span className={`${styles.cursorImage} ${styles.textCursor}`} />
        <span className={`${styles.cursorImage} ${styles.interactiveCursor}`} />
      </div>
    </div>
  );
}
