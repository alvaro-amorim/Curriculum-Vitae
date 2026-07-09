"use client";

import type { CSSProperties, ElementType, MouseEvent, ReactNode, SVGProps, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { profile } from "@/content/profile";
import type { Locale } from "@/types/portfolio";

import styles from "./visual-final-candidate.module.css";

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;
type ProjectIconKey = "margem" | "comerc" | "gdash" | "sdr" | "arcade" | "portfolio-os";
type Accent = "blue-purple" | "amber-pink" | "emerald-teal" | "rose-indigo" | "violet-cyan" | "sky-purple";
type IconName =
  | "activity"
  | "arrow"
  | "bar-chart"
  | "bot"
  | "brain"
  | "code"
  | "compass"
  | "external"
  | "gamepad"
  | "github"
  | "layout"
  | "layers"
  | "line-chart"
  | "mail"
  | "palette"
  | "rocket"
  | "shield"
  | "sparkles"
  | "trophy"
  | "user"
  | "users"
  | "zap";

type HomeProject = {
  title: string;
  category: Record<Locale, string>;
  description: Record<Locale, string>;
  projectIconKey: ProjectIconKey;
  brandLabel: string;
  brandAccent: Accent;
  carouselStack: string[];
  caseHref: string;
  liveHref?: string;
};

const AUTO_MS = 7000;
const FIRST_AUTO_MS = 30000;

const copy = {
  pt: {
    available: "DISPONÍVEL PARA NOVOS DESAFIOS",
    titleA: "Transformo ideias",
    titleBPrefix: "em",
    titleBHighlight: "produtos digitais",
    subtitle:
      "Desenvolvo aplicações completas, automações e experiências com IA que geram valor real para negócios e pessoas.",
    primary: "Ver projetos",
    secondary: "Currículo",
    lab: "Lab interativo com ranking real",
    featured: "PROJETO EM DESTAQUE",
    previous: "Anterior",
    next: "Próximo",
    viewCase: "Ver estudo",
    openSite: "Abrir site",
    scroll: "ROLE PARA EXPLORAR",
    capability: [
      ["Aplicações completas", "Produtos web escaláveis", "code"],
      ["Automações", "Fluxos que economizam tempo", "zap"],
      ["IA aplicada", "Inteligência com propósito", "brain"],
      ["Dados e métricas", "Decisões mais claras", "line-chart"],
      ["Segurança", "Proteção desde a base", "shield"],
    ],
    capabilityMobile: [
      ["Aplicações", "Produtos web", "code"],
      ["Automações", "Fluxos inteligentes", "zap"],
      ["IA", "Uso prático", "brain"],
      ["Dados", "Decisões claras", "line-chart"],
      ["Segurança", "Base protegida", "shield"],
    ],
    projectsEyebrow: "PROJETOS EM DESTAQUE",
    projectsTitle: "Produtos construídos do conceito à entrega.",
    projectsIntro: "Projetos reais com contexto, stack e decisão técnica.",
    stackEyebrow: "STACK APLICADA",
    stackTitle: "Ferramentas que trabalham juntas.",
    stackIntro: "Tecnologias escolhidas com critério para resolver problemas reais.",
    processEyebrow: "PROCESSO DE CONSTRUÇÃO",
    processTitle: "Como eu trabalho.",
    arcadeEyebrow: "DEVELOPER ARCADE",
    arcadeTitle: "Um lab com ranking real.",
    arcadeIntro: "Desafios técnicos curtos, jogáveis no navegador, com leaderboard ao vivo.",
    aboutEyebrow: "SOBRE",
    aboutTitle: "Construo produtos que funcionam de verdade.",
    aboutText: "Sou desenvolvedor Full Stack focado em produtos web, automações, dados e IA aplicada.",
    finalTitle: "Vamos construir algo útil?",
    finalSubtitle: "Se você tem uma ideia, um produto em andamento ou um problema que merece uma solução bem feita — vamos conversar.",
    allProjects: "Ver todos",
    openLab: "Entrar no Arcade",
    contact: "Entrar em contato",
    stackDetails: {
      next: "App Router, RSC e edge",
      react: "Interfaces componíveis",
      typescript: "Type-safety ponta a ponta",
      tailwind: "Design system rápido",
      supabase: "Auth, dados e realtime",
      prisma: "ORM type-safe",
      postgres: "Banco relacional sólido",
      node: "APIs e serviços",
      python: "Automação e IA",
      go: "Serviços de performance",
      rabbitmq: "Eventos e mensageria",
      vite: "DX moderno",
    },
    processSteps: [
      ["Descoberta", "Entender o problema, o público e o contexto antes de qualquer linha de código.", "compass"],
      ["Arquitetura", "Decisões técnicas claras: dados, fluxos, integrações e trade-offs.", "layers"],
      ["Interface", "Design system funcional, foco em clareza e velocidade de iteração.", "palette"],
      ["Entrega", "Deploy contínuo, observabilidade e iteração baseada em uso real.", "rocket"],
    ],
    arcadeLeaderboard: "Top jogadores",
    arcadeLive: "ao vivo",
    arcadeYou: "você?",
    aboutStats: [
      ["6+", "Produtos em produção"],
      ["5+", "Anos construindo software"],
      ["100%", "Foco em entrega real"],
    ],
  },
  en: {
    available: "AVAILABLE FOR NEW CHALLENGES",
    titleA: "I turn ideas",
    titleBPrefix: "into",
    titleBHighlight: "digital products",
    subtitle:
      "I build full-stack applications, automations and AI experiences that create real value for businesses and people.",
    primary: "View projects",
    secondary: "Resume",
    lab: "Interactive Lab with real ranking",
    featured: "FEATURED PROJECT",
    previous: "Previous",
    next: "Next",
    viewCase: "View case",
    openSite: "Open site",
    scroll: "SCROLL TO EXPLORE",
    capability: [
      ["Full applications", "Scalable web products", "code"],
      ["Automations", "Flows that save time", "zap"],
      ["Applied AI", "Purposeful intelligence", "brain"],
      ["Data and metrics", "Clearer decisions", "line-chart"],
      ["Security", "Protection from the base", "shield"],
    ],
    capabilityMobile: [
      ["Apps", "Web products", "code"],
      ["Automation", "Smart flows", "zap"],
      ["AI", "Practical use", "brain"],
      ["Data", "Clear decisions", "line-chart"],
      ["Security", "Protected base", "shield"],
    ],
    projectsEyebrow: "FEATURED PROJECTS",
    projectsTitle: "Products built from concept to delivery.",
    projectsIntro: "Real projects with context, stack and technical decisions.",
    stackEyebrow: "APPLIED STACK",
    stackTitle: "Tools that work together.",
    stackIntro: "Technologies selected carefully to solve real problems.",
    processEyebrow: "BUILD PROCESS",
    processTitle: "How I work.",
    arcadeEyebrow: "DEVELOPER ARCADE",
    arcadeTitle: "A lab with real ranking.",
    arcadeIntro: "Short technical challenges, playable in the browser, with a live leaderboard.",
    aboutEyebrow: "ABOUT",
    aboutTitle: "I build products that actually work.",
    aboutText: "I am a Full Stack developer focused on web products, automations, data and applied AI.",
    finalTitle: "Let’s build something useful?",
    finalSubtitle: "If you have an idea, a product in progress or a problem that deserves a well-built solution — let’s talk.",
    allProjects: "View all",
    openLab: "Enter Arcade",
    contact: "Contact",
    stackDetails: {
      next: "App Router, RSC and edge",
      react: "Composable interfaces",
      typescript: "End-to-end type safety",
      tailwind: "Fast design system",
      supabase: "Auth, data and realtime",
      prisma: "Type-safe ORM",
      postgres: "Solid relational database",
      node: "APIs and services",
      python: "Automation and AI",
      go: "Performance services",
      rabbitmq: "Events and messaging",
      vite: "Modern DX",
    },
    processSteps: [
      ["Discovery", "Understanding the problem, audience and context before any line of code.", "compass"],
      ["Architecture", "Clear technical decisions: data, flows, integrations and trade-offs.", "layers"],
      ["Interface", "Functional design system focused on clarity and iteration speed.", "palette"],
      ["Delivery", "Continuous deployment, observability and iteration based on real usage.", "rocket"],
    ],
    arcadeLeaderboard: "Top players",
    arcadeLive: "live",
    arcadeYou: "you?",
    aboutStats: [
      ["6+", "Products in production"],
      ["5+", "Years building software"],
      ["100%", "Focus on real delivery"],
    ],
  },
} as const;

const projects: HomeProject[] = [
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

const accentGradient: Record<Accent, string> = {
  "blue-purple": "linear-gradient(135deg, #2563eb, #7c3aed)",
  "amber-pink": "linear-gradient(135deg, #f59e0b, #ec4899)",
  "emerald-teal": "linear-gradient(135deg, #10b981, #06b6d4)",
  "rose-indigo": "linear-gradient(135deg, #f43f5e, #6366f1)",
  "violet-cyan": "linear-gradient(135deg, #8b5cf6, #06b6d4)",
  "sky-purple": "linear-gradient(135deg, #0ea5e9, #a855f7)",
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", focusable: false, "aria-hidden": true };

  switch (name) {
    case "activity":
      return <svg {...common}><path d="M4 12h4l2-6 4 12 2-6h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "bar-chart":
      return <svg {...common}><path d="M5 19h14M7 16V9m5 7V5m5 11v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "bot":
      return <svg {...common}><path d="M12 8V4m-5 8h10M7 20h10a3 3 0 0 0 3-3v-4a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v4a3 3 0 0 0 3 3Zm2-5h.01M15 15h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "brain":
      return <svg {...common}><path d="M9 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3m0-14a3 3 0 0 1 3 3v11m-3-14v14m6-14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3m0-14a3 3 0 0 0-3 3v11m3-14v14M6 10h3m6 0h3M6 15h3m6 0h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
    case "code":
      return <svg {...common}><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2-10-4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "compass":
      return <svg {...common}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "external":
      return <svg {...common}><path d="M8 7h9v9M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "gamepad":
      return <svg {...common}><path d="M7.1 8.2h9.8c2 0 3.7 1.35 4.15 3.28l.78 3.36c.48 2.08-1.08 4.06-3.18 4.06-.86 0-1.69-.34-2.3-.95l-1.4-1.4h-5.9l-1.4 1.4c-.61.61-1.44.95-2.3.95-2.1 0-3.66-1.98-3.18-4.06l.78-3.36A4.27 4.27 0 0 1 7.1 8.2Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /><path d="M8.2 11.4v3.2M6.6 13h3.2M15.55 12.25h.01M18.05 14.25h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /><path d="M10.1 8.2c.18-1.18.84-1.9 1.9-1.9s1.72.72 1.9 1.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M17.95 4.4v1.4m-.7-.7h1.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.72" /></svg>;
    case "github":
      return <svg {...common}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.6a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.8 12.8 0 0 0-6.7 0C6.7.4 5.6.7 5.6.7a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.1 3.1 6.3 6.1 6.6a3 3 0 0 0-.8 1.9V22" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "layout":
      return <svg {...common}><path d="M4 5h16v14H4V5Zm0 5h16M10 10v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "layers":
      return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Zm-7 9 7 4 7-4M5 16l7 4 7-4" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "line-chart":
      return <svg {...common}><path d="M4 19h16M6 15l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "mail":
      return <svg {...common}><path d="M4 6h16v12H4V6Zm0 1 8 6 8-6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "palette":
      return <svg {...common}><path d="M12 21a9 9 0 1 1 9-9 3 3 0 0 1-3 3h-1.5a1.5 1.5 0 0 0 0 3H17a5 5 0 0 1-5 3ZM7.5 11h.01M9.5 7.5h.01M14.5 7.5h.01M16.5 11h.01" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "rocket":
      return <svg {...common}><rect x="4.2" y="5" width="15.6" height="12.6" rx="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M4.9 8.75h14.2" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" opacity="0.66" /><path d="M9.2 13.4 12 10.6l2.8 2.8M12 10.75v5.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="m14.55 18.25 1.45 1.45 3.25-3.55" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7.1" cy="6.9" r=".52" fill="currentColor" opacity="0.72" /><circle cx="9.05" cy="6.9" r=".52" fill="currentColor" opacity="0.45" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3 5 6v5c0 4.5 2.8 8.2 7 10 4.2-1.8 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-5" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "sparkles":
      return <svg {...common}><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Zm6 12 .9 3.1L22 18l-3.1.9L18 22l-.9-3.1L14 18l3.1-.9L18 14Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "trophy":
      return <svg {...common}><path d="M8 4.5h8v4.8a4 4 0 0 1-8 0V4.5Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 6.3h3.2v1.6A3.2 3.2 0 0 1 16 11.1M8 6.3H4.8v1.6A3.2 3.2 0 0 0 8 11.1" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" opacity="0.86" /><path d="M12 13.4v3.1M8.9 20h6.2M10 16.5h4l.8 3.5H9.2l.8-3.5Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /><path d="m10.55 8.85.88.88 2.02-2.16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.1 17.2c-1.1-.75-1.85-1.78-2.25-3.1M17.9 17.2c1.1-.75 1.85-1.78 2.25-3.1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.58" /></svg>;
    case "user":
      return <svg {...common}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
    case "users":
      return <svg {...common}><path d="M16 11a3 3 0 1 0 0-6m4 15a5 5 0 0 0-6-4.9M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" /></svg>;
    case "zap":
      return <svg {...common}><path d="m13 2-8 12h6l-1 8 9-13h-6l1-7Z" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
}

type LogoProps = SVGProps<SVGSVGElement> & { className?: string };

function SvgWrap({ children, ...props }: LogoProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

function StackLogo({ name, className = styles.stackLogo }: { name: string; className?: string }) {
  switch (name) {
    case "Next.js":
      return <SvgWrap className={className}><circle cx="16" cy="16" r="14" fill="currentColor" /><path d="M10 9v14M10 9l13 14" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" /><rect x="20" y="9" width="2.2" height="9" fill="var(--background)" /></SvgWrap>;
    case "React":
      return <SvgWrap className={className}><g stroke="#61DAFB" strokeWidth="1.4"><circle cx="16" cy="16" r="2" fill="#61DAFB" /><ellipse cx="16" cy="16" rx="11" ry="4.2" /><ellipse cx="16" cy="16" rx="11" ry="4.2" transform="rotate(60 16 16)" /><ellipse cx="16" cy="16" rx="11" ry="4.2" transform="rotate(120 16 16)" /></g></SvgWrap>;
    case "TypeScript":
      return <SvgWrap className={className}><rect width="32" height="32" rx="5" fill="#3178C6" /><path d="M17.6 17.4h3.2v1.7h-2.4v6h-1.9v-6h-2.4v-1.7h3.5Zm5.4 6.8c.4.5 1.2.9 2.2.9.9 0 1.5-.4 1.5-1 0-.7-.5-1-1.7-1.4-1.6-.6-2.6-1.3-2.6-2.7 0-1.5 1.3-2.6 3.1-2.6 1.1 0 1.9.3 2.5.7l-.6 1.5c-.4-.3-1-.6-1.9-.6-.9 0-1.3.4-1.3.9 0 .6.5.9 1.8 1.4 1.7.6 2.5 1.4 2.5 2.7 0 1.5-1.2 2.7-3.4 2.7-1.2 0-2.3-.3-2.8-.7Z" fill="#fff" /></SvgWrap>;
    case "Supabase":
      return <SvgWrap className={className}><defs><linearGradient id="sbHomeLiteral" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3ECF8E" /><stop offset="1" stopColor="#249361" /></linearGradient></defs><path d="M18 3 7 17.5h8L13 29l11-14.5h-8L18 3Z" fill="url(#sbHomeLiteral)" /></SvgWrap>;
    case "Prisma":
      return <SvgWrap className={className}><path d="M11.5 4 5.1 22.6c-.2.5 0 1 .5 1.2l11.8 4.2c.6.2 1.2-.2 1.3-.8l3-19.6c0-.3-.1-.6-.4-.8L13 3.4c-.6-.3-1.3 0-1.5.6Z" fill="currentColor" /></SvgWrap>;
    case "Tailwind CSS":
    case "Tailwind":
      return <SvgWrap className={className}><path d="M16 8c-4 0-6.5 2-7.5 6 1.5-2 3.2-2.7 5.2-2.2 1.1.3 1.9 1.1 2.8 2 1.5 1.5 3.2 3.2 6.7 3.2 4 0 6.5-2 7.5-6-1.5 2-3.2 2.7-5.2 2.2-1.1-.3-1.9-1.1-2.8-2-1.5-1.5-3.2-3.2-6.7-3.2ZM8.5 17C4.5 17 2 19 1 23c1.5-2 3.2-2.7 5.2-2.2 1.1.3 1.9 1.1 2.8 2 1.5 1.5 3.2 3.2 6.7 3.2 4 0 6.5-2 7.5-6-1.5 2-3.2 2.7-5.2 2.2-1.1-.3-1.9-1.1-2.8-2-1.5-1.5-3.2-3.2-6.7-3.2Z" fill="#38BDF8" /></SvgWrap>;
    case "PostgreSQL":
      return <SvgWrap className={className}><circle cx="16" cy="16" r="13" fill="#336791" /><text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif">Pg</text></SvgWrap>;
    case "Node.js":
      return <SvgWrap className={className}><path d="M16 2 4 9v14l12 7 12-7V9L16 2Z" fill="#539E43" /><text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif">JS</text></SvgWrap>;
    case "Vite":
      return <SvgWrap className={className}><defs><linearGradient id="viteHomeLiteral" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#41D1FF" /><stop offset="1" stopColor="#BD34FE" /></linearGradient></defs><path d="M3 7 16 29 29 7l-13 4L3 7Z" fill="url(#viteHomeLiteral)" /></SvgWrap>;
    case "Python":
      return <SvgWrap className={className}><path d="M16 3c-4 0-5 2-5 4v3h5v1H7c-2 0-4 1-4 5s2 5 4 5h2v-3c0-2 1-4 4-4h7c2 0 3-1 3-3V7c0-2-1-4-7-4Zm-3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" fill="#3776AB" /><path d="M16 29c4 0 5-2 5-4v-3h-5v-1h9c2 0 4-1 4-5s-2-5-4-5h-2v3c0 2-1 4-4 4h-7c-2 0-3 1-3 3v4c0 2 1 4 7 4Zm3-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="#FFD43B" /></SvgWrap>;
    case "Go":
      return <SvgWrap className={className}><rect width="32" height="32" rx="5" fill="#00ADD8" /><text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif">Go</text></SvgWrap>;
    case "RabbitMQ":
      return <SvgWrap className={className}><rect width="32" height="32" rx="5" fill="#FF6600" /><path d="M9 9h3v6h2V9h3v6h2V9h3v8c0 1-1 2-2 2h-3v4h-3v-4H9V9Z" fill="#fff" /></SvgWrap>;
    case "Bootstrap":
      return <SvgWrap className={className}><rect width="32" height="32" rx="6" fill="#7952B3" /><text x="16" y="21" textAnchor="middle" fontSize="15" fontWeight="900" fill="#fff" fontFamily="ui-sans-serif">B</text></SvgWrap>;
    default: {
      const initials = name.split(/\s|\./).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
      return <span className={styles.stackFallback}>{initials || "•"}</span>;
    }
  }
}

function ProjectIcon({ iconKey, accent, size = "lg" }: { iconKey: ProjectIconKey; accent: Accent; size?: "sm" | "lg" }) {
  const iconName: Record<ProjectIconKey, IconName> = {
    margem: "bar-chart",
    comerc: "bot",
    gdash: "activity",
    sdr: "users",
    arcade: "gamepad",
    "portfolio-os": "layout",
  };

  return (
    <div className={`${styles.projectIcon} ${size === "sm" ? styles.projectIconSm : ""}`} style={{ "--accent-gradient": accentGradient[accent] } as StyleVars}>
      <div />
      <span>
        <Icon name={iconName[iconKey]} />
      </span>
    </div>
  );
}

function useReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: { children: ReactNode; as?: ElementType; className?: string; delay?: number }) {
  return (
    <Tag className={className} data-reveal style={{ "--delay": `${delay}ms` } as StyleVars}>
      {children}
    </Tag>
  );
}

function ProjectCarousel({ locale }: { locale: Locale }) {
  const [idx, setIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = projects.length;
  const touchX = useRef<number | null>(null);
  const t = copy[locale];
  const activeProject = projects[idx];
  const progressMs = idx === 0 && key === 0 ? FIRST_AUTO_MS : AUTO_MS;

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      setIdx((current) => (current + 1) % total);
      setKey((current) => current + 1);
    }, progressMs);

    return () => window.clearTimeout(timer);
  }, [idx, paused, progressMs, total]);

  function go(direction: 1 | -1) {
    setIdx((current) => (current + direction + total) % total);
    setKey((current) => current + 1);
  }

  function onTouchEnd(event: TouchEvent) {
    if (touchX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  }

  return (
    <div
      className={styles.carousel}
      data-reveal
      onBlurCapture={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchX.current = event.touches[0].clientX;
      }}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.carouselGlow} aria-hidden="true" />
      <div className={styles.carouselHeader}>
        <span>{t.featured}</span>
        <small>
          <strong>{String(idx + 1).padStart(2, "0")}</strong> / {String(total).padStart(2, "0")}
        </small>
      </div>

      <div className={styles.carouselBody}>
        {projects.map((project, index) => (
          <article
            aria-hidden={index !== idx}
            className={styles.carouselSlide}
            data-active={index === idx ? "true" : "false"}
            key={project.title}
          >
            <div className={styles.projectSummary}>
              <ProjectIcon iconKey={project.projectIconKey} accent={project.brandAccent} />
              <h3>{project.title}</h3>
              <p>{project.description[locale]}</p>
            </div>

            <div className={styles.stackVisual}>
              <svg viewBox="0 0 400 300" aria-hidden="true">
                <circle cx="200" cy="150" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                <circle cx="200" cy="150" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                <circle cx="200" cy="150" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
              </svg>
              <div className={styles.stackGrid}>
                {project.carouselStack.slice(0, 6).map((tech, techIndex) => (
                  <div
                    className={styles.stackCard}
                    key={tech}
                    style={{ "--item": techIndex } as StyleVars}
                  >
                    <StackLogo name={tech} />
                    <span>{tech}</span>
                  </div>
                ))}
                {project.carouselStack.length > 4 ? (
                  <div className={styles.stackMore} aria-hidden="true">
                    +{project.carouselStack.length - 4}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <button className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`} type="button" aria-label={t.previous} onClick={() => go(-1)}>
        ‹
      </button>
      <button className={`${styles.carouselArrow} ${styles.carouselArrowNext}`} type="button" aria-label={t.next} onClick={() => go(1)}>
        ›
      </button>

      <div className={styles.carouselFooter}>
        <div className={styles.progressBar}>
          {projects.map((_, index) => (
            <button
              aria-label={`${t.featured} ${index + 1}`}
              data-active={index === idx ? "true" : "false"}
              key={index}
              onClick={() => {
                setIdx(index);
                setKey((current) => current + 1);
              }}
              type="button"
            >
              {index === idx && !paused ? <span key={key} style={{ animationDuration: `${progressMs}ms` }} /> : null}
              {index === idx && paused ? <i /> : null}
              {index < idx ? <b /> : null}
            </button>
          ))}
        </div>

        <div className={styles.carouselActions}>
          <Link href={activeProject.caseHref}>{t.viewCase}</Link>
          {activeProject.liveHref ? (
            <a href={activeProject.liveHref} rel="noreferrer" target="_blank">
              {t.openSite}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FirstFold({ locale }: { locale: Locale }) {
  return (
    <div id="home" className={styles.firstFold}>
      <HeroSection locale={locale} />
      <CapabilityBar locale={locale} />
      <ScrollIndicator locale={locale} />
    </div>
  );
}

function HeroSection({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-reveal data-visible="true">
            <div className={styles.availability}>
              <span>
                <i />
                <b />
              </span>
              {t.available}
            </div>

            <h1 aria-label={`${t.titleA} ${t.titleBPrefix} ${t.titleBHighlight}`}>
              {t.titleA}{" "}
              <br />
              <span className={styles.titleLine}>
                {t.titleBPrefix} <span className={styles.titleGradient}>{t.titleBHighlight}</span>
              </span>
            </h1>

            <p>{t.subtitle}</p>

            <div className={styles.heroActions}>
              <Link href="/projetos" className={styles.primaryButton} data-cursor="primary" data-cursor-label={locale === "pt" ? "Projetos" : "Projects"}>
                <span>{t.primary}</span>
                <Icon name="arrow" />
              </Link>
              <Link href="/curriculo" className={styles.ghostButton}>
                <Icon name="user" />
                <span>{t.secondary}</span>
              </Link>
            </div>

            <Link href="/lab" className={styles.labLink}>
              <Icon name="sparkles" />
              <span>{t.lab}</span>
              <Icon name="arrow" />
            </Link>
          </div>

          <div className={styles.carouselWrap} data-reveal data-visible="true">
            <ProjectCarousel locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilityBar({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className={styles.capabilitySection}>
      <Reveal className={styles.capabilityShell}>
        <ul>
          {t.capability.map(([title, description, icon], index) => {
            const [mobileTitle, mobileDescription] = t.capabilityMobile[index];

            return (
            <li key={title} className={index !== copy[locale].capability.length - 1 ? styles.withDivider : undefined}>
              <div>
                <Icon name={icon as IconName} />
              </div>
              <span>
                <strong>
                  <span className={styles.capabilityFull}>{title}</span>
                  <span className={styles.capabilityCompact}>{mobileTitle}</span>
                </strong>
                <small>
                  <span className={styles.capabilityFull}>{description}</span>
                  <span className={styles.capabilityCompact}>{mobileDescription}</span>
                </small>
              </span>
            </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

function ScrollIndicator({ locale }: { locale: Locale }) {
  return (
    <div className={styles.scrollIndicator}>
      <div>
        <span />
      </div>
      <p>{copy[locale].scroll}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <Reveal className={styles.sectionHeading}>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      {intro ? <span>{intro}</span> : null}
    </Reveal>
  );
}

function FeaturedProjects({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="projetos" className={styles.section}>
      <SectionHeading eyebrow={t.projectsEyebrow} intro={t.projectsIntro} title={t.projectsTitle} />
      <div className={styles.featuredGrid}>
        {projects.map((project, index) => (
          <Reveal className={styles.featuredCard} key={project.title} delay={(index % 3) * 90}>
            <Link href={project.caseHref}>
              <div>
                <ProjectIcon iconKey={project.projectIconKey} accent={project.brandAccent} size="sm" />
                <span>
                  <Icon name="external" />
                </span>
              </div>
              <h3>{project.title}</h3>
              <small>{project.category[locale]}</small>
              <p>{project.description[locale]}</p>
              <div>
                {project.carouselStack.slice(0, 5).map((stack) => (
                  <em key={stack}>
                    <StackLogo name={stack} />
                    {stack}
                  </em>
                ))}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function StackSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const stackDetails = t.stackDetails;
  const stacks = [
    ["Next.js", stackDetails.next],
    ["React", stackDetails.react],
    ["TypeScript", stackDetails.typescript],
    ["Tailwind CSS", stackDetails.tailwind],
    ["Supabase", stackDetails.supabase],
    ["Prisma", stackDetails.prisma],
    ["PostgreSQL", stackDetails.postgres],
    ["Node.js", stackDetails.node],
    ["Python", stackDetails.python],
    ["Go", stackDetails.go],
    ["RabbitMQ", stackDetails.rabbitmq],
    ["Vite", stackDetails.vite],
  ];
  const marquee = [...stacks, ...stacks];

  return (
    <section id="stack" className={styles.section}>
      <SectionHeading eyebrow={t.stackEyebrow} intro={t.stackIntro} title={t.stackTitle} />
      <Reveal className={styles.marquee}>
        <span />
        <span />
        <div>
          {marquee.map(([stack], index) => (
            <article key={`${stack}-${index}`}>
              <StackLogo name={stack} />
              <strong>{stack}</strong>
            </article>
          ))}
        </div>
      </Reveal>

      <div className={styles.stackGridSection}>
        {stacks.map(([stack, desc], index) => (
          <Reveal className={styles.stackTile} key={stack} delay={(index % 4) * 60}>
            <div>
              <StackLogo name={stack} />
            </div>
            <span>
              <strong>{stack}</strong>
              <small>{desc}</small>
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProcessSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const steps = t.processSteps;

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow={t.processEyebrow} title={t.processTitle} />
      <ol className={styles.processGrid}>
        {steps.map(([title, desc, icon], index) => (
          <Reveal as="li" delay={index * 90} key={`process-step-${index}-${icon}`}>
            <div>
              <span>
                <Icon name={icon as IconName} />
              </span>
              <strong>0{index + 1}</strong>
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <i />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function ArcadeSection({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const rows = [
    ["lena.codes", 9820],
    ["marcos.dev", 8740],
    [t.arcadeYou, 7920],
    ["aria.ts", 7110],
    ["bruno.io", 6480],
  ];
  const max = rows[0][1] as number;

  return (
    <section id="arcade" className={styles.arcadeSection}>
      <Reveal className={styles.arcadeShell}>
        <div className={styles.arcadeGlowA} aria-hidden="true" />
        <div className={styles.arcadeGlowB} aria-hidden="true" />
        <div className={styles.arcadeGrid}>
          <div>
            <span className={styles.badge}>
              <Icon name="gamepad" />
              {t.arcadeEyebrow}
            </span>
            <h2>{t.arcadeTitle}</h2>
            <p>{t.arcadeIntro}</p>
            <Link href="/lab" className={styles.primaryButton}>
              {t.openLab}
              <Icon name="arrow" />
            </Link>
          </div>

          <aside>
            <div>
              <strong>
                <Icon name="trophy" />
                {t.arcadeLeaderboard}
              </strong>
              <span>{t.arcadeLive}</span>
            </div>
            <ul>
              {rows.map(([name, score], index) => {
                const isCurrentUser = name === t.arcadeYou;

                return (
                  <li
                    className={isCurrentUser ? styles.leaderboardUserRow : undefined}
                    data-you={isCurrentUser ? "true" : "false"}
                    key={name}
                    style={{ "--score": `${((score as number) / max) * 100}%` } as StyleVars}
                  >
                    <span>{index + 1}</span>
                    <strong>{name}</strong>
                    <small>{String(score).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</small>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}

function AboutSection({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="sobre" className={styles.aboutSection}>
      <div className={styles.aboutGrid}>
        <Reveal>
          <div className={styles.aboutVisual}>
            <span>Á</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p>{t.aboutEyebrow}</p>
          <h2>{t.aboutTitle}</h2>
          <span>{t.aboutText}</span>
          <div className={styles.aboutStats}>
            {t.aboutStats.map(([value, label]) => (
              <article key={label}>
                <strong>{value}</strong>
                <small>{label}</small>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className={styles.finalSection}>
      <Reveal className={styles.finalShell}>
        <div />
        <h2>{t.finalTitle}</h2>
        <p>{t.finalSubtitle}</p>
        <nav>
          <Link href="/projetos" className={styles.primaryButton}>
            {t.primary}
            <Icon name="arrow" />
          </Link>
          <a href={`mailto:${profile.email}`} className={styles.ghostButton}>
            <Icon name="mail" />
            {t.contact}
          </a>
        </nav>
      </Reveal>
    </section>
  );
}

export function VisualFinalCandidate() {
  const ref = useRef<HTMLElement>(null);
  const { locale } = usePortfolioUi();
  useReveal();

  function onMove(event: MouseEvent<HTMLElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--hx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    element.style.setProperty("--hy", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <main className={styles.home} data-lovable-home onMouseMove={onMove} ref={ref} style={{ "--hx": "50%", "--hy": "0%" } as StyleVars}>
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.radialBg} aria-hidden="true" />
      <div className={styles.spotlight} aria-hidden="true" />
      <div className={styles.orbA} aria-hidden="true" />
      <div className={styles.orbB} aria-hidden="true" />

      <FirstFold locale={locale} />
      <FeaturedProjects locale={locale} />
      <StackSection locale={locale} />
      <ProcessSection locale={locale} />
      <ArcadeSection locale={locale} />
      <AboutSection locale={locale} />
      <FinalCta locale={locale} />
    </main>
  );
}
