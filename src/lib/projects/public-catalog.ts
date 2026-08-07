import {
  getProjectBySlug as getCatalogProjectBySlug,
  projects as catalogProjects,
} from "@/content/project-catalog";
import {
  getPublicProjectBySlug as getStoredPublicProjectBySlug,
  getPublicProjects as getStoredPublicProjects,
} from "@/lib/projects/repository";
import type { Project } from "@/types/portfolio";

function orderByCatalog(projectList: readonly Project[]) {
  const projectsBySlug = new Map(projectList.map((project) => [project.slug, project]));
  const orderedProjects = catalogProjects.flatMap((project) => {
    const publicProject = projectsBySlug.get(project.slug);
    return publicProject ? [publicProject] : [];
  });
  const catalogSlugs = new Set(catalogProjects.map((project) => project.slug));
  const uncataloguedProjects = projectList.filter((project) => !catalogSlugs.has(project.slug));

  return [...orderedProjects, ...uncataloguedProjects];
}

export async function getCuratedPublicProjects(): Promise<Project[]> {
  const storedProjects = await getStoredPublicProjects();
  const storedProjectsBySlug = new Map(storedProjects.map((project) => [project.slug, project]));

  for (const catalogProject of catalogProjects) {
    if (!storedProjectsBySlug.has(catalogProject.slug)) {
      storedProjectsBySlug.set(catalogProject.slug, catalogProject);
    }
  }

  return orderByCatalog([...storedProjectsBySlug.values()]);
}

export async function getCuratedPublicProjectBySlug(slug: string): Promise<Project | null> {
  const storedProject = await getStoredPublicProjectBySlug(slug);
  return storedProject ?? getCatalogProjectBySlug(slug) ?? null;
}
