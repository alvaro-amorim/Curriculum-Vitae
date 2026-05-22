"use client";

import { usePortfolioUi } from "@/components/layout/app-shell";
import type { Project } from "@/types/portfolio";

import styles from "./project-experience.module.css";

type ProjectLinksProps = {
  project: Project;
};

export function ProjectLinks({ project }: ProjectLinksProps) {
  const { t } = usePortfolioUi();

  return (
    <div className={styles.navActions}>
      <a className={styles.actionPrimary} href={project.links.website} rel="noreferrer" target="_blank">
        {t.caseStudy.visitProject}
      </a>
      {project.links.repository ? (
        <a className={styles.actionSecondary} href={project.links.repository} rel="noreferrer" target="_blank">
          {t.caseStudy.viewRepository}
        </a>
      ) : null}
    </div>
  );
}
