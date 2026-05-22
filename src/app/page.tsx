import type { Metadata } from "next";

import { VisualFinalCandidate } from "@/components/visual-final-candidate/visual-final-candidate";

export const metadata: Metadata = {
  title: {
    absolute: "Álvaro Amorim — Portfolio OS",
  },
  description:
    "Portfólio premium de Álvaro Amorim, Desenvolvedor Full Stack criando produtos web, SaaS, automações e integrações com IA.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Álvaro Amorim — Portfolio OS",
    description: "Experiência interativa com projetos, stacks, currículo e Developer Lab em formato de vitrine viva de produto.",
    url: "/",
  },
};

export default function HomePage() {
  return <VisualFinalCandidate />;
}
