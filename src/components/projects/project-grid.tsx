"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePortfolioUi } from "@/components/layout/app-shell";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/portfolio";

import { ProjectCard } from "./project-card";

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  const { t } = usePortfolioUi();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.category))).sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  const visibleProjects = useMemo(
    () => (activeCategory === "all" ? projects : projects.filter((project) => project.category.includes(activeCategory))),
    [activeCategory, projects],
  );

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" aria-label={t.projectsPage.filtersLabel}>
        <Button
          className={cn(activeCategory === "all" && "border-[var(--accent)]")}
          onClick={() => setActiveCategory("all")}
          size="sm"
          variant={activeCategory === "all" ? "primary" : "secondary"}
        >
          {t.projectsPage.allCategories}
        </Button>
        {categories.map((category) => (
          <Button
            className={cn(activeCategory === category && "border-[var(--accent)]")}
            key={category}
            onClick={() => setActiveCategory(category)}
            size="sm"
            variant={activeCategory === category ? "primary" : "secondary"}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
