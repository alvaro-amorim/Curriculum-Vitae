"use client";

import { projects, projectLinks } from "@/content/projects";
import { profileLinks } from "@/content/profile";
import { buttonClassName } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ProjectsPreviewProps = {
  showLinks?: boolean;
};

export function ProjectsPreview({ showLinks = true }: ProjectsPreviewProps) {
  const { locale, t } = usePortfolioUi();

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t.resume.projects}</h2>
        <span className="text-sm text-[var(--muted)]">{projects.length} {t.resume.projectCountLabel}</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article className="flex min-h-48 flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4" key={project.slug}>
            <div>
              <h3 className="font-semibold">{project.title[locale]}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{project.description[locale]}</p>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {project.stack.slice(0, 5).map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <a className={buttonClassName("secondary", "sm")} href={project.website} rel="noreferrer" target="_blank">
                  {t.actions.open}
                </a>
                {project.repository ? (
                  <a className={buttonClassName("ghost", "sm")} href={project.repository} rel="noreferrer" target="_blank">
                    Repo
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
