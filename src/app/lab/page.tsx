import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Arcade — Álvaro Amorim",
  },
  description: "Developer Arcade com Runtime Runner jogável, score local e módulos de treino técnico em depuração, arquitetura e performance.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Arcade — Álvaro Amorim",
    description: "Runtime Runner jogável e módulos técnicos de treino com score local, sem ranking real ou persistência.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLab />;
}
