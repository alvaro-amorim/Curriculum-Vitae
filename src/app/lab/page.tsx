import type { Metadata } from "next";

import { DeveloperLab } from "@/components/lab/developer-lab";

export const metadata: Metadata = {
  title: "Developer Lab | Álvaro.dev Portfolio OS",
  description: "Mini-games técnicos de depuração, arquitetura e performance no portfólio Álvaro.dev.",
};

export default function LabPage() {
  return <DeveloperLab />;
}
