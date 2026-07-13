import { ProjectContentSchema } from "./project-schema.ts";
import type { Project } from "@/types/portfolio";

export type PublicProjectOverlayRow = {
  content: Record<string, unknown>;
  publicationStatus: "draft" | "published" | "archived";
  slug: string;
  sortOrder: number;
};

export function parseProjectContent(content: Record<string, unknown>) {
  const parsed = ProjectContentSchema.safeParse(content);
  return parsed.success ? (parsed.data as Project) : null;
}

export function applyPublicProjectOverlay(
  staticProjects: readonly Project[],
  rows: readonly PublicProjectOverlayRow[],
) {
  const projectsBySlug = new Map(
    staticProjects.map((project, index) => [
      project.slug,
      {
        project,
        sortOrder: index * 10,
      },
    ]),
  );

  for (const row of rows) {
    if (row.publicationStatus !== "published") {
      projectsBySlug.delete(row.slug);
      continue;
    }

    const project = parseProjectContent(row.content);

    if (project?.slug === row.slug) {
      projectsBySlug.set(row.slug, {
        project,
        sortOrder: row.sortOrder,
      });
    }
  }

  return [...projectsBySlug.values()]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((entry) => entry.project);
}

export function applyPublicProjectDetailOverlay(
  staticProject: Project | null,
  row: PublicProjectOverlayRow | null,
) {
  if (!row) {
    return staticProject;
  }

  if (row.publicationStatus !== "published") {
    return null;
  }

  const project = parseProjectContent(row.content);

  if (!project || project.slug !== row.slug) {
    return staticProject;
  }

  return project;
}
