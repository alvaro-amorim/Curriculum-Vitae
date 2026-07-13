import type { Metadata } from "next";

import { DeveloperLabV2 } from "@/components/lab/developer-lab-v2";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Arcade — Álvaro Amorim",
  },
  description:
    "Developer Arcade com quatro jogos técnicos, sessão anônima, score persistente, ranking por melhor resultado e experiência otimizada para desktop e mobile.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Arcade — Álvaro Amorim",
    description:
      "Jogue Runtime Runner, Bug Maze, Code Snake e Stack Tetris, registre seu melhor score e acompanhe sua posição no ranking.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLabV2 />;
}
