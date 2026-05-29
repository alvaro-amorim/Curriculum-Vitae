import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Arcade — Álvaro Amorim",
  },
  description:
    "Arcade Hub com Runtime Runner, Bug Maze expandido, Code Snake com paredes opcionais, Stack Tetris jogável, modo foco, gestos mobile e treinos antigos fora da UI principal.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Arcade — Álvaro Amorim",
    description:
      "Arcade Hub com quatro jogos jogáveis, Code Snake com wrap-around, Bug Maze expandido, gestos mobile, score local sem ranking real e treinos antigos fora da UI principal.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLab />;
}
