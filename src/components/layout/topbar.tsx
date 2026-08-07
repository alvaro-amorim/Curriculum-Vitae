"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { profile } from "@/content/profile";
import { useSmartScrollVisibility } from "@/hooks/use-smart-scroll-visibility";

import { usePortfolioUi } from "./app-shell";
import styles from "./topbar.module.css";

type TopbarProps = {
  onNavigateStart?: () => void;
};

const navItems = {
  pt: [
    { href: "/", label: "Home" },
    { href: "/projetos", label: "Projetos" },
    { href: "/lab", label: "Lab" },
    { href: "/curriculo", label: "Currículo" },
    { href: "/#sobre", label: "Sobre" },
  ],
  en: [
    { href: "/", label: "Home" },
    { href: "/projetos", label: "Projects" },
    { href: "/lab", label: "Lab" },
    { href: "/curriculo", label: "Resume" },
    { href: "/#sobre", label: "About" },
  ],
} as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Icon({ name, className }: { name: "globe" | "menu" | "moon" | "sun" | "x"; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", focusable: false, "aria-hidden": true };

  switch (name) {
    case "globe":
      return <svg {...common}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-8-9h16M12 3c2.3 2.4 3.4 5.4 3.4 9S14.3 18.6 12 21c-2.3-2.4-3.4-5.4-3.4-9S9.7 5.4 12 3Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "menu":
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case "moon":
      return <svg {...common}><path d="M20 15.5A8.2 8.2 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "sun":
      return <svg {...common}><path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m14.2 14.2-1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "x":
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  }
}

function Monogram() {
  return (
    <span className={styles.monogram} aria-hidden="true">
      <span />
      <i>
        <svg viewBox="0 0 24 24" focusable="false">
          <defs>
            <linearGradient id="topbarMono" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--brand)" />
              <stop offset="1" stopColor="var(--brand-2)" />
            </linearGradient>
          </defs>
          <path d="M4 20 12 4l8 16h-3.2L12 10.2 7.2 20H4Z" fill="url(#topbarMono)" />
          <rect x="9" y="15" width="6" height="1.6" rx="0.8" fill="url(#topbarMono)" />
        </svg>
      </i>
    </span>
  );
}

export function Topbar({ onNavigateStart }: TopbarProps) {
  const { locale, t, theme, toggleLocale, toggleTheme } = usePortfolioUi();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [keyboardFocusInside, setKeyboardFocusInside] = useState(false);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const keyboardInteractionRef = useRef(false);
  const items = navItems[locale];
  const brandLabel = `${profile.shortName} — ${profile.role[locale]}`;
  const { isVisible, isScrolled } = useSmartScrollVisibility({
    disabled: open || keyboardFocusInside,
    hideAfter: 96,
    directionThreshold: 12,
    resetKey: pathname,
  });

  useEffect(() => {
    function handleKeyboardNavigation(event: KeyboardEvent) {
      if (event.key === "Tab") {
        keyboardInteractionRef.current = true;
      }
    }

    function handlePointerInteraction() {
      keyboardInteractionRef.current = false;
      setKeyboardFocusInside(false);
    }

    document.addEventListener("keydown", handleKeyboardNavigation, true);
    document.addEventListener("pointerdown", handlePointerInteraction, true);

    return () => {
      document.removeEventListener("keydown", handleKeyboardNavigation, true);
      document.removeEventListener("pointerdown", handlePointerInteraction, true);
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOpen(false);
      setKeyboardFocusInside(false);
      keyboardInteractionRef.current = false;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target instanceof Node ? event.target : null;
      if (target && topbarRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth > 1024) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    const activeHref = pathname === "/" ? "/" : items.find((item) => isActiveRoute(pathname, item.href))?.href ?? "/";
    const activeElement = list.querySelector<HTMLElement>(`a[data-href="${activeHref}"]`);
    if (!activeElement) return;

    const rect = activeElement.getBoundingClientRect();
    const parentRect = list.getBoundingClientRect();
    indicator.style.width = `${Math.max(16, rect.width - 24)}px`;
    indicator.style.transform = `translateX(${rect.left - parentRect.left + 12}px)`;
    indicator.style.opacity = "1";
  }, [isScrolled, items, pathname]);

  return (
    <header
      className={styles.topbar}
      data-hidden={isVisible ? "false" : "true"}
      data-menu-open={open ? "true" : "false"}
      data-scrolled={isScrolled ? "true" : "false"}
      data-topbar="global"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setKeyboardFocusInside(false);
        }
      }}
      onFocusCapture={() => {
        if (keyboardInteractionRef.current) {
          setKeyboardFocusInside(true);
        }
      }}
      ref={topbarRef}
    >
      <nav className={styles.navShell} aria-label={t.nav.mainNavigation}>
        <Link
          aria-label={brandLabel}
          className={styles.brand}
          href="/"
          onClick={() => {
            setOpen(false);
            if (pathname !== "/") onNavigateStart?.();
          }}
          title={brandLabel}
        >
          <Monogram />
          <span>
            <strong>Álvaro.dev</strong>
            <small>{profile.role[locale]}</small>
          </span>
        </Link>

        <ul className={styles.navList} ref={listRef}>
          <span aria-hidden="true" className={styles.activeIndicator} ref={indicatorRef} />
          {items.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={active ? styles.activeLink : undefined}
                  data-href={item.href}
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                    if (!active) onNavigateStart?.();
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.controls}>
          <button
            aria-label={t.nav.theme}
            className={styles.themeToggle}
            data-theme-control="toggle"
            data-theme-state={theme}
            onClick={toggleTheme}
            type="button"
          >
            <Icon name="sun" />
            <span />
            <Icon name="moon" />
          </button>
          <button
            aria-label={locale === "pt" ? "Alternar idioma" : "Switch language"}
            className={styles.locale}
            data-locale-control={locale}
            onClick={toggleLocale}
            type="button"
          >
            <Icon name="globe" />
            <span>{locale === "pt" ? "PT" : "EN"}</span>
            <i>⌄</i>
          </button>
          <button
            aria-expanded={open}
            aria-label={open ? (locale === "pt" ? "Fechar menu" : "Close menu") : "Menu"}
            className={styles.menuButton}
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </nav>

      <div className={styles.mobilePanel} data-open={open ? "true" : "false"}>
        {items.map((item, index) => (
          <Link
            className={isActiveRoute(pathname, item.href) ? styles.mobileActive : undefined}
            href={item.href}
            key={item.href}
            onClick={() => {
              setOpen(false);
              if (!isActiveRoute(pathname, item.href)) onNavigateStart?.();
            }}
            style={{ "--item": index } as CSSProperties}
          >
            {item.label}
          </Link>
        ))}
        <div>
          <button onClick={toggleLocale} type="button">
            <Icon name="globe" />
            {locale === "pt" ? "PT" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}
