"use client";

import type { PointerEvent } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
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
  const title = locale === "pt" ? "Projetos" : "Projects";
  const description =
    locale === "pt"
      ? "Cases, produtos e experiências desenvolvidas com foco em entrega real."
      : "Cases, products and digital experiences built with real delivery in mind.";
  const countLabel = locale === "pt" ? `${projects.length} cases publicados` : `${projects.length} published cases`;
  const note = locale === "pt" ? "Escolha um projeto para abrir o estudo completo." : "Choose a project to open the full case study.";

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

        <section className={styles.projectsListBlock}>
          <div className={styles.projectsListHeader}>
            <div>
              <p className={styles.eyebrow}>{locale === "pt" ? "grade de projetos" : "project grid"}</p>
              <h2 className={styles.sectionTitle}>{locale === "pt" ? "Escolha um case." : "Pick a case."}</h2>
            </div>
            <p className={styles.sectionIntro}>
              {locale === "pt"
                ? "Cards compactos com contexto, stack principal e caminho direto para o estudo completo."
                : "Compact cards with context, core stack and a direct path to the full case study."}
            </p>
          </div>
          <ProjectGrid projects={projects} />
        </section>
      </div>
    </main>
  );
}
