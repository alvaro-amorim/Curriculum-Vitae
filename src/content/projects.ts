import type { Project, ProfileLink } from "@/types/portfolio";

export const projects: Project[] = [
  {
    slug: "margem",
    title: {
      pt: "MARGEM APP - Gestão, Precificação e Rotulagem",
      en: "MARGEM APP - Management, Pricing, and Labeling",
    },
    description: {
      pt: "Plataforma web voltada à gestão de ingredientes, fichas técnicas, precificação de receitas e rotulagem nutricional para negócios de alimentação.",
      en: "Web platform focused on ingredient management, technical sheets, recipe pricing, and nutritional labeling for food businesses.",
    },
    details: {
      pt: "Plataforma web voltada à gestão de ingredientes, fichas técnicas, precificação de receitas e rotulagem nutricional para negócios de alimentação.",
      en: "Web platform focused on ingredient management, technical sheets, recipe pricing, and nutritional labeling for food businesses.",
    },
    stack: ["Next.js", "React", "TypeScript", "Prisma", "Supabase", "PostgreSQL", "Tailwind CSS", "OpenAI", "AbacatePay"],
    highlights: {
      pt: [
        "Estruturação de fluxos de cadastro de ingredientes, receitas, precificação, billing e módulo nutricional.",
        "Implementação de snapshots, impressão e organização de dados voltada à operação do usuário.",
        "Arquitetura preparada para modelo SaaS com multi-workspace, entitlements por plano e catálogo interno.",
        "Integração de automações com IA e preparação para uso de diferentes providers externos.",
      ],
      en: [
        "Structured flows for ingredient registration, recipes, pricing, billing, and the nutritional module.",
        "Implemented snapshots, print flows, and data organization focused on daily operations.",
        "Architecture prepared for a SaaS model with multi-workspace, plan entitlements, and an internal catalog.",
        "Integrated AI automations and prepared the product for different external providers.",
      ],
    },
    website: "https://margemapp.com.br/",
  },
  {
    slug: "rivals",
    title: {
      pt: "RIVALS AI - Plataforma de Debates com IA",
      en: "RIVALS AI - AI Debate Platform",
    },
    description: {
      pt: "Rede social de entretenimento para criação, publicação e descoberta de debates gerados por IA.",
      en: "Entertainment social network for creating, publishing, and discovering AI-generated debates.",
    },
    details: {
      pt: "Rede social de entretenimento para criação, publicação e descoberta de debates gerados por IA.",
      en: "Entertainment social network for creating, publishing, and discovering AI-generated debates.",
    },
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "AbacatePay", "APIs de IA"],
    highlights: {
      pt: [
        "Desenvolvimento da arena de debates com presets, personagens customizados, streaming e veredito final.",
        "Implementação de publicação manual em feed, perfis, interações sociais e notificações.",
        "Integração de autenticação, billing, controle de tokens, health checks e painel administrativo.",
      ],
      en: [
        "Built the debate arena with presets, custom characters, streaming, and a final verdict.",
        "Implemented manual publishing to the feed, profiles, social interactions, and notifications.",
        "Integrated authentication, billing, token control, health checks, and an admin panel.",
      ],
    },
    website: "https://airivals.com.br/",
  },
  {
    slug: "sdr",
    title: {
      pt: "SDR EXPERT CRM - Pipeline Comercial com IA",
      en: "SDR EXPERT CRM - AI-Assisted SDR Pipeline",
    },
    description: {
      pt: "Mini CRM para operação de SDR com isolamento por workspace, pipeline comercial, campanhas com apoio de IA e simulador público de conversa.",
      en: "Mini CRM for SDR operations with workspace isolation, commercial pipeline, AI-assisted campaigns, and a public conversation simulator.",
    },
    details: {
      pt: "Mini CRM para operação de SDR com isolamento por workspace, pipeline comercial, campanhas com apoio de IA e simulador público de conversa.",
      en: "Mini CRM for SDR operations with workspace isolation, commercial pipeline, AI-assisted campaigns, and a public conversation simulator.",
    },
    stack: ["React 19", "TypeScript", "Vite", "Supabase", "PostgreSQL", "RLS", "Edge Functions", "OpenAI", "Zod", "Vitest"],
    highlights: {
      pt: [
        "Implementação de autenticação Supabase, workspace inicial, isolamento multi-tenant por RLS e pipeline em kanban.",
        "CRUD de leads com campos personalizados, validação por etapa e dashboard operacional com métricas.",
        "Campanhas com planejamento por IA, geração de mensagens, envio simulado com thread persistida e simulador público por token.",
      ],
      en: [
        "Implemented Supabase Auth, initial workspace setup, multi-tenant isolation through RLS, and a kanban pipeline.",
        "Built lead CRUD with custom fields, stage-based validation, and an operational dashboard with metrics.",
        "Delivered AI-assisted campaign planning and message generation through Edge Functions, simulated sending with persisted threads, and public simulator links.",
      ],
    },
    website: "https://sdr-crm-ai-wine.vercel.app/",
  },
  {
    slug: "comerc",
    title: {
      pt: "COMERC IAS - Website + Dashboard Administrativo",
      en: "COMERC IAS - Website + Admin Dashboard",
    },
    description: {
      pt: "Site institucional com área administrativa e acompanhamento de métricas.",
      en: "Institutional website with an administrative area and metrics tracking.",
    },
    details: {
      pt: "Site institucional com área administrativa e acompanhamento de métricas.",
      en: "Institutional website with an administrative area and metrics tracking.",
    },
    stack: ["TypeScript", "React", "Bootstrap", "Node.js", "Supabase"],
    highlights: {
      pt: [
        "Desenvolvimento do front-end responsivo e das páginas comerciais.",
        "Estruturação de conteúdo administrável e autenticação para área interna.",
        "Implementação de analytics de visitas, cliques e permanência.",
      ],
      en: [
        "Developed the responsive front-end and commercial pages.",
        "Structured manageable content and authentication for the internal area.",
        "Implemented analytics for visits, clicks, and time on page.",
      ],
    },
    website: "https://www.comercias.com.br/",
  },
  {
    slug: "gdash",
    title: {
      pt: "GDASH DASHBOARD - Monitoramento Climático",
      en: "GDASH DASHBOARD - Climate Monitoring",
    },
    description: {
      pt: "Aplicação full stack orientada a eventos para monitoramento climático com pipeline de dados e visualização de métricas.",
      en: "Event-driven full stack application for climate monitoring with a data pipeline and metrics visualization.",
    },
    details: {
      pt: "Aplicação full stack orientada a eventos para monitoramento climático com pipeline de dados e visualização de métricas.",
      en: "Event-driven full stack application for climate monitoring with a data pipeline and metrics visualization.",
    },
    stack: ["NestJS", "Python", "RabbitMQ", "Go", "React", "Tailwind", "Gemini API"],
    highlights: {
      pt: [
        "Arquitetura de microsserviços orientados a eventos com pipeline de dados em tempo real.",
        "Visualização de métricas para acompanhamento analítico.",
        "Geração de insights com IA via API Gemini para apoio analítico.",
      ],
      en: [
        "Event-driven microservices architecture with a real-time data pipeline.",
        "Metrics visualization for analytical monitoring.",
        "AI-generated insights through the Gemini API for analytical support.",
      ],
    },
    website: "https://gdash.comercias.com.br",
    repository: "https://github.com/alvaro-amorim/gdash-project-challenge",
  },
  {
    slug: "menu",
    title: {
      pt: "GLACÊ CONFEITARIA - Catálogo + Dashboard",
      en: "GLACÊ CONFEITARIA - Catalog + Dashboard",
    },
    description: {
      pt: "Catálogo de produtos com finalização via WhatsApp e dashboard interno com assistente de IA.",
      en: "Product catalog with checkout via WhatsApp and an internal dashboard with an AI assistant.",
    },
    details: {
      pt: "Catálogo de produtos com finalização via WhatsApp e dashboard interno com assistente de IA.",
      en: "Product catalog with checkout via WhatsApp and an internal dashboard with an AI assistant.",
    },
    stack: ["Next.js", "React", "Gemini API", "MongoDB"],
    highlights: {
      pt: [
        "Desenvolvimento de app para controle de estoque, caixa, cardápio e pedidos.",
        "Implementação de dashboard com assistente IA para geração de tarefas, análise de inconsistências e insights operacionais.",
        "Fluxo de compra simplificado com finalização via WhatsApp.",
      ],
      en: [
        "Developed an app for inventory, cash flow, menu, and order control.",
        "Implemented a dashboard with an AI assistant for task generation, inconsistency analysis, and operational insights.",
        "Streamlined purchase flow with checkout through WhatsApp.",
      ],
    },
    website: "https://cardapio-glace.vercel.app/",
  },
];

export const projectLinks: ProfileLink[] = [
  {
    label: { pt: "MARGEM APP", en: "MARGEM APP" },
    href: "https://margemapp.com.br/",
    display: "margemapp.com.br",
    kind: "project",
  },
  {
    label: { pt: "RIVALS AI", en: "RIVALS AI" },
    href: "https://airivals.com.br/",
    display: "airivals.com.br",
    kind: "project",
  },
  {
    label: { pt: "SDR EXPERT CRM", en: "SDR EXPERT CRM" },
    href: "https://sdr-crm-ai-wine.vercel.app/",
    display: "sdr-crm-ai-wine.vercel.app",
    kind: "project",
  },
  {
    label: { pt: "COMERC IAS", en: "COMERC IAS" },
    href: "https://www.comercias.com.br/",
    display: "comercias.com.br",
    kind: "project",
  },
  {
    label: { pt: "GDASH Dashboard", en: "GDASH Dashboard" },
    href: "https://gdash.comercias.com.br",
    display: "gdash.comercias.com.br",
    kind: "project",
  },
  {
    label: { pt: "GDASH Repositório", en: "GDASH Repository" },
    href: "https://github.com/alvaro-amorim/gdash-project-challenge",
    display: "github.com/alvaro-amorim/gdash-project-challenge",
    kind: "repo",
  },
  {
    label: { pt: "GLACÊ CONFEITARIA", en: "GLACÊ CONFEITARIA" },
    href: "https://cardapio-glace.vercel.app/",
    display: "cardapio-glace.vercel.app",
    kind: "project",
  },
];
