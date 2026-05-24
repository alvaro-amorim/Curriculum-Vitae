import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Arcade — Álvaro Amorim",
  },
  description: "Developer Arcade com Runtime Runner, Bug Maze, score local e módulos de treino técnico em depuração, arquitetura e performance.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Arcade — Álvaro Amorim",
    description: "Runtime Runner e Bug Maze jogáveis com score local, sem ranking real ou persistência.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLab />;
}
