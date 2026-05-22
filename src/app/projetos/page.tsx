import type { Metadata } from "next";

import { ProjectsIndex } from "@/components/projects/projects-index";

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

export default function ProjectsPage() {
  return <ProjectsIndex />;
}
