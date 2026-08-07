import type { Metadata } from "next";

import { ProjectsIndex } from "@/components/projects/projects-index";
import { getCuratedPublicProjects } from "@/lib/projects/public-catalog";

export const dynamic = "force-dynamic";

const pageTitle = "Projetos — Álvaro Amorim";
const pageDescription = "Projetos principais e laboratórios técnicos de Álvaro Amorim, com contexto, solução, stack, desafios, limites e links reais.";

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: {
    canonical: "/projetos",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/projetos",
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: pageDescription,
  },
};

export default async function ProjectsPage() {
  const projects = await getCuratedPublicProjects();
  return <ProjectsIndex projects={projects} />;
}
