import type { Locale, LocalizedText, Project } from "@/types/portfolio";

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

type ProjectShowcasePresentation = {
  projectIconKey: HomeProjectIconKey;
  brandLabel: string;
  brandAccent: HomeProjectAccent;
};

const categoryLabels: Record<string, LocalizedText> = {
  Atendimento: { pt: "Atendimento", en: "Customer service" },
  Áudio: { pt: "Áudio", en: "Audio" },
  Dados: { pt: "Dados", en: "Data" },
  Dashboard: { pt: "Dashboard", en: "Dashboard" },
  "E-commerce": { pt: "E-commerce", en: "E-commerce" },
  "Editor visual": { pt: "Editor visual", en: "Visual editor" },
  FoodTech: { pt: "FoodTech", en: "FoodTech" },
  IA: { pt: "IA", en: "AI" },
  Institucional: { pt: "Institucional", en: "Institutional" },
  "Local-first": { pt: "Local-first", en: "Local-first" },
  Métricas: { pt: "Métricas", en: "Metrics" },
  Produto: { pt: "Produto", en: "Product" },
  SaaS: { pt: "SaaS", en: "SaaS" },
  CRM: { pt: "CRM", en: "CRM" },
};

const knownPresentations: Record<string, ProjectShowcasePresentation> = {
  "audio-emotion": {
    projectIconKey: "gdash",
    brandLabel: "AE",
    brandAccent: "sky-purple",
  },
  "fluxo": {
    projectIconKey: "gdash",
    brandLabel: "FL",
    brandAccent: "emerald-teal",
  },
  "glace-confeitaria": {
    projectIconKey: "comerc",
    brandLabel: "GL",
    brandAccent: "amber-pink",
  },
  "layerart-store": {
    projectIconKey: "comerc",
    brandLabel: "LA",
    brandAccent: "violet-cyan",
  },
  "margem-app": {
    projectIconKey: "margem",
    brandLabel: "MG",
    brandAccent: "blue-purple",
  },
  "sdr-expert-crm": {
    projectIconKey: "sdr",
    brandLabel: "SDR",
    brandAccent: "rose-indigo",
  },
};

const fallbackAccents: HomeProjectAccent[] = [
  "blue-purple",
  "amber-pink",
  "emerald-teal",
  "rose-indigo",
  "violet-cyan",
  "sky-purple",
];
const fallbackIcons: HomeProjectIconKey[] = ["comerc", "gdash", "sdr", "margem"];

function localizeCategory(category: string, locale: Locale) {
  return categoryLabels[category]?.[locale] ?? category;
}

function projectCategory(project: Project, locale: Locale) {
  return project.category
    .slice(0, 2)
    .map((category) => localizeCategory(category, locale))
    .join(" • ");
}

function stableHash(value: string) {
  return [...value].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 0);
}

function projectInitials(project: Project) {
  const words = project.title.pt
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean);

  return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase() || "PRJ";
}

function projectPresentation(project: Project): ProjectShowcasePresentation {
  const configured = knownPresentations[project.slug];

  if (configured) {
    return configured;
  }

  const hash = stableHash(project.slug);

  return {
    brandAccent: fallbackAccents[hash % fallbackAccents.length],
    brandLabel: projectInitials(project),
    projectIconKey: fallbackIcons[hash % fallbackIcons.length],
  };
}

function createProjectShowcase(project: Project): HomeProject {
  const presentation = projectPresentation(project);

  return {
    title: project.title.pt,
    category: {
      pt: projectCategory(project, "pt"),
      en: projectCategory(project, "en"),
    },
    description: project.shortDescription,
    projectIconKey: presentation.projectIconKey,
    brandLabel: presentation.brandLabel,
    brandAccent: presentation.brandAccent,
    carouselStack: project.stack,
    caseHref: `/projetos/${project.slug}`,
    liveHref: project.links.website || undefined,
    logo: project.visuals?.logo ?? null,
    logoAlt: project.visuals?.logoAlt ?? project.title,
  };
}

export function createHomeProjects(publicProjects: readonly Project[]): HomeProject[] {
  return publicProjects.map(createProjectShowcase);
}

export const homeProjects: HomeProject[] = [];
