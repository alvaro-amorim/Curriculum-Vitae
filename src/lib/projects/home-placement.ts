import { primaryProjectSlugs } from "../../content/project-catalog.ts";
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
const primaryOrderBySlug = new Map<string, number>(
  primaryProjectSlugs.map((slug, index) => [slug, index * 10]),
);

export function defaultProjectHomePlacement(slug: string): ProjectHomePlacement {
  const primaryOrder = primaryOrderBySlug.get(slug);

  if (typeof primaryOrder === "number") {
    return {
      carouselOrder: primaryOrder,
      homeOrder: primaryOrder,
      showInCarousel: true,
      showInHome: true,
    };
  }

  return {
    carouselOrder: DEFAULT_HIDDEN_ORDER,
    homeOrder: DEFAULT_HIDDEN_ORDER,
    showInCarousel: false,
    showInHome: false,
  };
}

export function normalizeProjectHomePlacement(
  slug: string,
  placement?: Partial<ProjectHomePlacement> | null,
): ProjectHomePlacement {
  const fallback = defaultProjectHomePlacement(slug);

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
    .map((project, catalogIndex) => ({
      catalogIndex,
      placement: normalizeProjectHomePlacement(project.slug, placements.get(project.slug)),
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

      return leftOrder - rightOrder || left.catalogIndex - right.catalogIndex;
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
