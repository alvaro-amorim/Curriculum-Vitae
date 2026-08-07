import type { Metadata } from "next";

import { ProjectsIndex } from "@/components/projects/projects-index";
import { getCuratedPublicProjects } from "@/lib/projects/public-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Projetos — Álvaro Amorim",
  },
  description: "Projetos principais e laboratórios técnicos de Álvaro Amorim, com contexto, solução, stack, desafios, limites e links reais.",
  alternates: {
    canonical: "/projetos",
  },
  openGraph: {
    title: "Projetos — Álvaro Amorim",
    description: "Produtos selecionados e laboratórios técnicos com contexto, solução, stack, desafios e links reais.",
    url: "/projetos",
  },
};

export default async function ProjectsPage() {
  const projects = await getCuratedPublicProjects();
  return <ProjectsIndex projects={projects} />;
}
