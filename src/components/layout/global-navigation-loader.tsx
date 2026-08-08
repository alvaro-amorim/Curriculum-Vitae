"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import styles from "./global-navigation-loader.module.css";

type LoaderMode = "initial" | "route";

type LoaderState = {
  active: boolean;
  mode: LoaderMode;
  label: string;
};

const INITIAL_MIN_MS = 520;
const ROUTE_MIN_MS = 360;
const ROUTE_FAILSAFE_MS = 12000;

function routeLabel(pathname: string, locale: "pt" | "en") {
  const labels: Record<string, { pt: string; en: string }> = {
    "/": { pt: "Abrindo Home", en: "Opening Home" },
    "/projetos": { pt: "Abrindo Projetos", en: "Opening Projects" },
    "/lab": { pt: "Abrindo Lab", en: "Opening Lab" },
    "/curriculo": { pt: "Abrindo Currículo", en: "Opening Resume" },
  };

  if (pathname.startsWith("/projetos/")) {
    return locale === "pt" ? "Abrindo estudo de caso" : "Opening case study";
  }

  return labels[pathname]?.[locale] ?? (locale === "pt" ? "Carregando página" : "Loading page");
}

function getLocale(): "pt" | "en" {
  if (typeof document === "undefined") {
    return "pt";
  }

  return document.documentElement.dataset.locale === "en" ? "en" : "pt";
}

export function GlobalNavigationLoader() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const [loader, setLoader] = useState<LoaderState>({
    active: !isAdminRoute,
    mode: "initial",
    label: "Inicializando portfólio",
  });
  const initialStartedAtRef = useRef(0);
  const routeStartedAtRef = useRef(0);
  const pendingPathRef = useRef<string | null>(null);
  const releaseTimerRef = useRef<number | null>(null);
  const failsafeTimerRef = useRef<number | null>(null);
  const previousPathRef = useRef(pathname);
  const locale = getLocale();

  useEffect(() => {
    if (isAdminRoute) {
      return undefined;
    }

    initialStartedAtRef.current = performance.now();
    let cancelled = false;

    const releaseInitialLoader = async () => {
      try {
        await document.fonts?.ready;
      } catch {
        // Font readiness should never block the page loader indefinitely.
      }

      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

      const elapsed = performance.now() - initialStartedAtRef.current;
      const remaining = Math.max(0, INITIAL_MIN_MS - elapsed);

      window.setTimeout(() => {
        if (!cancelled && pendingPathRef.current === null) {
          setLoader((current) => ({ ...current, active: false }));
        }
      }, remaining);
    };

    void releaseInitialLoader();

    return () => {
      cancelled = true;
    };
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) {
      return undefined;
    }

    const clearTimers = () => {
      if (releaseTimerRef.current !== null) {
        window.clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = null;
      }

      if (failsafeTimerRef.current !== null) {
        window.clearTimeout(failsafeTimerRef.current);
        failsafeTimerRef.current = null;
      }
    };

    const beginRouteLoading = (targetPath: string | null) => {
      clearTimers();
      routeStartedAtRef.current = performance.now();
      pendingPathRef.current = targetPath;
      const nextLocale = getLocale();
      const destination = targetPath ?? window.location.pathname;

      setLoader({
        active: true,
        mode: "route",
        label: routeLabel(destination, nextLocale),
      });

      failsafeTimerRef.current = window.setTimeout(() => {
        pendingPathRef.current = null;
        setLoader((current) => ({ ...current, active: false }));
      }, ROUTE_FAILSAFE_MS);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);

      if (url.origin !== window.location.origin || url.pathname.startsWith("/admin")) {
        return;
      }

      const currentPath = `${window.location.pathname}${window.location.search}`;
      const nextPath = `${url.pathname}${url.search}`;

      if (nextPath === currentPath) {
        return;
      }

      beginRouteLoading(url.pathname);
    };

    const handlePopState = () => {
      beginRouteLoading(null);
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearTimers();
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) {
      previousPathRef.current = pathname;
      return;
    }

    const pathChanged = previousPathRef.current !== pathname;
    previousPathRef.current = pathname;

    if (!pathChanged || loader.mode !== "route" || !loader.active) {
      return;
    }

    const pendingPath = pendingPathRef.current;

    if (pendingPath !== null && pendingPath !== pathname) {
      return;
    }

    if (failsafeTimerRef.current !== null) {
      window.clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }

    const elapsed = performance.now() - routeStartedAtRef.current;
    const remaining = Math.max(0, ROUTE_MIN_MS - elapsed);

    // Pathname changes only after the App Router has accepted the new route.
    // Two frames let the destination paint before the loader fades out.
    releaseTimerRef.current = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          pendingPathRef.current = null;
          setLoader((current) => ({ ...current, active: false }));
          releaseTimerRef.current = null;
        });
      });
    }, remaining);
  }, [isAdminRoute, loader.active, loader.mode, pathname]);

  if (isAdminRoute) {
    return null;
  }

  const statusText = loader.mode === "initial"
    ? (locale === "pt" ? "Preparando experiência" : "Preparing experience")
    : (locale === "pt" ? "Sincronizando rota" : "Synchronizing route");

  return (
    <div
      aria-hidden={loader.active ? undefined : true}
      aria-live="polite"
      className={styles.loader}
      data-active={loader.active ? "true" : "false"}
      data-mode={loader.mode}
      role={loader.active ? "status" : undefined}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.mark} aria-hidden="true">A</div>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>Portfolio OS</span>
            <p className={styles.title}>{loader.label}</p>
          </div>
        </div>
        <div className={styles.rail} aria-hidden="true" />
        <div className={styles.meta}>
          <span className={styles.dot}>{statusText}</span>
          <span>{loader.mode === "initial" ? "BOOT" : "ROUTE"}</span>
        </div>
      </div>
    </div>
  );
}
