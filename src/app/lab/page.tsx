import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Arcade — Álvaro Amorim",
  },
  description:
    "Developer Arcade em reset com Runtime Runner e Bug Maze jogáveis, Code Snake e Stack Tetris em preparação, score local e módulos de treino técnico.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Arcade — Álvaro Amorim",
    description: "Arcade em reset com dois jogos jogáveis, dois slots futuros e score local sem ranking real ou persistência.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLab />;
}
