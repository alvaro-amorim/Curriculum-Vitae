import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { SITE_URL } from "@/lib/constants";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Álvaro Amorim - Desenvolvedor Full Stack",
  description:
    "Currículo e portfólio digital de Álvaro Amorim, desenvolvedor Full Stack com foco em aplicações web, produtos SaaS, automações e integrações com IA.",
  openGraph: {
    title: "Álvaro Amorim - Desenvolvedor Full Stack",
    description:
      "Currículo e portfólio digital de Álvaro Amorim, desenvolvedor Full Stack com foco em aplicações web, produtos SaaS, automações e integrações com IA.",
    type: "website",
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-theme="dark" lang="pt-BR" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
