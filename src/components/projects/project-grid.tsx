"use client";

import { useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import recruiterStyles from "@/components/recruiter/recruiter-journey.module.css";
import { cn } from "@/lib/cn";
import { filterProjects, getProjectFilters } from "@/lib/project-filters";
import { groupProjectsByCollection } from "@/lib/projects/project-groups";
import type { Project } from "@/types/portfolio";

import { formatProjectCategory, ProjectCard } from "./project-card";
import styles from "./project-experience.module.css";

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  const { locale, t } = usePortfolioUi();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filters = useMemo(() => getProjectFilters(locale), [locale]);
  const visibleProjects = useMemo(
    () => filterProjects(projects, activeCategory, filters),
    [activeCategory, filters, projects],
  );
  const groupedProjects = useMemo(
    () => groupProjectsByCollection(visibleProjects),
    [visibleProjects],
  );

  return (
    <div>
      <div className={styles.filters} aria-label={t.projectsPage.filtersLabel}>
        <button
          aria-pressed={activeCategory === "all"}
          className={cn(styles.filterButton, activeCategory === "all" && styles.filterButtonActive)}
          onClick={() => setActiveCategory("all")}
          type="button"
        >
          {t.projectsPage.allCategories}
        </button>
        {filters.map((filter) => (
          <button
            aria-pressed={activeCategory === filter.id}
            className={cn(styles.filterButton, activeCategory === filter.id && styles.filterButtonActive)}
            key={filter.id}
            onClick={() => setActiveCategory(filter.id)}
            type="button"
          >
            {formatProjectCategory(filter.label, locale)}
          </button>
        ))}
      </div>

      {visibleProjects.length === 0 ? (
        <section className={recruiterStyles.emptyState} aria-live="polite">
          <h3>{locale === "pt" ? "Nenhum case neste filtro." : "No cases match this filter."}</h3>
          <p>
            {locale === "pt"
              ? "Escolha outra tecnologia ou volte para a visão completa dos projetos publicados."
              : "Choose another technology or return to the complete view of published projects."}
          </p>
          <button
            className={recruiterStyles.resetButton}
            onClick={() => setActiveCategory("all")}
            type="button"
          >
            {locale === "pt" ? "Mostrar todos os projetos" : "Show all projects"}
          </button>
        </section>
      ) : null}

      {groupedProjects.map((group) => {
        if (group.projects.length === 0) {
          return null;
        }

        return (
          <section className={styles.projectsListBlock} key={group.id}>
            <div className={styles.projectsListHeader}>
              <div>
                <p className={styles.eyebrow}>{group.copy.eyebrow[locale]}</p>
                <h2 className={styles.sectionTitle}>{group.copy.title[locale]}</h2>
              </div>
              <p className={styles.sectionIntro}>{group.copy.description[locale]}</p>
            </div>

            <div className={styles.projectScenes}>
              {group.projects.map((project, index) => (
                <ProjectCard index={index} key={project.slug} project={project} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
