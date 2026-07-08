"use client";

import Link from "next/link";
import type { PointerEvent } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import type { Project } from "@/types/portfolio";

import styles from "./project-experience.module.css";
import { ProjectVisualFrame, projectAccentStyle } from "./project-visual-frame";

type ProjectCardProps = {
  project: Project;
  compact?: boolean;
  index?: number;
};

const categoryLabels: Record<string, string> = {
  Catálogo: "Catalog",
  Dados: "Data",
  Entretenimento: "Entertainment",
  IA: "AI",
  Institucional: "Institutional",
  Métricas: "Metrics",
};

const techLabels: Record<string, string> = {
  "APIs de IA": "AI APIs",
};

export function formatProjectCategory(category: string, locale: "pt" | "en") {
  return locale === "en" ? (categoryLabels[category] ?? category) : category;
}

export function formatProjectTech(tech: string, locale: "pt" | "en") {
  return locale === "en" ? (techLabels[tech] ?? tech) : tech;
}

function handlePointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  event.currentTarget.style.setProperty("--lx", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--ly", `${(y * 100).toFixed(2)}%`);
}

export function ProjectCard({ project, compact = false, index = 0 }: ProjectCardProps) {
  const { locale, t } = usePortfolioUi();
  const viewCase = locale === "pt" ? "Ver case" : t.projectsPage.viewCase;

  return (
    <article
      className={styles.scene}
      data-motion-surface
      onPointerMove={handlePointer}
      style={projectAccentStyle(project)}
      tabIndex={-1}
    >
      <div className={styles.sceneInfo}>
        <span className={styles.sceneNumber}>{String(index + 1).padStart(2, "0")}</span>
        <p className={styles.sceneKicker}>{project.subtitle[locale]}</p>
        <h3 className={styles.sceneTitle}>{project.title[locale]}</h3>
        <p className={styles.sceneText}>{project.shortDescription[locale]}</p>
        <div className={styles.categoryList}>
          {project.category.slice(0, 3).map((category) => (
            <span className={styles.categoryPill} key={category}>
              {formatProjectCategory(category, locale)}
            </span>
          ))}
        </div>
        {!compact ? (
          <div className={styles.techRail}>
            {project.stack.slice(0, 5).map((tech) => (
              <span className={styles.techNode} key={tech}>
                {formatProjectTech(tech, locale)}
              </span>
            ))}
          </div>
        ) : null}
        <div className={styles.sceneActions}>
          <Link className={styles.actionPrimary} href={`/projetos/${project.slug}`}>
            {viewCase}
          </Link>
          <a className={styles.actionGhost} href={project.links.website} rel="noreferrer" target="_blank">
            {t.actions.open}
          </a>
        </div>
      </div>
      <ProjectVisualFrame index={index} locale={locale} mode="compact" project={project} />
    </article>
  );
}
