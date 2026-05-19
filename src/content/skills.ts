import type { LocalizedText, Skill, SkillDomain, SkillLevel } from "@/types/portfolio";

export const skills: Skill[] = [
  {
    name: "JavaScript",
    category: "front",
    domain: "front",
    level: "practical",
    evidence: {
      pt: "Base recorrente em interfaces web e fluxos de produto.",
      en: "Recurring base for web interfaces and product flows.",
    },
  },
  {
    name: "TypeScript",
    category: "front",
    domain: "front",
    level: "practical",
    evidence: {
      pt: "Uso em aplicações React, Next.js e projetos full stack.",
      en: "Used in React, Next.js, and full stack projects.",
    },
  },
  {
    name: "HTML5",
    category: "front",
    domain: "front",
    level: "practical",
    evidence: {
      pt: "Estruturação de páginas, currículos digitais e interfaces responsivas.",
      en: "Page structure, digital resumes, and responsive interfaces.",
    },
  },
  {
    name: "CSS3",
    category: "front",
    domain: "front",
    level: "practical",
    evidence: {
      pt: "Layout responsivo, temas e microinterações leves.",
      en: "Responsive layout, themes, and light microinteractions.",
    },
  },
  {
    name: "React",
    category: "front",
    domain: "front",
    level: "practical",
    evidence: {
      pt: "Base principal dos produtos e dashboards apresentados.",
      en: "Main base for the products and dashboards presented.",
    },
  },
  {
    name: "Next.js",
    category: "front",
    domain: "front",
    level: "practical",
    evidence: {
      pt: "Aplicações com App Router, rotas públicas e organização por componentes.",
      en: "Applications with App Router, public routes, and component organization.",
    },
  },
  {
    name: "Tailwind CSS",
    category: "front",
    domain: "front",
    level: "project",
    evidence: {
      pt: "Design system enxuto, responsividade e consistência visual.",
      en: "Lean design system, responsiveness, and visual consistency.",
    },
  },
  {
    name: "UI Libraries",
    category: "front",
    domain: "front",
    level: "project",
    evidence: {
      pt: "Composição de interfaces com componentes reutilizáveis.",
      en: "Interface composition with reusable components.",
    },
  },
  {
    name: "Node.js",
    category: "back",
    domain: "back",
    level: "project",
    evidence: {
      pt: "Serviços, integrações e rotas de apoio em produtos web.",
      en: "Services, integrations, and support routes in web products.",
    },
  },
  {
    name: "Python",
    category: "back",
    domain: "back",
    level: "project",
    evidence: {
      pt: "Uso em automações, processamento e desafios técnicos.",
      en: "Used in automation, processing, and technical challenges.",
    },
  },
  {
    name: "REST APIs",
    category: "back",
    domain: "back",
    level: "project",
    evidence: {
      pt: "Integração entre front-end, serviços externos e produtos próprios.",
      en: "Integration between front-end, external services, and own products.",
    },
  },
  {
    name: "JWT",
    category: "back",
    domain: "back",
    level: "foundation",
    evidence: {
      pt: "Base conceitual para autenticação e controle de sessão.",
      en: "Conceptual base for authentication and session control.",
    },
  },
  {
    name: "OAuth",
    category: "back",
    domain: "back",
    level: "foundation",
    evidence: {
      pt: "Base conceitual para fluxos de autenticação externos.",
      en: "Conceptual base for external authentication flows.",
    },
  },
  {
    name: "MySQL",
    category: "back",
    domain: "database",
    level: "foundation",
    evidence: {
      pt: "Base relacional aplicada em estudos e modelagem.",
      en: "Relational base applied in study and modeling.",
    },
  },
  {
    name: "PostgreSQL",
    category: "back",
    domain: "database",
    level: "project",
    evidence: {
      pt: "Banco relacional em projetos com Supabase e Prisma.",
      en: "Relational database in projects with Supabase and Prisma.",
    },
  },
  {
    name: "MongoDB",
    category: "back",
    domain: "database",
    level: "project",
    evidence: {
      pt: "Uso em projeto de catálogo e dashboard operacional.",
      en: "Used in catalog and operational dashboard project.",
    },
  },
  {
    name: "Prisma",
    category: "back",
    domain: "database",
    level: "project",
    evidence: {
      pt: "Modelagem e acesso a dados em aplicações SaaS.",
      en: "Data modeling and access in SaaS applications.",
    },
  },
  {
    name: "Supabase",
    category: "back",
    domain: "database",
    level: "project",
    evidence: {
      pt: "Auth, dados e isolamento por RLS em projetos reais.",
      en: "Auth, data, and RLS isolation in real projects.",
    },
  },
  {
    name: "Git",
    category: "devops",
    domain: "devops",
    level: "practical",
    evidence: {
      pt: "Controle de versão, checkpoints e fluxo incremental.",
      en: "Version control, checkpoints, and incremental workflow.",
    },
  },
  {
    name: "GitHub",
    category: "devops",
    domain: "devops",
    level: "practical",
    evidence: {
      pt: "Repositórios, colaboração e entrega de projetos.",
      en: "Repositories, collaboration, and project delivery.",
    },
  },
  {
    name: "Docker",
    category: "devops",
    domain: "devops",
    level: "learning",
    evidence: {
      pt: "Aprimoramento para ambientes locais e empacotamento.",
      en: "Improving for local environments and packaging.",
    },
  },
  {
    name: "AWS",
    category: "devops",
    domain: "devops",
    level: "learning",
    evidence: {
      pt: "Aprimoramento em infraestrutura cloud e serviços gerenciados.",
      en: "Improving cloud infrastructure and managed services knowledge.",
    },
  },
  {
    name: "CI/CD",
    category: "devops",
    domain: "devops",
    level: "learning",
    evidence: {
      pt: "Aprimoramento em validação automatizada e entrega contínua.",
      en: "Improving automated validation and continuous delivery.",
    },
  },
  {
    name: "Vercel",
    category: "devops",
    domain: "devops",
    level: "project",
    evidence: {
      pt: "Deploy e validação de aplicações front-end e full stack.",
      en: "Deploy and validation of front-end and full stack applications.",
    },
  },
  {
    name: "Scrum",
    category: "other",
    domain: "product",
    level: "foundation",
    evidence: {
      pt: "Base de organização de fluxo, backlog e comunicação de entrega.",
      en: "Base for workflow, backlog, and delivery communication.",
    },
  },
  {
    name: "AI Tools",
    category: "other",
    domain: "ai",
    level: "project",
    evidence: {
      pt: "Apoio a automações, geração assistida e produtos com IA.",
      en: "Support for automation, assisted generation, and AI products.",
    },
  },
  {
    name: "LLMs",
    category: "other",
    domain: "ai",
    level: "project",
    evidence: {
      pt: "Integrações e fluxos aplicados em produtos e desafios.",
      en: "Integrations and flows applied in products and challenges.",
    },
  },
  {
    name: "Codex",
    category: "other",
    domain: "ai",
    level: "project",
    evidence: {
      pt: "Uso como apoio a engenharia, revisão e evolução incremental.",
      en: "Used as support for engineering, review, and incremental evolution.",
    },
  },
];

export const skillDomainLabels: Record<SkillDomain, LocalizedText> = {
  front: {
    pt: "Front-end",
    en: "Front-end",
  },
  back: {
    pt: "Back-end",
    en: "Back-end",
  },
  database: {
    pt: "Dados",
    en: "Data",
  },
  devops: {
    pt: "DevOps",
    en: "DevOps",
  },
  ai: {
    pt: "IA",
    en: "AI",
  },
  product: {
    pt: "Produto",
    en: "Product",
  },
};

export const skillLevelLabels: Record<SkillLevel, LocalizedText> = {
  practical: {
    pt: "Uso prático",
    en: "Practical use",
  },
  project: {
    pt: "Experiência em projeto",
    en: "Project experience",
  },
  learning: {
    pt: "Estudando/aprimorando",
    en: "Studying/improving",
  },
  foundation: {
    pt: "Base conceitual",
    en: "Conceptual foundation",
  },
};

export const skillLevels: SkillLevel[] = ["practical", "project", "learning", "foundation"];

export const skillDomains: SkillDomain[] = ["front", "back", "database", "devops", "ai", "product"];
