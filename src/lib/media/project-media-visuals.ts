import type { Project, ProjectVisuals } from "../../types/portfolio.ts";

import type { ProjectMediaResourceType, ProjectMediaRole } from "./media-rules.ts";

export type ProjectMediaVisualAsset = {
  alt: {
    en: string;
    pt: string;
  };
  position: number;
  resourceType: ProjectMediaResourceType;
  role: ProjectMediaRole;
  secureUrl: string;
};

export function defaultProjectVisuals(project: Project): ProjectVisuals {
  return {
    accent: project.visuals?.accent ?? {
      primary: "#67e8f9",
      secondary: "#8b5cf6",
      tertiary: "#22c55e",
    },
    alt: project.visuals?.alt ?? {
      en: project.title.en,
      pt: project.title.pt,
    },
    gallery: project.visuals?.gallery ?? [],
    heroImage: project.visuals?.heroImage ?? null,
    layout: project.visuals?.layout ?? "operational-saas",
    logo: project.visuals?.logo ?? null,
    logoAlt: project.visuals?.logoAlt ?? {
      en: project.title.en,
      pt: project.title.pt,
    },
    mockupHint: project.visuals?.mockupHint ?? {
      en: project.subtitle.en,
      pt: project.subtitle.pt,
    },
    status: project.visuals?.status ?? "pending",
    thumbnail: project.visuals?.thumbnail ?? null,
  };
}

export function firstUsedProjectImage(mediaAssets: ProjectMediaVisualAsset[]) {
  return mediaAssets.find((asset) => asset.role === "thumbnail" && asset.resourceType === "image")
    ?? mediaAssets.find((asset) => asset.role === "hero" && asset.resourceType === "image")
    ?? mediaAssets
      .filter((asset) => asset.role === "gallery" && asset.resourceType === "image")
      .sort((left, right) => left.position - right.position)[0];
}

export function buildProjectVisualsFromMediaAssets(
  project: Project,
  mediaAssets: ProjectMediaVisualAsset[],
): ProjectVisuals {
  const visuals = defaultProjectVisuals(project);
  const thumbnail = mediaAssets.find((asset) => asset.role === "thumbnail" && asset.resourceType === "image");
  const hero = mediaAssets.find((asset) => asset.role === "hero" && asset.resourceType === "image");
  const logo = mediaAssets.find((asset) => asset.role === "logo" && asset.resourceType === "image");
  const gallery = mediaAssets
    .filter((asset) => asset.role === "gallery" && asset.resourceType === "image")
    .sort((left, right) => left.position - right.position);
  const firstImage = firstUsedProjectImage(mediaAssets);
  const hasMedia = Boolean(logo || thumbnail || hero || gallery.length > 0);

  return {
    ...visuals,
    alt: firstImage?.alt ?? visuals.alt,
    gallery: gallery.map((asset) => asset.secureUrl),
    heroImage: hero?.secureUrl ?? null,
    logo: logo?.secureUrl ?? null,
    logoAlt: logo?.alt ?? visuals.logoAlt,
    status: hasMedia ? "available" : "pending",
    thumbnail: thumbnail?.secureUrl ?? null,
  };
}

export function assertPublishedProjectMediaAlt(
  publicationStatus: string,
  mediaAssets: ProjectMediaVisualAsset[],
) {
  if (publicationStatus !== "published") {
    return;
  }

  const missingAlt = mediaAssets.some((asset) => (
    asset.resourceType === "image"
    && (asset.role === "logo" || asset.role === "thumbnail" || asset.role === "hero" || asset.role === "gallery")
    && (!asset.alt.pt.trim() || !asset.alt.en.trim())
  ));

  if (missingAlt) {
    throw new Error("Alt PT/EN é obrigatório para imagens publicadas.");
  }
}
