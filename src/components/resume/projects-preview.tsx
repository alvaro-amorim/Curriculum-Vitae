"use client";

import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getProjectCollectionId } from "@/content/project-catalog";
import { profileLinks } from "@/content/profile";
import type { Project } from "@/types/portfolio";

import styles from "./resume.module.css";

type ProjectsPreviewProps = {
  projects: Project[];
  showLinks?: boolean;
  featuredOnly?: boolean;
  limit?: number;
};

type CuratedLink = {
  href: string;
  label: string;
  display: string;
};

export function ProjectsPreview({
  projects,
  showLinks = true,
  featuredOnly = false,
  limit,
}: ProjectsPreviewProps) {
  const { locale, t } = usePortfolioUi();
  const primaryProjects = projects.filter((project) => getProjectCollectionId(project) === "primary");
  const visibleProjects = primaryProjects
    .filter((project) => !featuredOnly || project.featured)
    .slice(0, limit ?? primaryProjects.length);
  const curatedLinks = primaryProjects.flatMap((project) => {
    const links: CuratedLink[] = [];

    if (project.links.website) {
      links.push({
        href: project.links.website,
        label: project.title[locale],
        display: project.links.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      });
    }

    if (project.links.repository) {
      links.push({
        href: project.links.repository,
        label: `${project.title[locale]} — GitHub`,
        display: project.links.repository.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      });
    }

    return links;
  });

  return (
    <Card className={styles.resumeCard}>
      <div className={styles.itemHeader}>
        <h2 className={styles.sectionTitle}>{t.resume.projects}</h2>
        <Link className={buttonClassName("ghost", "sm")} href="/projetos">
          {t.actions.viewProjects}
        </Link>
      </div>

      {visibleProjects.length > 0 ? (
        <div className={styles.projectGrid}>
          {visibleProjects.map((project) => (
            <article className={`interactive-surface ${styles.projectCard}`} key={project.slug}>
              <div>
                <h3 className={styles.projectTitle}>{project.title[locale]}</h3>
                <p className={styles.projectKicker}>{project.subtitle[locale]}</p>
                <p className={styles.projectDescription}>{project.shortDescription[locale]}</p>
              </div>
              <div>
                <div className={styles.projectStack}>
                  {project.stack.slice(0, 5).map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
                <div className={styles.projectActions}>
                  <Link className={buttonClassName("primary", "sm")} href={`/projetos/${project.slug}`}>
                    {t.projectsPage.viewCase}
                  </Link>
                  {project.links.website ? (
                    <a className={buttonClassName("secondary", "sm")} href={project.links.website} rel="noreferrer" target="_blank">
                      {t.actions.open}
                    </a>
                  ) : null}
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
      ) : (
        <p className={styles.projectDescription}>
          {locale === "pt" ? "Nenhum projeto principal está publicado no momento." : "No primary projects are published right now."}
        </p>
      )}

      {showLinks ? (
        <div className="mt-6">
          <h3 className={styles.projectKicker}>{t.resume.links}</h3>
          <ul className={styles.linkList}>
            {[
              ...profileLinks.map((link) => ({
                href: link.href,
                label: link.label[locale],
                display: link.display,
              })),
              ...curatedLinks,
            ].map((link) => (
              <li className="flex flex-wrap gap-2" key={link.href}>
                <span className="text-[var(--text)]">{link.label}:</span>
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
