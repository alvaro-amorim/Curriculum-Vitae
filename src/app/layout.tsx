import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { profile } from "@/content/profile";
import { APP_NAME, SITE_URL } from "@/lib/constants";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const defaultDescription =
  "Álvaro Amorim — Desenvolvedor Full Stack focado em aplicações web, SaaS, automações e integrações com IA.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: APP_NAME,
  title: {
    default: "Álvaro Amorim — Desenvolvedor Full Stack",
    template: "%s | Álvaro Amorim",
  },
  description: defaultDescription,
  authors: [{ name: profile.shortName, url: SITE_URL }],
  creator: profile.shortName,
  publisher: profile.shortName,
  keywords: ["Álvaro Amorim", "Desenvolvedor Full Stack", "Next.js", "React", "TypeScript", "SaaS", "IA", "Portfólio"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Álvaro Amorim — Desenvolvedor Full Stack",
    description: defaultDescription,
    siteName: APP_NAME,
    type: "website",
    locale: "pt_BR",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Álvaro Amorim — Desenvolvedor Full Stack",
    description: defaultDescription,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { color: "#050914", media: "(prefers-color-scheme: dark)" },
    { color: "#f5f7fb", media: "(prefers-color-scheme: light)" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable}`} data-theme="dark" lang="pt-BR" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
