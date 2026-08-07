import type { Locale, Project } from "@/types/portfolio";
import type { ProjectCollectionId } from "./project-collection.ts";

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

export function getProjectCollectionId(project: Project): ProjectCollectionId {
  const configuredCollection = (project as Project & { collection?: ProjectCollectionId }).collection;
  return configuredCollection ?? "secondary";
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
