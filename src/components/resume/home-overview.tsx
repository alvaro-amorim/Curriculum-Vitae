"use client";

import Link from "next/link";

import { profile } from "@/content/profile";
import { buttonClassName } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function HomeOverview() {
  const { locale, t } = usePortfolioUi();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:py-12">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="interactive-surface flex min-h-[520px] flex-col justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] md:p-10">
          <Badge className="mb-5 w-fit">{t.home.currentPhase}</Badge>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{t.home.eyebrow}</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-normal text-[var(--text)] md:text-7xl">{t.home.title}</h1>
          <p className="mt-3 text-xl text-[var(--muted)]">{t.home.subtitle}</p>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--muted)]">{t.home.intro}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className={buttonClassName("primary")} href="/curriculo">
              {t.actions.viewResume}
            </Link>
            <Link className={buttonClassName("secondary")} href="/projetos">
              {t.actions.viewProjects}
            </Link>
            <a className={buttonClassName("secondary")} href={profile.github} rel="noreferrer" target="_blank">
              {t.actions.viewGithub}
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="interactive-surface">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">{t.home.statusTitle}</span>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t.home.statusDescription}</p>
          </Card>
          <Card className="interactive-surface">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">{t.home.architectureTitle}</span>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t.home.architectureDescription}</p>
          </Card>
          <Card className="interactive-surface">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">{t.resume.highlights}</span>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.highlights.map((highlight) => (
                <Badge key={highlight}>{highlight}</Badge>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              {profile.role[locale]} • {profile.positioning[locale]}
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
