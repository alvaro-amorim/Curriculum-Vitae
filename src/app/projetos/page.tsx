import type { Metadata } from "next";

import { ProjectsIndex } from "@/components/projects/projects-index";
import { getPublicProjects } from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Projetos — Álvaro Amorim",
  },
  description: "Estudos visuais dos projetos de Álvaro Amorim com contexto, solução, stack, desafios técnicos e links reais.",
  alternates: {
    canonical: "/projetos",
  },
  openGraph: {
    title: "Projetos — Álvaro Amorim",
    description: "Estudos visuais com contexto, solução, stack, desafios técnicos e links reais.",
    url: "/projetos",
  },
};

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  return <ProjectsIndex projects={projects} />;
}
