import type { LocalizedText, Project } from "../../types/portfolio.ts";

export const CAROUSEL_DESCRIPTION_MAX_LENGTH = 120;

export type ProjectHomePlacement = {
  carouselDescription?: LocalizedText;
  carouselOrder: number;
  homeOrder: number;
  showInCarousel: boolean;
  showInHome: boolean;
};

export type HomeProjectCollections = {
  carouselProjects: Project[];
  homeProjects: Project[];
};

const DEFAULT_HIDDEN_ORDER = 1_000;

function compactCarouselText(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= CAROUSEL_DESCRIPTION_MAX_LENGTH) {
    return normalized;
  }

  const candidate = normalized.slice(0, CAROUSEL_DESCRIPTION_MAX_LENGTH - 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const compacted = lastSpace >= 86 ? candidate.slice(0, lastSpace) : candidate;

  return `${compacted.trimEnd()}…`;
}

export function compactCarouselDescription(description: LocalizedText): LocalizedText {
  return {
    en: compactCarouselText(description.en),
    pt: compactCarouselText(description.pt),
  };
}

function normalizeCarouselDescription(description?: LocalizedText | null) {
  const en = description?.en?.trim() ?? "";
  const pt = description?.pt?.trim() ?? "";

  if (!en || !pt) {
    return undefined;
  }

  return compactCarouselDescription({ en, pt });
}

export function defaultProjectHomePlacement(
  featured = false,
  order = DEFAULT_HIDDEN_ORDER,
): ProjectHomePlacement {
  const safeOrder = Number.isInteger(order) ? Math.max(0, order) : DEFAULT_HIDDEN_ORDER;

  return {
    carouselOrder: safeOrder,
    homeOrder: safeOrder,
    showInCarousel: featured,
    showInHome: featured,
  };
}

export function normalizeProjectHomePlacement(
  placement?: Partial<ProjectHomePlacement> | null,
  fallback = defaultProjectHomePlacement(),
): ProjectHomePlacement {
  const submittedCarouselDescription = placement?.carouselDescription;
  const carouselDescription = submittedCarouselDescription === undefined
    ? fallback.carouselDescription
    : normalizeCarouselDescription(submittedCarouselDescription);

  return {
    ...(carouselDescription ? { carouselDescription } : {}),
    carouselOrder: Number.isInteger(placement?.carouselOrder)
      ? Math.max(0, placement?.carouselOrder ?? fallback.carouselOrder)
      : fallback.carouselOrder,
    homeOrder: Number.isInteger(placement?.homeOrder)
      ? Math.max(0, placement?.homeOrder ?? fallback.homeOrder)
      : fallback.homeOrder,
    showInCarousel: placement?.showInCarousel ?? fallback.showInCarousel,
    showInHome: placement?.showInHome ?? fallback.showInHome,
  };
}

function orderedProjects(
  projects: readonly Project[],
  placements: ReadonlyMap<string, ProjectHomePlacement | undefined>,
  surface: "carousel" | "home",
) {
  return projects
    .map((project, databaseIndex) => ({
      databaseIndex,
      placement: normalizeProjectHomePlacement(
        placements.get(project.slug),
        defaultProjectHomePlacement(project.featured === true, databaseIndex),
      ),
      project,
    }))
    .filter(({ placement }) => (
      surface === "carousel" ? placement.showInCarousel : placement.showInHome
    ))
    .sort((left, right) => {
      const leftOrder = surface === "carousel"
        ? left.placement.carouselOrder
        : left.placement.homeOrder;
      const rightOrder = surface === "carousel"
        ? right.placement.carouselOrder
        : right.placement.homeOrder;

      return leftOrder - rightOrder || left.databaseIndex - right.databaseIndex;
    })
    .map(({ placement, project }) => {
      if (surface !== "carousel") {
        return project;
      }

      return {
        ...project,
        carouselDescription: placement.carouselDescription
          ?? compactCarouselDescription(project.shortDescription),
      };
    });
}

export function selectHomeProjectCollections(
  projects: readonly Project[],
  placements: ReadonlyMap<string, ProjectHomePlacement | undefined> = new Map(),
): HomeProjectCollections {
  return {
    carouselProjects: orderedProjects(projects, placements, "carousel"),
    homeProjects: orderedProjects(projects, placements, "home"),
  };
}
