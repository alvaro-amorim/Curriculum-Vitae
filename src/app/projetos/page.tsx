import type { Metadata } from "next";

import { ProjectsIndex } from "@/components/projects/projects-index";

export const metadata: Metadata = {
  title: "Projetos | Case Studies - Álvaro Amorim",
  description: "Case studies dos projetos de Álvaro Amorim, com contexto, solução, stack, desafios técnicos e links reais.",
};

export default function ProjectsPage() {
  return <ProjectsIndex />;
}
