"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { dictionary, type Dictionary } from "@/content/translations";
import { STORAGE_KEYS } from "@/lib/constants";
import type { Locale, ThemeName } from "@/types/portfolio";

import { Topbar } from "./topbar";

type PortfolioUiContextValue = {
  locale: Locale;
  theme: ThemeName;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  toggleTheme: () => void;
};

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
  const [theme, setTheme] = useState<ThemeName>(() => resolveInitialTheme());
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    const storedLocale = resolveInitialLocale();

    if (storedLocale !== "pt") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Applied after hydration to avoid server/client text mismatch.
      setLocaleState(storedLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en-US";
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    window.localStorage.setItem(STORAGE_KEYS.locale, nextLocale);
    setLocaleState(nextLocale);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
      return nextTheme;
    });
  }, []);

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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Topbar />
        {children}
      </div>
    </PortfolioUiContext.Provider>
  );
}
