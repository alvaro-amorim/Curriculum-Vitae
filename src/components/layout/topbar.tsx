"use client";

import Link from "next/link";

import { downloads } from "@/content/downloads";
import { profile } from "@/content/profile";
import { buttonClassName, Button } from "@/components/ui/button";

import { usePortfolioUi } from "./app-shell";

export function Topbar() {
  const { locale, t, toggleLocale, toggleTheme } = usePortfolioUi();
  const activeDownload = downloads[locale].pdf;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link className="min-w-0" href="/">
          <span className="block text-sm font-semibold text-[var(--text)]">{t.home.eyebrow}</span>
          <span className="block truncate text-xs text-[var(--muted)]">{profile.shortName} • {t.home.subtitle}</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2" aria-label={t.nav.mainNavigation}>
          <Link className={buttonClassName("ghost", "sm")} href="/">
            {t.nav.home}
          </Link>
          <Link className={buttonClassName("secondary", "sm")} href="/curriculo">
            {t.nav.resume}
          </Link>
          <a className={buttonClassName("primary", "sm")} href={activeDownload.href} download={activeDownload.fileName}>
            {t.actions.downloadPdf}
          </a>
          <Button aria-label={t.nav.theme} onClick={toggleTheme} size="sm" variant="secondary">
            {t.nav.theme}
          </Button>
          <Button aria-label="Alternar idioma" onClick={toggleLocale} size="sm" variant="secondary">
            {locale === "pt" ? "EN" : "PT"}
          </Button>
        </nav>
      </div>
    </header>
  );
}
