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

function normalizeTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function hasCategory(project: Project, categories: string[]) {
  const normalizedCategories = project.category.map(normalizeTerm);
  return categories.some((category) => normalizedCategories.includes(normalizeTerm(category)));
}

function hasTechnology(project: Project, technologies: string[]) {
  const normalizedStack = project.stack.map(normalizeTerm);

  return technologies.some((technology) => {
    const normalizedTechnology = normalizeTerm(technology);

    return normalizedStack.some(
      (stackItem) =>
        stackItem === normalizedTechnology ||
        stackItem.startsWith(`${normalizedTechnology} `) ||
        stackItem.includes(normalizedTechnology),
    );
  });
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const { locale, t } = usePortfolioUi();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filters = useMemo<ProjectFilter[]>(
    () => [
      {
        id: "saas",
        label: "SaaS",
        matches: (project) => hasCategory(project, ["SaaS"]),
      },
      {
        id: "ai",
        label: locale === "pt" ? "IA" : "AI",
        matches: (project) =>
          hasCategory(project, ["IA", "AI"]) ||
          hasTechnology(project, ["OpenAI", "Gemini", "APIs de IA", "AI APIs"]),
      },
      {
        id: "data",
        label: locale === "pt" ? "Dados" : "Data",
        matches: (project) =>
          hasCategory(project, ["Dados", "Métricas", "Data", "Metrics"]) ||
          hasTechnology(project, ["PostgreSQL", "Supabase", "Prisma", "MongoDB", "RabbitMQ"]),
      },
      {
        id: "frontend",
        label: "Front-end",
        matches: (project) =>
          hasTechnology(project, ["React", "Next.js", "Tailwind", "Vite", "Bootstrap"]),
      },
      {
        id: "fullstack",
        label: "Full Stack",
        matches: (project) =>
          hasTechnology(project, ["Supabase", "PostgreSQL", "Prisma", "Node.js", "NestJS", "MongoDB", "Edge Functions"]),
      },
    ],
    [locale],
  );

  const visibleProjects = useMemo(() => {
    if (activeCategory === "all") {
      return projects;
    }

    const activeFilter = filters.find((filter) => filter.id === activeCategory);
    return activeFilter ? projects.filter(activeFilter.matches) : projects;
  }, [activeCategory, filters, projects]);

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
