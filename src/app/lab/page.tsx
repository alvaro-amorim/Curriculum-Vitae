import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Arcade — Álvaro Amorim",
  },
  description:
    "Arcade Hub com Runtime Runner, Bug Maze, Code Snake e Stack Tetris jogáveis, modo foco, score local e módulos de treino fora da vitrine principal.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Arcade — Álvaro Amorim",
    description: "Arcade Hub com quatro jogos jogáveis, modo foco, score local sem ranking real e módulos de treino fora da vitrine principal.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLab />;
}
