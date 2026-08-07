import type { Locale, ProfileLink, Project } from "@/types/portfolio";
import type { ProjectCollectionId } from "@/lib/projects/project-collection";

import { additionalProjects } from "./additional-projects.ts";
import { projects as originalProjects } from "./projects.ts";

export type { ProjectCollectionId } from "@/lib/projects/project-collection";

export const primaryProjectSlugs = [
  "margem-app",
  "fluxo",
  "glace-confeitaria",
  "sdr-expert-crm",
  "layerart-store",
  "audio-emotion",
] as const;

export const labProjectSlugs = [
  "femhealth-ml-triage",
  "typographic-story-engine",
  "gdash-dashboard",
  "checktask-explorer",
  "rivals-ai",
] as const;

export const secondaryProjectSlugs = ["comerc-ias"] as const;

const excludedProjectSlugs = new Set(["robet"]);

const projectCollectionBySlug = new Map<string, ProjectCollectionId>([
  ...primaryProjectSlugs.map((slug) => [slug, "primary"] as const),
  ...labProjectSlugs.map((slug) => [slug, "labs"] as const),
  ...secondaryProjectSlugs.map((slug) => [slug, "secondary"] as const),
]);

export const projectCollections: Record<ProjectCollectionId, {
  eyebrow: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
}> = {
  primary: {
    eyebrow: {
      pt: "PROJETOS PRINCIPAIS",
      en: "FEATURED PROJECTS",
    },
    title: {
      pt: "Produtos com maior profundidade de produto e engenharia.",
      en: "Products with the strongest product and engineering depth.",
    },
    description: {
      pt: "Cases selecionados por escopo, complexidade, uso real e clareza do problema resolvido.",
      en: "Cases selected for scope, complexity, real-world use, and clarity of the problem solved.",
    },
  },
  labs: {
    eyebrow: {
      pt: "LABORATÓRIOS TÉCNICOS",
      en: "TECHNICAL LABS",
    },
    title: {
      pt: "Experimentos que demonstram fundamentos e investigação técnica.",
      en: "Experiments that demonstrate fundamentals and technical exploration.",
    },
    description: {
      pt: "Projetos acadêmicos, local-first e experimentais apresentados com seus limites e objetivos reais.",
      en: "Academic, local-first, and experimental projects presented with their actual goals and limitations.",
    },
  },
  secondary: {
    eyebrow: {
      pt: "OUTROS CASES",
      en: "OTHER CASES",
    },
    title: {
      pt: "Entregas complementares.",
      en: "Complementary deliveries.",
    },
    description: {
      pt: "Projetos que permanecem disponíveis como parte da evolução do portfólio, sem ocupar o destaque principal.",
      en: "Projects that remain available as part of the portfolio journey without taking primary prominence.",
    },
  },
};

const allProjectsBySlug = new Map<string, Project>();

for (const project of [...originalProjects, ...additionalProjects]) {
  if (!excludedProjectSlugs.has(project.slug)) {
    allProjectsBySlug.set(project.slug, project);
  }
}

function projectsForSlugs(slugs: readonly string[]) {
  return slugs.flatMap((slug) => {
    const project = allProjectsBySlug.get(slug);
    return project ? [project] : [];
  });
}

const curatedSlugs = new Set<string>([
  ...primaryProjectSlugs,
  ...labProjectSlugs,
  ...secondaryProjectSlugs,
]);

const unclassifiedProjects = [...allProjectsBySlug.values()].filter(
  (project) => !curatedSlugs.has(project.slug),
);

export const projects: Project[] = [
  ...projectsForSlugs(primaryProjectSlugs),
  ...projectsForSlugs(labProjectSlugs),
  ...projectsForSlugs(secondaryProjectSlugs),
  ...unclassifiedProjects,
];

export const primaryProjects = projectsForSlugs(primaryProjectSlugs);
export const labProjects = projectsForSlugs(labProjectSlugs);
export const secondaryProjects = projectsForSlugs(secondaryProjectSlugs);

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectCollectionId(project: Project): ProjectCollectionId {
  const configuredCollection = (project as Project & { collection?: ProjectCollectionId }).collection;
  return configuredCollection ?? projectCollectionBySlug.get(project.slug) ?? "secondary";
}

export function groupProjectsByCollection(projectList: readonly Project[]) {
  const groups: Record<ProjectCollectionId, Project[]> = {
    primary: [],
    labs: [],
    secondary: [],
  };

  for (const project of projectList) {
    groups[getProjectCollectionId(project)].push(project);
  }

  return (["primary", "labs", "secondary"] as const).map((id) => ({
    id,
    copy: projectCollections[id],
    projects: groups[id],
  }));
}

export const projectLinks: ProfileLink[] = projects.flatMap((project) => {
  const links: ProfileLink[] = [];

  if (project.links.website) {
    links.push({
      label: project.title,
      href: project.links.website,
      display: project.links.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      kind: "project",
    });
  }

  if (project.links.repository) {
    links.push({
      label: {
        pt: `${project.title.pt} Repositório`,
        en: `${project.title.en} Repository`,
      },
      href: project.links.repository,
      display: project.links.repository.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      kind: "repo",
    });
  }

  return links;
});
