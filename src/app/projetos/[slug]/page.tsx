import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectCaseStudy } from "@/components/projects/project-case-study";
import { getProjectBySlug, projects } from "@/content/projects";

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
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Projeto não encontrado",
    };
  }

  return {
    title: {
      absolute: `${project.title.pt} | Case Study — Álvaro Amorim`,
    },
    description: project.shortDescription.pt,
    alternates: {
      canonical: `/projetos/${project.slug}`,
    },
    openGraph: {
      title: `${project.title.pt} — Case Study`,
      description: project.shortDescription.pt,
      type: "article",
      url: `/projetos/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectCaseStudy project={project} />;
}
