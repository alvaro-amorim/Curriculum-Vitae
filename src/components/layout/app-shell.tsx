"use client";

import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { dictionary, type Dictionary } from "@/content/translations";
import { STORAGE_KEYS } from "@/lib/constants";
import type { Locale, ThemeName } from "@/types/portfolio";
import { CommandPalette } from "@/components/lab/command-palette";

import { CustomCursor } from "./custom-cursor";
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

function formatRouteLabel(pathname: string, locale: Locale) {
  const routeNames: Record<string, { pt: string; en: string }> = {
    "/": { pt: "home", en: "home" },
    "/projetos": { pt: "projetos", en: "projects" },
    "/lab": { pt: "lab", en: "lab" },
    "/curriculo": { pt: "currículo", en: "resume" },
    "/visual-final-candidate": { pt: "visual", en: "visual" },
  };
  const route = routeNames[pathname] ?? (pathname.startsWith("/projetos/") ? { pt: "case", en: "case" } : { pt: "rota", en: "route" });

  return locale === "pt" ? `abrindo ${route.pt}` : `opening ${route.en}`;
}

function formatThemeLabel(nextTheme: ThemeName, locale: Locale) {
  if (locale === "pt") {
    return nextTheme === "light" ? "calibrando modo claro" : "calibrando modo escuro";
  }

  return nextTheme === "light" ? "calibrating light mode" : "calibrating dark mode";
}

function formatLocaleLabel(currentLocale: Locale, nextLocale: Locale) {
  return `${currentLocale.toUpperCase()} -> ${nextLocale.toUpperCase()}`;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeName>(() => resolveInitialTheme());
  const [locale, setLocaleState] = useState<Locale>("pt");
  const [transitionKind, setTransitionKind] = useState<TransitionKind>("idle");
  const [transitionLabel, setTransitionLabel] = useState("");
  const [transitionSequence, setTransitionSequence] = useState(0);
  const firstRoute = useRef(true);
  const localeRef = useRef<Locale>("pt");
  const transitionTimer = useRef<number | null>(null);

  const triggerTransition = useCallback((kind: Exclude<TransitionKind, "idle">, label = "") => {
    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current);
    }

    setTransitionSequence((current) => current + 1);
    setTransitionLabel(label);
    setTransitionKind(kind);
    transitionTimer.current = window.setTimeout(() => {
      setTransitionKind("idle");
      setTransitionLabel("");
      transitionTimer.current = null;
    }, kind === "route" ? 780 : kind === "theme" ? 860 : 740);
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
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }

    triggerTransition("route", formatRouteLabel(pathname, localeRef.current));
  }, [pathname, triggerTransition]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useLayoutEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en-US";
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    triggerTransition("locale", formatLocaleLabel(locale, nextLocale));
    window.localStorage.setItem(STORAGE_KEYS.locale, nextLocale);
    setLocaleState(nextLocale);
  }, [locale, triggerTransition]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      triggerTransition("theme", formatThemeLabel(nextTheme, locale));
      window.localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
      return nextTheme;
    });
  }, [locale, triggerTransition]);

  const handleShellClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);

      if (url.origin !== window.location.origin) {
        return;
      }

      const currentPath = `${window.location.pathname}${window.location.search}`;
      const nextPath = `${url.pathname}${url.search}`;

      if (nextPath === currentPath) {
        return;
      }

      triggerTransition("route", formatRouteLabel(url.pathname, locale));
    },
    [locale, triggerTransition],
  );

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
      <div
        className={styles.appShell}
        data-locale={locale}
        data-transition-label={transitionLabel}
        data-transition-kind={transitionKind}
        data-transitioning={transitionKind !== "idle" ? "true" : "false"}
        onClickCapture={handleShellClick}
      >
        <Topbar />
        <CommandPalette />
        <CustomCursor />
        <div
          className={styles.pageFrame}
          data-route={pathname === "/" || pathname === "/visual-final-candidate" ? "immersive" : "standard"}
          key={pathname}
        >
          {children}
        </div>
        <div
          aria-hidden="true"
          className={styles.transitionVeil}
          data-active={transitionKind !== "idle"}
          data-kind={transitionKind}
          key={`veil-${transitionKind}-${transitionSequence}`}
        />
        <div
          aria-hidden="true"
          className={styles.themeSweep}
          data-active={transitionKind === "theme"}
          key={`theme-sweep-${transitionKind}-${transitionSequence}`}
        />
        <div
          aria-hidden="true"
          className={styles.localeScan}
          data-active={transitionKind === "locale"}
          key={`locale-scan-${transitionKind}-${transitionSequence}`}
        />
        <div
          aria-hidden="true"
          className={styles.transitionStatus}
          data-active={transitionKind !== "idle"}
          data-kind={transitionKind}
          key={`status-${transitionKind}-${transitionSequence}`}
        >
          <span>{transitionLabel}</span>
          <i />
        </div>
        <div
          aria-hidden="true"
          className={styles.motionRail}
          data-active={transitionKind !== "idle"}
          data-kind={transitionKind}
          key={`rail-${transitionKind}-${transitionSequence}`}
        />
      </div>
    </PortfolioUiContext.Provider>
  );
}
