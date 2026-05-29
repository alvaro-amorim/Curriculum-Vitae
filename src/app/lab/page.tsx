import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Arcade — Álvaro Amorim",
  },
  description:
    "Developer Arcade final com Runtime Runner, Bug Maze, Code Snake e Stack Tetris jogáveis, score local e módulos de treino técnico fora da vitrine principal.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Arcade — Álvaro Amorim",
    description: "Arcade final com quatro jogos jogáveis, score local sem ranking real e módulos de treino mantidos fora da vitrine principal.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLab />;
}
