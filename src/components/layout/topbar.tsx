"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { downloads } from "@/content/downloads";
import { profile } from "@/content/profile";

import { usePortfolioUi } from "./app-shell";
import styles from "./topbar.module.css";

type TopbarProps = {
  onNavigateStart?: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Topbar({ onNavigateStart }: TopbarProps) {
  const { locale, t, toggleLocale, toggleTheme } = usePortfolioUi();
  const pathname = usePathname();
  const activeDownload = downloads[locale].pdf;
  const navItems = [
    { href: "/", label: t.nav.home, shortLabel: "Home" },
    { href: "/projetos", label: t.nav.projects, shortLabel: locale === "pt" ? "Projetos" : "Projects" },
    { href: "/lab", label: t.nav.lab, shortLabel: "Lab" },
    { href: "/curriculo", label: t.nav.resume, shortLabel: "CV" },
  ];

  return (
    <header className={styles.topbar} data-topbar="global">
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
