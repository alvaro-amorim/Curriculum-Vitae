"use client";

import { useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/portfolio";

import { formatProjectCategory, ProjectCard } from "./project-card";
import styles from "./project-experience.module.css";

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  const { locale, t } = usePortfolioUi();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(
    () =>
      Array.from(new Set(projects.flatMap((project) => project.category))).sort((a, b) =>
        formatProjectCategory(a, locale).localeCompare(formatProjectCategory(b, locale), locale),
      ),
    [locale, projects],
  );

  const visibleProjects = useMemo(
    () => (activeCategory === "all" ? projects : projects.filter((project) => project.category.includes(activeCategory))),
    [activeCategory, projects],
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
        {categories.map((category) => (
          <button
            aria-pressed={activeCategory === category}
            className={cn(styles.filterButton, activeCategory === category && styles.filterButtonActive)}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {formatProjectCategory(category, locale)}
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
