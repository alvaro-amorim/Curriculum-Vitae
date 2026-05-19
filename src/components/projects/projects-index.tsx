"use client";

import Link from "next/link";

import { projects } from "@/content/projects";
import { buttonClassName } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";

import { ProjectGrid } from "./project-grid";

export function ProjectsIndex() {
  const { t } = usePortfolioUi();

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:py-12">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{t.home.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold md:text-6xl">{t.projectsPage.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)]">{t.projectsPage.description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className={buttonClassName("secondary")} href="/">
            {t.projectsPage.backHome}
          </Link>
          <Link className={buttonClassName("ghost")} href="/curriculo">
            {t.projectsPage.openResume}
          </Link>
        </div>
      </section>

      <ProjectGrid projects={projects} />
    </main>
  );
}
