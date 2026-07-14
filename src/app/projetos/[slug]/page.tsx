import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ProjectCaseStudy } from "@/components/projects/project-case-study";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { SITE_URL } from "@/lib/constants";
import { getPublicProjectBySlug, getPublicProjects } from "@/lib/projects/repository";
import type { Project } from "@/types/portfolio";

export const dynamic = "force-dynamic";

const loadProject = cache(getPublicProjectBySlug);
const loadProjects = cache(getPublicProjects);

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

function absoluteHttpsUrl(source: string | null | undefined) {
  if (!source) {
    return null;
  }

  try {
    const url = new URL(source, SITE_URL);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function projectMetadataImage(project: Project) {
  return absoluteHttpsUrl(project.visuals?.heroImage)
    ?? absoluteHttpsUrl(project.visuals?.thumbnail)
    ?? absoluteHttpsUrl(profile.avatar);
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);

  if (!project) {
    return {
      title: "Projeto não encontrado",
    };
  }

  const canonical = `/projetos/${project.slug}`;
  const image = projectMetadataImage(project);

  return {
    title: {
      absolute: `${project.title.pt} | Estudo de projeto — Álvaro Amorim`,
    },
    description: project.shortDescription.pt,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${project.title.pt} — Estudo de projeto`,
      description: project.shortDescription.pt,
      images: image ? [{ alt: project.visuals?.alt.pt ?? project.title.pt, url: image }] : undefined,
      type: "article",
      url: canonical,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description: project.shortDescription.pt,
      images: image ? [image] : undefined,
      title: `${project.title.pt} — Estudo de projeto`,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, publicProjects] = await Promise.all([
    loadProject(slug),
    loadProjects(),
  ]);

  if (!project) {
    notFound();
  }

  return <ProjectCaseStudy project={project} projects={publicProjects} />;
}
