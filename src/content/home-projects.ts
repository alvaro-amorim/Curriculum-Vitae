import type { Locale } from "@/types/portfolio";

export type HomeProjectIconKey = "margem" | "comerc" | "gdash" | "sdr" | "arcade" | "portfolio-os";
export type HomeProjectAccent = "blue-purple" | "amber-pink" | "emerald-teal" | "rose-indigo" | "violet-cyan" | "sky-purple";

export type HomeProject = {
  title: string;
  category: Record<Locale, string>;
  description: Record<Locale, string>;
  projectIconKey: HomeProjectIconKey;
  brandLabel: string;
  brandAccent: HomeProjectAccent;
  carouselStack: string[];
  caseHref: string;
  liveHref?: string;
};

export const homeProjects: HomeProject[] = [
  {
    title: "Margem App",
    category: { pt: "SaaS • FoodTech", en: "SaaS • FoodTech" },
    description: {
      pt: "App de precificação inteligente de receitas com foco em clareza e ação.",
      en: "Smart recipe pricing app focused on clarity and action.",
    },
    projectIconKey: "margem",
    brandLabel: "MG",
    brandAccent: "blue-purple",
    carouselStack: ["Next.js", "React", "TypeScript", "Supabase", "Prisma", "Tailwind CSS"],
    caseHref: "/projetos/margem-app",
    liveHref: "https://margemapp.com.br/",
  },
  {
    title: "Comerc IAs",
    category: { pt: "AI • Vendas", en: "AI • Sales" },
    description: {
      pt: "Plataforma de agentes de IA para automatizar prospecção e qualificação comercial.",
      en: "AI agent platform to automate prospecting and commercial qualification.",
    },
    projectIconKey: "comerc",
    brandLabel: "CI",
    brandAccent: "violet-cyan",
    carouselStack: ["Next.js", "TypeScript", "Python", "PostgreSQL", "RabbitMQ"],
    caseHref: "/projetos/comerc-ias",
    liveHref: "https://www.comercias.com.br/",
  },
  {
    title: "GDASH Dashboard",
    category: { pt: "Analytics • B2B", en: "Analytics • B2B" },
    description: {
      pt: "Dashboard analítico em tempo real com métricas operacionais para times de operação.",
      en: "Real-time analytics dashboard with operational metrics for teams.",
    },
    projectIconKey: "gdash",
    brandLabel: "GD",
    brandAccent: "emerald-teal",
    carouselStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    caseHref: "/projetos/gdash-dashboard",
    liveHref: "https://gdash.comercias.com.br",
  },
  {
    title: "SDR Expert CRM",
    category: { pt: "CRM • Sales", en: "CRM • Sales" },
    description: {
      pt: "CRM focado em SDRs com cadências automáticas e visão clara de pipeline.",
      en: "CRM for SDR teams with automated cadences and a clear pipeline view.",
    },
    projectIconKey: "sdr",
    brandLabel: "SDR",
    brandAccent: "rose-indigo",
    carouselStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS"],
    caseHref: "/projetos/sdr-expert-crm",
    liveHref: "https://sdr-crm-ai-wine.vercel.app/",
  },
  {
    title: "Developer Arcade",
    category: { pt: "Lab • Gamificação", en: "Lab • Gamification" },
    description: {
      pt: "Lab interativo de desafios técnicos com ranking real e telemetria de jogadores.",
      en: "Interactive technical challenge lab with real ranking and player telemetry.",
    },
    projectIconKey: "arcade",
    brandLabel: "LAB",
    brandAccent: "amber-pink",
    carouselStack: ["React", "TypeScript", "Vite", "Supabase", "Tailwind CSS"],
    caseHref: "/lab",
  },
  {
    title: "Portfolio OS",
    category: { pt: "Portfolio • Design", en: "Portfolio • Design" },
    description: {
      pt: "Sistema modular para portfólio de dev, com temas e seções configuráveis.",
      en: "Modular portfolio system with configurable themes and sections.",
    },
    projectIconKey: "portfolio-os",
    brandLabel: "OS",
    brandAccent: "sky-purple",
    carouselStack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    caseHref: "/",
  },
];
