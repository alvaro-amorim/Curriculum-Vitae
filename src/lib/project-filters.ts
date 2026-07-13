import type { Locale, Project } from "@/types/portfolio";

export type ProjectFilter = {
  id: string;
  label: string;
  matches: (project: Project) => boolean;
};

export function normalizeProjectTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function projectHasCategory(project: Project, categories: readonly string[]) {
  const normalizedCategories = project.category.map(normalizeProjectTerm);
  return categories.some((category) => normalizedCategories.includes(normalizeProjectTerm(category)));
}

export function projectHasTechnology(project: Project, technologies: readonly string[]) {
  const normalizedStack = project.stack.map(normalizeProjectTerm);

  return technologies.some((technology) => {
    const normalizedTechnology = normalizeProjectTerm(technology);

    return normalizedStack.some(
      (stackItem) =>
        stackItem === normalizedTechnology ||
        stackItem.startsWith(`${normalizedTechnology} `) ||
        stackItem.includes(normalizedTechnology),
    );
  });
}

export function getProjectFilters(locale: Locale): ProjectFilter[] {
  return [
    {
      id: "saas",
      label: "SaaS",
      matches: (project) => projectHasCategory(project, ["SaaS"]),
    },
    {
      id: "ai",
      label: locale === "pt" ? "IA" : "AI",
      matches: (project) =>
        projectHasCategory(project, ["IA", "AI"]) ||
        projectHasTechnology(project, ["OpenAI", "Gemini", "APIs de IA", "AI APIs"]),
    },
    {
      id: "data",
      label: locale === "pt" ? "Dados" : "Data",
      matches: (project) =>
        projectHasCategory(project, ["Dados", "Métricas", "Data", "Metrics"]) ||
        projectHasTechnology(project, ["PostgreSQL", "Supabase", "Prisma", "MongoDB", "RabbitMQ"]),
    },
    {
      id: "frontend",
      label: "Front-end",
      matches: (project) => projectHasTechnology(project, ["React", "Next.js", "Tailwind", "Vite", "Bootstrap"]),
    },
    {
      id: "fullstack",
      label: "Full Stack",
      matches: (project) =>
        projectHasTechnology(project, ["Supabase", "PostgreSQL", "Prisma", "Node.js", "NestJS", "MongoDB", "Edge Functions"]),
    },
  ];
}

export function filterProjects(projects: readonly Project[], filterId: string, filters: readonly ProjectFilter[]) {
  if (filterId === "all") {
    return projects;
  }

  const activeFilter = filters.find((filter) => filter.id === filterId);
  return activeFilter ? projects.filter(activeFilter.matches) : projects;
}
