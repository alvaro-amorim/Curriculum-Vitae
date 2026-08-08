"use client";

import { useEffect, useRef, useState } from "react";

type SmartScrollVisibilityOptions = {
  disabled?: boolean;
  hideAfter?: number;
  directionThreshold?: number;
  idleDelay?: number;
  resetKey?: string;
};

type SmartScrollVisibilityState = {
  isVisible: boolean;
  isScrolled: boolean;
};

export function getScrollPosition() {
  if (typeof window === "undefined") {
    return 0;
  }

  return Math.max(
    0,
    window.scrollY
      || window.pageYOffset
      || document.documentElement.scrollTop
      || document.body.scrollTop
      || 0,
  );
}

export function useSmartScrollVisibility({
  disabled = false,
  hideAfter = 96,
  directionThreshold = 12,
  idleDelay = 2800,
  resetKey,
}: SmartScrollVisibilityOptions = {}): SmartScrollVisibilityState {
  const [state, setState] = useState<SmartScrollVisibilityState>({
    isVisible: true,
    isScrolled: false,
  });
  const isVisibleRef = useRef(true);
  const isScrolledRef = useRef(false);
  const lastScrollPositionRef = useRef(0);
  const accumulatedDeltaRef = useRef(0);
  const animationFrameRef = useRef(0);
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updateState = (isVisible: boolean, isScrolled: boolean) => {
      if (isVisibleRef.current === isVisible && isScrolledRef.current === isScrolled) {
        return;
      }

      isVisibleRef.current = isVisible;
      isScrolledRef.current = isScrolled;
      setState({ isVisible, isScrolled });
    };

    const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const scheduleIdleHide = () => {
      clearIdleTimer();

      if (getScrollPosition() <= hideAfter) {
        return;
      }

      idleTimerRef.current = window.setTimeout(() => {
        const currentScrollPosition = getScrollPosition();

        if (currentScrollPosition > hideAfter) {
          updateState(false, currentScrollPosition > 12);
        }

        idleTimerRef.current = null;
      }, idleDelay);
    };

    const initialScrollPosition = getScrollPosition();
    lastScrollPositionRef.current = initialScrollPosition;
    accumulatedDeltaRef.current = 0;
    updateState(true, initialScrollPosition > 12);

    if (disabled) {
      clearIdleTimer();
      return undefined;
    }

    if (initialScrollPosition > hideAfter) {
      scheduleIdleHide();
    }

    const evaluateScroll = () => {
      animationFrameRef.current = 0;
      const currentScrollPosition = getScrollPosition();
      const scrollDelta = currentScrollPosition - lastScrollPositionRef.current;
      lastScrollPositionRef.current = currentScrollPosition;
      const isScrolled = currentScrollPosition > 12;

      if (currentScrollPosition <= hideAfter) {
        accumulatedDeltaRef.current = 0;
        clearIdleTimer();
        updateState(true, isScrolled);
        return;
      }

      scheduleIdleHide();

      if (Math.abs(scrollDelta) < 1) {
        updateState(isVisibleRef.current, isScrolled);
        return;
      }

      if (
        accumulatedDeltaRef.current === 0
        || Math.sign(accumulatedDeltaRef.current) === Math.sign(scrollDelta)
      ) {
        accumulatedDeltaRef.current += scrollDelta;
      } else {
        accumulatedDeltaRef.current = scrollDelta;
      }

      if (accumulatedDeltaRef.current >= directionThreshold) {
        accumulatedDeltaRef.current = 0;
        updateState(false, isScrolled);
      } else if (accumulatedDeltaRef.current <= -directionThreshold) {
        accumulatedDeltaRef.current = 0;
        updateState(true, isScrolled);
      } else {
        updateState(isVisibleRef.current, isScrolled);
      }
    };

    const handleScroll = () => {
      if (animationFrameRef.current) {
        return;
      }

      if (typeof window.requestAnimationFrame === "function") {
        animationFrameRef.current = window.requestAnimationFrame(evaluateScroll);
      } else {
        evaluateScroll();
      }
    };

    const handleActivity = () => {
      if (getScrollPosition() > hideAfter && isVisibleRef.current) {
        scheduleIdleHide();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handleActivity, { passive: true });
    window.addEventListener("touchmove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);

    return () => {
      clearIdleTimer();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handleActivity);
      window.removeEventListener("touchmove", handleActivity);
      window.removeEventListener("keydown", handleActivity);

      if (animationFrameRef.current && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = 0;
    };
  }, [directionThreshold, disabled, hideAfter, idleDelay, resetKey]);

  return state;
}
