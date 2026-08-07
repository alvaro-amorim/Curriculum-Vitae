import {
  getPublicProjectBySlug,
  getPublicProjects,
} from "@/lib/projects/repository";
import type { Project } from "@/types/portfolio";

export async function getCuratedPublicProjects(): Promise<Project[]> {
  return getPublicProjects();
}

export async function getCuratedPublicProjectBySlug(slug: string): Promise<Project | null> {
  return getPublicProjectBySlug(slug);
}
