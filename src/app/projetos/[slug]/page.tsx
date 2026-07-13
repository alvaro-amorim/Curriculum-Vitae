import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ProjectCaseStudy } from "@/components/projects/project-case-study";
import { projects } from "@/content/projects";
import { getPublicProjectBySlug } from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

const loadProject = cache(getPublicProjectBySlug);

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

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);

  if (!project) {
    return {
      title: "Projeto não encontrado",
    };
  }

  return {
    title: {
      absolute: `${project.title.pt} | Estudo de projeto — Álvaro Amorim`,
    },
    description: project.shortDescription.pt,
    alternates: {
      canonical: `/projetos/${project.slug}`,
    },
    openGraph: {
      title: `${project.title.pt} — Estudo de projeto`,
      description: project.shortDescription.pt,
      type: "article",
      url: `/projetos/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await loadProject(slug);

  if (!project) {
    notFound();
  }

  return <ProjectCaseStudy project={project} />;
}
