"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { downloads } from "@/content/downloads";
import { profile } from "@/content/profile";

import { usePortfolioUi } from "./app-shell";
import styles from "./topbar.module.css";

type TopbarProps = {
  onNavigateStart?: () => void;
};

const TOP_LOCK_THRESHOLD = 18;
const HIDE_AFTER_SCROLL = 136;
const SCROLL_DELTA = 8;
const MOUSE_TOP_ZONE = 32;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isPageScrollElement(target: EventTarget | null): target is Element {
  if (!(target instanceof Element)) {
    return false;
  }

  const style = window.getComputedStyle(target);

  if (!/(auto|scroll|overlay)/.test(style.overflowY)) {
    return false;
  }

  if (target.scrollHeight <= target.clientHeight + 4) {
    return false;
  }

  if (target.tagName === "MAIN") {
    return true;
  }

  const rect = target.getBoundingClientRect();
  return rect.top <= 1 && rect.bottom >= window.innerHeight * 0.72;
}

function getScrollPosition(target?: EventTarget | null) {
  const scrollTarget = target ?? null;

  if (isPageScrollElement(scrollTarget)) {
    return scrollTarget.scrollTop;
  }

  return document.scrollingElement?.scrollTop ?? window.scrollY;
}

export function Topbar({ onNavigateStart }: TopbarProps) {
  const { locale, t, toggleLocale, toggleTheme } = usePortfolioUi();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const activeDownload = downloads[locale].pdf;
  const navItems = [
    { href: "/", label: t.nav.home, shortLabel: "Home" },
    { href: "/projetos", label: t.nav.projects, shortLabel: locale === "pt" ? "Projetos" : "Projects" },
    { href: "/lab", label: t.nav.lab, shortLabel: "Lab" },
    { href: "/curriculo", label: t.nav.resume, shortLabel: "CV" },
  ];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      lastScrollYRef.current = getScrollPosition();
      setIsVisible(true);
      setIsAtTop(lastScrollYRef.current <= TOP_LOCK_THRESHOLD);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    function handleScroll(event?: Event) {
      if (tickingRef.current) {
        return;
      }

      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = getScrollPosition(event?.target);
        const previousScrollY = lastScrollYRef.current;
        const delta = currentScrollY - previousScrollY;
        const atTop = currentScrollY <= TOP_LOCK_THRESHOLD;

        setIsAtTop(atTop);

        if (atTop) {
          setIsVisible(true);
        } else if (Math.abs(delta) >= SCROLL_DELTA) {
          setIsVisible(delta < 0 || currentScrollY < HIDE_AFTER_SCROLL);
        }

        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
      });
    }

    function handleMouseMove(event: MouseEvent) {
      if (event.clientY > MOUSE_TOP_ZONE) {
        return;
      }

      if (window.matchMedia("(pointer: fine)").matches) {
        setIsVisible(true);
      }
    }

    const initialFrame = window.requestAnimationFrame(() => {
      lastScrollYRef.current = getScrollPosition();
      setIsAtTop(lastScrollYRef.current <= TOP_LOCK_THRESHOLD);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <header
      className={styles.topbar}
      data-at-top={isAtTop ? "true" : "false"}
      data-state={isVisible ? "visible" : "hidden"}
      data-topbar="global"
      data-visible={isVisible ? "true" : "false"}
      onFocusCapture={() => setIsVisible(true)}
      onMouseEnter={() => setIsVisible(true)}
    >
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" onClick={() => (pathname === "/" ? undefined : onNavigateStart?.())}>
          <span className={styles.brandTitle}>Álvaro.dev Portfolio OS</span>
          <span className={styles.brandSubtitle}>
            {profile.shortName} · {t.home.subtitle}
          </span>
        </Link>

        <nav className={styles.nav} aria-label={t.nav.mainNavigation}>
          {navItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`${styles.navLink} ${active ? styles.active : ""}`}
                href={item.href}
                key={item.href}
                onClick={() => (active ? undefined : onNavigateStart?.())}
              >
                <span aria-hidden="true" className={styles.navSignal} />
                <span className={styles.navFull}>{item.label}</span>
                <span className={styles.navShort}>{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.utilities}>
          <a className={`${styles.control} ${styles.download}`} href={activeDownload.href} download={activeDownload.fileName}>
            <span className={styles.fullLabel}>{t.actions.downloadPdf}</span>
            <span className={styles.shortLabel}>PDF</span>
          </a>
          <button aria-label={t.nav.theme} className={styles.control} data-theme-control="toggle" onClick={toggleTheme} type="button">
            <span className={styles.fullLabel}>{t.nav.theme}</span>
            <span className={styles.shortLabel}>T</span>
          </button>
          <button
            aria-label={locale === "pt" ? "Alternar idioma" : "Switch language"}
            className={`${styles.control} ${styles.locale}`}
            data-locale-control={locale}
            onClick={toggleLocale}
            type="button"
          >
            {locale === "pt" ? "EN" : "PT"}
          </button>
        </div>
      </div>
    </header>
  );
}
