"use client";

import Link from "next/link";

import { projects, projectLinks } from "@/content/projects";
import { profileLinks } from "@/content/profile";
import { buttonClassName } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import styles from "./resume.module.css";

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
    <Card className={styles.resumeCard}>
      <div className={styles.itemHeader}>
        <h2 className={styles.sectionTitle}>{t.resume.projects}</h2>
        <Link className={buttonClassName("ghost", "sm")} href="/projetos">
          {t.actions.viewProjects}
        </Link>
      </div>

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
          <h3 className={styles.projectKicker}>{t.resume.links}</h3>
          <ul className={styles.linkList}>
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
