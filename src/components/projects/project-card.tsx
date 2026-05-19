"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePortfolioUi } from "@/components/layout/app-shell";
import type { Project } from "@/types/portfolio";

type ProjectCardProps = {
  project: Project;
  compact?: boolean;
};

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const { locale, t } = usePortfolioUi();

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{project.subtitle[locale]}</p>
            <h3 className="mt-2 text-xl font-semibold">{project.title[locale]}</h3>
          </div>
          <Badge>{project.status[locale]}</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{project.shortDescription[locale]}</p>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="flex flex-wrap gap-2">
          {project.category.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
        {!compact ? (
          <div className="flex flex-wrap gap-2">
            {project.stack.slice(0, 5).map((tech) => (
              <span className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--muted)]" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Link className={buttonClassName("primary", "sm")} href={`/projetos/${project.slug}`}>
            {t.projectsPage.viewCase}
          </Link>
          <a className={buttonClassName("ghost", "sm")} href={project.links.website} rel="noreferrer" target="_blank">
            {t.actions.open}
          </a>
        </div>
      </div>
    </Card>
  );
}
