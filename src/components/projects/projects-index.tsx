"use client";

import type { PointerEvent } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { groupProjectsByCollection } from "@/lib/projects/project-groups";
import type { Project } from "@/types/portfolio";

import { ProjectGrid } from "./project-grid";
import styles from "./project-experience.module.css";
import { projectAccentStyle } from "./project-visual-frame";

function handleExperiencePointer(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  event.currentTarget.style.setProperty("--px", `${(x * 100).toFixed(2)}%`);
  event.currentTarget.style.setProperty("--py", `${(y * 100).toFixed(2)}%`);
}

export function ProjectsIndex({ projects }: { projects: Project[] }) {
  const { locale } = usePortfolioUi();
  const featuredProject = projects.find((project) => project.featured) ?? projects[0];
  const groups = groupProjectsByCollection(projects);
  const primaryCount = groups.find((group) => group.id === "primary")?.projects.length ?? 0;
  const labCount = groups.find((group) => group.id === "labs")?.projects.length ?? 0;
  const title = locale === "pt" ? "Projetos" : "Projects";
  const description =
    locale === "pt"
      ? "Uma seleção organizada pelo painel administrativo, com status, escopo e evidências de cada case."
      : "A selection organized through the Admin panel, with each case's status, scope, and evidence.";
  const countLabel = locale === "pt"
    ? `${primaryCount} principais + ${labCount} laboratórios`
    : `${primaryCount} featured + ${labCount} technical labs`;
  const note = locale === "pt"
    ? "A publicação e a coleção de cada projeto vêm diretamente do MongoDB."
    : "Each project's publication and collection come directly from MongoDB.";

  if (!featuredProject) {
    return (
      <main className={styles.experience} onPointerMove={handleExperiencePointer}>
        <div className={styles.shell}>
          <section className={`${styles.projectsHeader} ${styles.reveal}`}>
            <div>
              <p className={styles.eyebrow}>portfolio / cases</p>
              <h1 className={styles.heroTitle}>{title}</h1>
              <p className={styles.heroText}>
                {locale === "pt" ? "Nenhum projeto está publicado no momento." : "No projects are published right now."}
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.experience} onPointerMove={handleExperiencePointer} style={projectAccentStyle(featuredProject)}>
      <div className={styles.shell}>
        <section className={`${styles.projectsHeader} ${styles.reveal}`}>
          <div>
            <p className={styles.eyebrow}>portfolio / cases</p>
            <h1 className={styles.heroTitle}>{title}</h1>
            <p className={styles.heroText}>{description}</p>
          </div>
          <aside className={styles.projectsHeaderMeta} aria-label={locale === "pt" ? "Resumo da página" : "Page summary"}>
            <strong>{countLabel}</strong>
            <span>{note}</span>
          </aside>
        </section>

        <ProjectGrid projects={projects} />
      </div>
    </main>
  );
}
