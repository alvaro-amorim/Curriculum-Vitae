"use client";

import { useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { cn } from "@/lib/cn";
import { filterProjects, getProjectFilters } from "@/lib/project-filters";
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

      <div className={styles.projectScenes}>
        {visibleProjects.map((project, index) => (
          <ProjectCard index={index} key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
