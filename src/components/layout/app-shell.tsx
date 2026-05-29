"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { dictionary, type Dictionary } from "@/content/translations";
import { STORAGE_KEYS } from "@/lib/constants";
import type { Locale, ThemeName } from "@/types/portfolio";
import { CommandPalette } from "@/components/lab/command-palette";

import { Topbar } from "./topbar";
import styles from "./app-shell.module.css";

type PortfolioUiContextValue = {
  locale: Locale;
  theme: ThemeName;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  toggleTheme: () => void;
};

type TransitionKind = "idle" | "route" | "theme" | "locale";

const PortfolioUiContext = createContext<PortfolioUiContextValue | null>(null);

export function usePortfolioUi() {
  const context = useContext(PortfolioUiContext);

  if (!context) {
    throw new Error("usePortfolioUi must be used inside AppShell");
  }

  return context;
}

function resolveInitialTheme(): ThemeName {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "pt";
  }

  const stored = window.localStorage.getItem(STORAGE_KEYS.locale);
  return stored === "en" ? "en" : "pt";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeName>(() => resolveInitialTheme());
  const [locale, setLocaleState] = useState<Locale>("pt");
  const [transitionKind, setTransitionKind] = useState<TransitionKind>("idle");
  const firstRoute = useRef(true);
  const transitionTimer = useRef<number | null>(null);

  const triggerTransition = useCallback((kind: Exclude<TransitionKind, "idle">) => {
    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current);
    }

    setTransitionKind(kind);
    transitionTimer.current = window.setTimeout(() => {
      setTransitionKind("idle");
      transitionTimer.current = null;
    }, kind === "route" ? 520 : 680);
  }, []);

  useEffect(() => {
    const storedLocale = resolveInitialLocale();

    if (storedLocale !== "pt") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Applied after hydration to avoid server/client text mismatch.
      setLocaleState(storedLocale);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }

    triggerTransition("route");
  }, [pathname, triggerTransition]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useLayoutEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en-US";
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    triggerTransition("locale");
    window.localStorage.setItem(STORAGE_KEYS.locale, nextLocale);
    setLocaleState(nextLocale);
  }, [triggerTransition]);

  const toggleTheme = useCallback(() => {
    triggerTransition("theme");
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
      return nextTheme;
    });
  }, [triggerTransition]);

  const value = useMemo<PortfolioUiContextValue>(
    () => ({
      locale,
      theme,
      t: dictionary[locale],
      setLocale,
      toggleLocale: () => setLocale(locale === "pt" ? "en" : "pt"),
      toggleTheme,
    }),
    [locale, setLocale, theme, toggleTheme],
  );

  return (
    <PortfolioUiContext.Provider value={value}>
      <div className={styles.appShell} data-transition-kind={transitionKind}>
        <Topbar onNavigateStart={() => triggerTransition("route")} />
        <CommandPalette />
        <div
          className={styles.pageFrame}
          data-route={pathname === "/" || pathname === "/visual-final-candidate" ? "immersive" : "standard"}
          key={pathname}
        >
          {children}
        </div>
        <div aria-hidden="true" className={styles.transitionVeil} data-active={transitionKind !== "idle"} data-kind={transitionKind} />
      </div>
    </PortfolioUiContext.Provider>
  );
}
