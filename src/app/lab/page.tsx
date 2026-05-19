import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: {
    absolute: "Developer Lab — Álvaro Amorim",
  },
  description: "Mini-games técnicos de depuração, arquitetura e performance para demonstrar raciocínio prático em front-end e back-end.",
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: "Developer Lab — Álvaro Amorim",
    description: "Desafios técnicos interativos com score local, sem ranking real ou persistência.",
    url: "/lab",
  },
};

export default function LabPage() {
  return <DeveloperLab />;
}
