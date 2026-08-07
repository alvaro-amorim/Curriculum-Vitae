import type { Project } from "../../types/portfolio.ts";

export type ProjectHomePlacement = {
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
  return {
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
    .map(({ project }) => project);
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
