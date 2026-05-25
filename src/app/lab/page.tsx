import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Arcade — Álvaro Amorim",
  },
  description:
    "Developer Arcade com Runtime Runner, Bug Maze, Debug Arena e Latency Lab, score local e módulos de treino técnico.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Arcade — Álvaro Amorim",
    description: "Quatro jogos reais do Developer Arcade com score local, sem ranking real ou persistência.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLab />;
}
