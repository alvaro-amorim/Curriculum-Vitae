import type { Locale, LocalizedText, Project } from "@/types/portfolio";

import { primaryProjectSlugs, projects as staticProjects } from "./project-catalog.ts";

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
  slug: (typeof primaryProjectSlugs)[number];
  projectIconKey: HomeProjectIconKey;
  brandLabel: string;
  brandAccent: HomeProjectAccent;
};

const categoryLabels: Record<string, LocalizedText> = {
  Atendimento: { pt: "Atendimento", en: "Customer service" },
  Áudio: { pt: "Áudio", en: "Audio" },
  "E-commerce": { pt: "E-commerce", en: "E-commerce" },
  "Editor visual": { pt: "Editor visual", en: "Visual editor" },
  FoodTech: { pt: "FoodTech", en: "FoodTech" },
  IA: { pt: "IA", en: "AI" },
  "Local-first": { pt: "Local-first", en: "Local-first" },
  Produto: { pt: "Produto", en: "Product" },
  SaaS: { pt: "SaaS", en: "SaaS" },
  CRM: { pt: "CRM", en: "CRM" },
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
    liveHref: project.links.website || undefined,
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
    slug: "fluxo",
    projectIconKey: "gdash",
    brandLabel: "FL",
    brandAccent: "emerald-teal",
  },
  {
    slug: "glace-confeitaria",
    projectIconKey: "comerc",
    brandLabel: "GL",
    brandAccent: "amber-pink",
  },
  {
    slug: "sdr-expert-crm",
    projectIconKey: "sdr",
    brandLabel: "SDR",
    brandAccent: "rose-indigo",
  },
  {
    slug: "layerart-store",
    projectIconKey: "comerc",
    brandLabel: "LA",
    brandAccent: "violet-cyan",
  },
  {
    slug: "audio-emotion",
    projectIconKey: "gdash",
    brandLabel: "AE",
    brandAccent: "sky-purple",
  },
];

export function createHomeProjects(publicProjects: readonly Project[] = staticProjects): HomeProject[] {
  const projectsBySlug = new Map(publicProjects.map((project) => [project.slug, project]));

  return projectShowcases.flatMap((project) => {
    const showcase = createProjectShowcase(projectsBySlug, project);
    return showcase ? [showcase] : [];
  });
}

export const homeProjects: HomeProject[] = createHomeProjects();
