import { projects as staticProjects } from "@/content/projects";
import type { Locale, Project } from "@/types/portfolio";

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
  logo?: string | null;
  logoAlt?: Record<Locale, string>;
};

type ProjectShowcaseOptions = {
  slug: string;
  title: string;
  category: Record<Locale, string>;
  description: Record<Locale, string>;
  projectIconKey: HomeProjectIconKey;
  brandLabel: string;
  brandAccent: HomeProjectAccent;
  carouselStack: string[];
};

function requireProject(projectsBySlug: Map<string, Project>, slug: string): Project {
  const project = projectsBySlug.get(slug);

  if (!project) {
    throw new Error(`Missing project content for Home showcase: ${slug}`);
  }

  return project;
}

function createProjectShowcase(projectsBySlug: Map<string, Project>, options: ProjectShowcaseOptions): HomeProject {
  const project = requireProject(projectsBySlug, options.slug);

  return {
    title: options.title,
    category: options.category,
    description: options.description,
    projectIconKey: options.projectIconKey,
    brandLabel: options.brandLabel,
    brandAccent: options.brandAccent,
    carouselStack: options.carouselStack,
    caseHref: `/projetos/${project.slug}`,
    liveHref: project.links.website,
    logo: project.visuals?.logo ?? null,
    logoAlt: project.visuals?.logoAlt ?? project.title,
  };
}

const projectShowcases: ProjectShowcaseOptions[] = [
  {
    slug: "margem-app",
    title: "Margem App",
    category: { pt: "SaaS • FoodTech", en: "SaaS • FoodTech" },
    description: {
      pt: "Gestão, precificação e rotulagem para negócios de alimentação.",
      en: "Management, pricing and labeling for food businesses.",
    },
    projectIconKey: "margem",
    brandLabel: "MG",
    brandAccent: "blue-purple",
    carouselStack: ["Next.js", "React", "TypeScript", "Supabase", "Prisma", "Tailwind CSS"],
  },
  {
    slug: "comerc-ias",
    title: "Comerc IAs",
    category: { pt: "Institucional • Métricas", en: "Website • Metrics" },
    description: {
      pt: "Site institucional com área administrativa e acompanhamento de métricas.",
      en: "Institutional website with an admin area and metrics tracking.",
    },
    projectIconKey: "comerc",
    brandLabel: "CI",
    brandAccent: "violet-cyan",
    carouselStack: ["React", "TypeScript", "Bootstrap", "Node.js", "Supabase"],
  },
  {
    slug: "gdash-dashboard",
    title: "GDASH Dashboard",
    category: { pt: "Dados • Monitoramento", en: "Data • Monitoring" },
    description: {
      pt: "Monitoramento climático orientado a eventos com pipeline de dados e métricas.",
      en: "Event-driven climate monitoring with a data pipeline and metrics.",
    },
    projectIconKey: "gdash",
    brandLabel: "GD",
    brandAccent: "emerald-teal",
    carouselStack: ["React", "Python", "RabbitMQ", "Go", "Tailwind CSS"],
  },
  {
    slug: "sdr-expert-crm",
    title: "SDR Expert CRM",
    category: { pt: "CRM • IA", en: "CRM • AI" },
    description: {
      pt: "Mini CRM para SDRs com pipeline comercial, campanhas com IA e isolamento por workspace.",
      en: "Mini CRM for SDR teams with a sales pipeline, AI campaigns and workspace isolation.",
    },
    projectIconKey: "sdr",
    brandLabel: "SDR",
    brandAccent: "rose-indigo",
    carouselStack: ["React", "TypeScript", "Vite", "Supabase", "PostgreSQL"],
  },
];

export function createHomeProjects(publicProjects: readonly Project[] = staticProjects): HomeProject[] {
  const projectsBySlug = new Map(publicProjects.map((project) => [project.slug, project]));

  return [
    ...projectShowcases.map((project) => createProjectShowcase(projectsBySlug, project)),
  {
    title: "Developer Arcade",
    category: { pt: "Lab • Gamificação", en: "Lab • Gamification" },
    description: {
      pt: "Lab interativo de desafios técnicos com sessão anônima e ranking persistente.",
      en: "Interactive technical challenge lab with anonymous sessions and persistent rankings.",
    },
    projectIconKey: "arcade",
    brandLabel: "LAB",
    brandAccent: "amber-pink",
    carouselStack: ["Next.js", "React", "TypeScript", "Supabase", "Tailwind CSS"],
    caseHref: "/lab",
  },
  {
    title: "Portfolio OS",
    category: { pt: "Portfólio • Produto", en: "Portfolio • Product" },
    description: {
      pt: "Portfólio modular com temas, conteúdo bilíngue, projetos e Developer Arcade.",
      en: "Modular portfolio with themes, bilingual content, projects and Developer Arcade.",
    },
    projectIconKey: "portfolio-os",
    brandLabel: "OS",
    brandAccent: "sky-purple",
    carouselStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"],
    caseHref: "/",
  },
  ];
}

export const homeProjects: HomeProject[] = createHomeProjects();
