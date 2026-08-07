import type { Locale, LocalizedText, Project } from "@/types/portfolio";

import { projects as staticProjects } from "./projects.ts";

export type HomeProjectIconKey = "margem" | "comerc" | "gdash" | "sdr" | "arcade" | "portfolio-os";
export type HomeProjectAccent = "blue-purple" | "amber-pink" | "emerald-teal" | "rose-indigo" | "violet-cyan" | "sky-purple";

export type HomeProject = {
  title: string;
  category: Record<Locale, string>;
  description: Record<Locale, string>;
  projectIconKey: HomeProjectIconKey;
  brandLabel: string;
  brandAccent: HomeProjectAccent;
  carouselStack: string[];
  caseHref: string;
  liveHref?: string;
  logo?: string | null;
  logoAlt?: Record<Locale, string>;
};

type ProjectShowcaseOptions = {
  slug: string;
  projectIconKey: HomeProjectIconKey;
  brandLabel: string;
  brandAccent: HomeProjectAccent;
};

const categoryLabels: Record<string, LocalizedText> = {
  IA: { pt: "IA", en: "AI" },
  Institucional: { pt: "Institucional", en: "Institutional" },
  Dados: { pt: "Dados", en: "Data" },
  Métricas: { pt: "Métricas", en: "Metrics" },
};

function localizeCategory(category: string, locale: Locale) {
  return categoryLabels[category]?.[locale] ?? category;
}

function projectCategory(project: Project, locale: Locale) {
  return project.category
    .slice(0, 2)
    .map((category) => localizeCategory(category, locale))
    .join(" • ");
}

function createProjectShowcase(projectsBySlug: Map<string, Project>, options: ProjectShowcaseOptions): HomeProject | null {
  const project = projectsBySlug.get(options.slug);

  if (!project) {
    return null;
  }

  return {
    title: project.title.pt,
    category: {
      pt: projectCategory(project, "pt"),
      en: projectCategory(project, "en"),
    },
    description: project.shortDescription,
    projectIconKey: options.projectIconKey,
    brandLabel: options.brandLabel,
    brandAccent: options.brandAccent,
    carouselStack: project.stack,
    caseHref: `/projetos/${project.slug}`,
    liveHref: project.links.website,
    logo: project.visuals?.logo ?? null,
    logoAlt: project.visuals?.logoAlt ?? project.title,
  };
}

const projectShowcases: ProjectShowcaseOptions[] = [
  {
    slug: "margem-app",
    projectIconKey: "margem",
    brandLabel: "MG",
    brandAccent: "blue-purple",
  },
  {
    slug: "comerc-ias",
    projectIconKey: "comerc",
    brandLabel: "CI",
    brandAccent: "violet-cyan",
  },
  {
    slug: "gdash-dashboard",
    projectIconKey: "gdash",
    brandLabel: "GD",
    brandAccent: "emerald-teal",
  },
  {
    slug: "sdr-expert-crm",
    projectIconKey: "sdr",
    brandLabel: "SDR",
    brandAccent: "rose-indigo",
  },
];

export function createHomeProjects(publicProjects: readonly Project[] = staticProjects): HomeProject[] {
  const projectsBySlug = new Map(publicProjects.map((project) => [project.slug, project]));
  const showcaseProjects = projectShowcases.flatMap((project) => {
    const showcase = createProjectShowcase(projectsBySlug, project);
    return showcase ? [showcase] : [];
  });

  return [
    ...showcaseProjects,
    {
      title: "Developer Arcade",
      category: { pt: "Lab • Gamificação", en: "Lab • Gamification" },
      description: {
        pt: "Lab interativo de desafios técnicos com sessão anônima e ranking persistente.",
        en: "Interactive technical challenge lab with anonymous sessions and persistent rankings.",
      },
      projectIconKey: "arcade",
      brandLabel: "LAB",
      brandAccent: "amber-pink",
      carouselStack: ["Next.js", "React", "TypeScript", "Supabase", "Tailwind CSS"],
      caseHref: "/lab",
    },
    {
      title: "Portfolio OS",
      category: { pt: "Portfólio • Produto", en: "Portfolio • Product" },
      description: {
        pt: "Portfólio modular com temas, conteúdo bilíngue, projetos e Developer Arcade.",
        en: "Modular portfolio with themes, bilingual content, projects and Developer Arcade.",
      },
      projectIconKey: "portfolio-os",
      brandLabel: "OS",
      brandAccent: "sky-purple",
      carouselStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"],
      caseHref: "/",
    },
  ];
}

export const homeProjects: HomeProject[] = createHomeProjects();
