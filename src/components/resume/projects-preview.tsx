"use client";

import Link from "next/link";

import { projects, projectLinks } from "@/content/projects";
import { profileLinks } from "@/content/profile";
import { buttonClassName } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ProjectsPreviewProps = {
  showLinks?: boolean;
  featuredOnly?: boolean;
  limit?: number;
};

export function ProjectsPreview({ showLinks = true, featuredOnly = false, limit }: ProjectsPreviewProps) {
  const { locale, t } = usePortfolioUi();
  const visibleProjects = projects
    .filter((project) => !featuredOnly || project.featured)
    .slice(0, limit ?? projects.length);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t.resume.projects}</h2>
        <Link className={buttonClassName("ghost", "sm")} href="/projetos">
          {t.actions.viewProjects}
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <article className="flex min-h-48 flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4" key={project.slug}>
            <div>
              <h3 className="font-semibold">{project.title[locale]}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{project.subtitle[locale]}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{project.shortDescription[locale]}</p>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {project.stack.slice(0, 5).map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className={buttonClassName("primary", "sm")} href={`/projetos/${project.slug}`}>
                  {t.projectsPage.viewCase}
                </Link>
                <a className={buttonClassName("secondary", "sm")} href={project.links.website} rel="noreferrer" target="_blank">
                  {t.actions.open}
                </a>
                {project.links.repository ? (
                  <a className={buttonClassName("ghost", "sm")} href={project.links.repository} rel="noreferrer" target="_blank">
                    {t.caseStudy.viewRepository}
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {showLinks ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">{t.resume.links}</h3>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
            {[...profileLinks, ...projectLinks].map((link) => (
              <li className="flex flex-wrap gap-2" key={link.href}>
                <span className="text-[var(--text)]">{link.label[locale]}:</span>
                <a className="break-all underline-offset-4 hover:text-[var(--text)] hover:underline" href={link.href} rel="noreferrer" target="_blank">
                  {link.display}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
