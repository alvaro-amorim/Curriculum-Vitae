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

type ProjectFilter = {
  id: string;
  label: string;
  matches: (project: Project) => boolean;
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  const { locale, t } = usePortfolioUi();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filters = useMemo<ProjectFilter[]>(
    () => [
      {
        id: "saas",
        label: "SaaS",
        matches: (project) => project.category.includes("SaaS"),
      },
      {
        id: "ai",
        label: locale === "pt" ? "IA" : "AI",
        matches: (project) => project.category.includes("IA") || project.stack.some((tech) => tech.includes("OpenAI") || tech.includes("IA")),
      },
      {
        id: "data",
        label: locale === "pt" ? "Dados" : "Data",
        matches: (project) =>
          project.category.some((category) => ["Dados", "Métricas"].includes(category)) ||
          project.stack.some((tech) => ["PostgreSQL", "Supabase", "Prisma"].includes(tech)),
      },
      {
        id: "frontend",
        label: "Front-end",
        matches: (project) => project.stack.some((tech) => ["React", "Next.js", "Tailwind CSS", "Vite", "Bootstrap"].includes(tech)),
      },
      {
        id: "fullstack",
        label: "Full Stack",
        matches: (project) => project.stack.some((tech) => ["Supabase", "PostgreSQL", "Prisma", "Node.js", "Edge Functions"].includes(tech)),
      },
    ],
    [locale],
  );

  const visibleProjects = useMemo(
    () => {
      if (activeCategory === "all") {
        return projects;
      }

      return projects.filter((project) => filters.find((filter) => filter.id === activeCategory)?.matches(project));
    },
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
