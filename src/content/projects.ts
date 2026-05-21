import type { Project, ProfileLink } from "@/types/portfolio";

export const projects: Project[] = [
  {
    slug: "margem-app",
    title: {
      pt: "MARGEM APP",
      en: "MARGEM APP",
    },
    subtitle: {
      pt: "Gestão, precificação e rotulagem",
      en: "Management, pricing, and labeling",
    },
    shortDescription: {
      pt: "Plataforma web voltada à gestão de ingredientes, fichas técnicas, precificação de receitas e rotulagem nutricional para negócios de alimentação.",
      en: "Web platform focused on ingredient management, technical sheets, recipe pricing, and nutritional labeling for food businesses.",
    },
    fullDescription: {
      pt: "Projeto voltado à operação de negócios de alimentação, organizando fluxos de ingredientes, receitas, precificação, billing e módulo nutricional em uma experiência web estruturada.",
      en: "Project focused on food business operations, organizing ingredient, recipe, pricing, billing, and nutritional flows in a structured web experience.",
    },
    status: {
      pt: "Em produção",
      en: "In production",
    },
    category: ["SaaS", "FoodTech", "IA"],
    stack: ["Next.js", "React", "TypeScript", "Prisma", "Supabase", "PostgreSQL", "Tailwind CSS", "OpenAI", "AbacatePay"],
    problem: {
      pt: "Negócios de alimentação precisam controlar ingredientes, fichas técnicas, preços e informações nutricionais sem depender de processos manuais frágeis.",
      en: "Food businesses need to control ingredients, technical sheets, pricing, and nutritional information without relying on fragile manual processes.",
    },
    solution: {
      pt: "Uma plataforma web para centralizar cadastros, organização operacional, precificação e rotulagem, com estrutura preparada para modelo SaaS.",
      en: "A web platform to centralize records, operational organization, pricing, and labeling, with a structure prepared for a SaaS model.",
    },
    highlights: {
      pt: [
        "Fluxos de cadastro de ingredientes, receitas, precificação, billing e módulo nutricional.",
        "Snapshots, impressão e organização de dados voltada à operação do usuário.",
        "Arquitetura preparada para multi-workspace, entitlements por plano e catálogo interno.",
        "Automações com IA e preparação para uso de diferentes providers externos.",
      ],
      en: [
        "Flows for ingredient registration, recipes, pricing, billing, and nutritional module.",
        "Snapshots, print flows, and data organization focused on daily operations.",
        "Architecture prepared for multi-workspace, plan entitlements, and an internal catalog.",
        "AI automations and preparation for different external providers.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Modelar dados operacionais de ingredientes e receitas de forma reutilizável.",
        "Manter consistência entre precificação, snapshots e impressão.",
        "Preparar a arquitetura para evolução SaaS sem travar a operação atual.",
      ],
      en: [
        "Model operational ingredient and recipe data in a reusable way.",
        "Keep consistency between pricing, snapshots, and print flows.",
        "Prepare the architecture for SaaS evolution without blocking current operations.",
      ],
    },
    whatItShows: {
      pt: "Demonstra experiência prática na estruturação de produto SaaS, regras de domínio, integrações e experiência operacional com foco em uso real.",
      en: "Shows the ability to structure a SaaS product, domain rules, integrations, and operational experience for real usage.",
    },
    links: {
      website: "https://margemapp.com.br/",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para imagem do projeto MARGEM APP.",
        en: "Visual area prepared for the MARGEM APP project image.",
      },
      status: "pending",
      accent: {
        primary: "#7dd3fc",
        secondary: "#3b82f6",
        tertiary: "#c084fc",
      },
      layout: "operational-saas",
      mockupHint: {
        pt: "Moldura para operação SaaS com receitas, custos e rotulagem.",
        en: "Frame for a SaaS operation with recipes, costs and labeling.",
      },
    },
    featured: true,
  },
  {
    slug: "rivals-ai",
    title: {
      pt: "RIVALS AI",
      en: "RIVALS AI",
    },
    subtitle: {
      pt: "Plataforma de debates com IA",
      en: "AI debate platform",
    },
    shortDescription: {
      pt: "Rede social de entretenimento para criação, publicação e descoberta de debates gerados por IA.",
      en: "Entertainment social network for creating, publishing, and discovering AI-generated debates.",
    },
    fullDescription: {
      pt: "Produto de entretenimento social com arena de debates, personagens, publicação em feed, perfis, interações sociais e recursos administrativos.",
      en: "Social entertainment product with debate arena, characters, feed publishing, profiles, social interactions, and administrative resources.",
    },
    status: {
      pt: "Em produção",
      en: "In production",
    },
    category: ["IA", "Social", "Entretenimento"],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "AbacatePay", "APIs de IA"],
    problem: {
      pt: "Criar uma experiência de debates gerados por IA que fosse publicável, compartilhável e organizada como produto social.",
      en: "Create an AI-generated debate experience that could be published, shared, and organized as a social product.",
    },
    solution: {
      pt: "Arena de debates com presets, personagens customizados, streaming, veredito final e publicação manual em feed.",
      en: "Debate arena with presets, custom characters, streaming, final verdict, and manual publishing to a feed.",
    },
    highlights: {
      pt: [
        "Arena de debates com presets, personagens customizados, streaming e veredito final.",
        "Publicação manual em feed, perfis, interações sociais e notificações.",
        "Autenticação, billing, controle de tokens, health checks e painel administrativo.",
      ],
      en: [
        "Debate arena with presets, custom characters, streaming, and final verdict.",
        "Manual publishing to feed, profiles, social interactions, and notifications.",
        "Authentication, billing, token control, health checks, and admin panel.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Combinar fluxo de geração por IA com uma experiência social navegável.",
        "Organizar publicação, perfis e interações sem perder clareza de produto.",
        "Controlar recursos como tokens, billing e health checks.",
      ],
      en: [
        "Combine AI generation flow with a navigable social experience.",
        "Organize publishing, profiles, and interactions without losing product clarity.",
        "Control resources such as tokens, billing, and health checks.",
      ],
    },
    whatItShows: {
      pt: "Demonstra experiência prática em produto interativo com IA, front-end estruturado, autenticação e organização operacional.",
      en: "Shows practical experience with an interactive AI product, structured front-end, authentication, and operational organization.",
    },
    links: {
      website: "https://airivals.com.br/",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para imagem do projeto RIVALS AI.",
        en: "Visual area prepared for the RIVALS AI project image.",
      },
      status: "pending",
      accent: {
        primary: "#67e8f9",
        secondary: "#22c55e",
        tertiary: "#7dd3fc",
      },
      layout: "social-ai",
      mockupHint: {
        pt: "Arena visual para debates, personagens e feed com IA.",
        en: "Visual arena for AI debates, characters and feed.",
      },
    },
    featured: true,
  },
  {
    slug: "sdr-expert-crm",
    title: {
      pt: "SDR EXPERT CRM",
      en: "SDR EXPERT CRM",
    },
    subtitle: {
      pt: "Pipeline comercial com IA",
      en: "AI-assisted SDR pipeline",
    },
    shortDescription: {
      pt: "Mini CRM para operação de SDR com isolamento por workspace, pipeline comercial, campanhas com apoio de IA e simulador público de conversa.",
      en: "Mini CRM for SDR operations with workspace isolation, commercial pipeline, AI-assisted campaigns, and a public conversation simulator.",
    },
    fullDescription: {
      pt: "Aplicação de CRM enxuta para operação comercial, com autenticação, workspace inicial, kanban, leads, campanhas com apoio de IA e simulador público por token.",
      en: "Lean CRM application for commercial operations, with authentication, initial workspace, kanban, leads, AI-assisted campaigns, and public simulator by token.",
    },
    status: {
      pt: "Entrega técnica",
      en: "Technical delivery",
    },
    category: ["CRM", "IA", "SaaS"],
    stack: ["React 19", "TypeScript", "Vite", "Supabase", "PostgreSQL", "RLS", "Edge Functions", "OpenAI", "Zod", "Vitest"],
    problem: {
      pt: "Operações de SDR precisam acompanhar leads, etapas e campanhas de forma organizada, com isolamento por workspace.",
      en: "SDR operations need to track leads, stages, and campaigns in an organized way, with workspace isolation.",
    },
    solution: {
      pt: "Mini CRM com autenticação Supabase, RLS, pipeline em kanban, CRUD de leads, dashboard operacional e campanhas apoiadas por IA.",
      en: "Mini CRM with Supabase authentication, RLS, kanban pipeline, lead CRUD, operational dashboard, and AI-assisted campaigns.",
    },
    highlights: {
      pt: [
        "Autenticação Supabase, workspace inicial, isolamento multi-tenant por RLS e pipeline em kanban.",
        "CRUD de leads com campos personalizados, validação por etapa e dashboard operacional com métricas.",
        "Campanhas com planejamento por IA, geração de mensagens, envio simulado com thread persistida e simulador público por token.",
      ],
      en: [
        "Supabase Auth, initial workspace setup, multi-tenant isolation through RLS, and kanban pipeline.",
        "Lead CRUD with custom fields, stage-based validation, and an operational dashboard with metrics.",
        "AI-assisted campaign planning and message generation, simulated sending with persisted threads, and public simulator links.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Garantir isolamento multi-tenant com RLS.",
        "Manter validação por etapa no pipeline comercial.",
        "Conectar campanhas, mensagens e simulador público sem expor dados indevidos.",
      ],
      en: [
        "Ensure multi-tenant isolation with RLS.",
        "Keep stage-based validation in the commercial pipeline.",
        "Connect campaigns, messages, and public simulator without exposing unnecessary data.",
      ],
    },
    whatItShows: {
      pt: "Demonstra experiência prática com CRUDs reais, autenticação, isolamento de dados, validação, IA aplicada e entrega de desafio técnico.",
      en: "Shows practical experience with real CRUD flows, authentication, data isolation, validation, applied AI, and technical challenge delivery.",
    },
    links: {
      website: "https://sdr-crm-ai-wine.vercel.app/",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para imagem do projeto SDR EXPERT CRM.",
        en: "Visual area prepared for the SDR EXPERT CRM project image.",
      },
      status: "pending",
      accent: {
        primary: "#c084fc",
        secondary: "#3b82f6",
        tertiary: "#f0abfc",
      },
      layout: "crm-pipeline",
      mockupHint: {
        pt: "Moldura para pipeline comercial, campanhas e simulação.",
        en: "Frame for commercial pipeline, campaigns and simulation.",
      },
    },
    featured: true,
  },
  {
    slug: "comerc-ias",
    title: {
      pt: "COMERC IAS",
      en: "COMERC IAS",
    },
    subtitle: {
      pt: "Website e dashboard administrativo",
      en: "Website and admin dashboard",
    },
    shortDescription: {
      pt: "Site institucional com área administrativa e acompanhamento de métricas.",
      en: "Institutional website with an administrative area and metrics tracking.",
    },
    fullDescription: {
      pt: "Projeto institucional com front-end responsivo, páginas comerciais, conteúdo administrável e acompanhamento de métricas de uso.",
      en: "Institutional project with responsive front-end, commercial pages, manageable content, and usage metrics tracking.",
    },
    status: {
      pt: "Publicado",
      en: "Published",
    },
    category: ["Institucional", "Dashboard", "Métricas"],
    stack: ["TypeScript", "React", "Bootstrap", "Node.js", "Supabase"],
    problem: {
      pt: "Apresentar serviços e organizar uma área interna com conteúdo administrável e leitura de métricas.",
      en: "Present services and organize an internal area with manageable content and metrics reading.",
    },
    solution: {
      pt: "Website responsivo com páginas comerciais, autenticação para área interna e analytics de visitas, cliques e permanência.",
      en: "Responsive website with commercial pages, authentication for the internal area, and analytics for visits, clicks, and time on page.",
    },
    highlights: {
      pt: [
        "Front-end responsivo e páginas comerciais.",
        "Conteúdo administrável e autenticação para área interna.",
        "Analytics de visitas, cliques e permanência.",
      ],
      en: [
        "Responsive front-end and commercial pages.",
        "Manageable content and authentication for the internal area.",
        "Analytics for visits, clicks, and time on page.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Equilibrar site institucional com necessidade de painel interno.",
        "Organizar conteúdo administrável sem deixar a experiência pública pesada.",
        "Expor métricas úteis sem exagerar na complexidade.",
      ],
      en: [
        "Balance institutional website needs with an internal dashboard.",
        "Organize manageable content without making the public experience heavy.",
        "Expose useful metrics without overcomplicating the product.",
      ],
    },
    whatItShows: {
      pt: "Demonstra capacidade de entregar presença digital, área administrativa e leitura de métricas em um projeto enxuto.",
      en: "Shows the ability to deliver digital presence, admin area, and metrics reading in a lean project.",
    },
    links: {
      website: "https://www.comercias.com.br/",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para imagem do projeto COMERC IAS.",
        en: "Visual area prepared for the COMERC IAS project image.",
      },
      status: "pending",
      accent: {
        primary: "#ffd166",
        secondary: "#f97316",
        tertiary: "#7dd3fc",
      },
      layout: "institutional-site",
      mockupHint: {
        pt: "Moldura para página institucional com área interna e métricas.",
        en: "Frame for institutional page with internal area and metrics.",
      },
    },
  },
  {
    slug: "gdash-dashboard",
    title: {
      pt: "GDASH DASHBOARD",
      en: "GDASH DASHBOARD",
    },
    subtitle: {
      pt: "Monitoramento climático",
      en: "Climate monitoring",
    },
    shortDescription: {
      pt: "Aplicação full stack orientada a eventos para monitoramento climático com pipeline de dados e visualização de métricas.",
      en: "Event-driven full stack application for climate monitoring with a data pipeline and metrics visualization.",
    },
    fullDescription: {
      pt: "Dashboard técnico para monitoramento climático, com arquitetura orientada a eventos, pipeline de dados, visualização de métricas e insights com IA.",
      en: "Technical dashboard for climate monitoring, with event-driven architecture, data pipeline, metrics visualization, and AI insights.",
    },
    status: {
      pt: "Desafio técnico",
      en: "Technical challenge",
    },
    category: ["Dashboard", "Dados", "IA"],
    stack: ["NestJS", "Python", "RabbitMQ", "Go", "React", "Tailwind", "Gemini API"],
    problem: {
      pt: "Monitorar dados climáticos exige pipeline organizado, leitura analítica e visualização clara das métricas.",
      en: "Monitoring climate data requires an organized pipeline, analytical reading, and clear metrics visualization.",
    },
    solution: {
      pt: "Aplicação orientada a eventos com microsserviços, pipeline em tempo real, dashboard de métricas e geração de insights com Gemini.",
      en: "Event-driven application with microservices, real-time pipeline, metrics dashboard, and Gemini-powered insights.",
    },
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
    technicalChallenges: {
      pt: [
        "Combinar múltiplos serviços em um fluxo coerente.",
        "Representar dados e métricas de forma útil para análise.",
        "Adicionar IA como apoio analítico sem transformar isso no centro do produto.",
      ],
      en: [
        "Combine multiple services into a coherent flow.",
        "Represent data and metrics in a useful analytical format.",
        "Add AI as analytical support without making it the whole product.",
      ],
    },
    whatItShows: {
      pt: "Demonstra visão de arquitetura, integração entre serviços, processamento de dados e visualização analítica.",
      en: "Shows architecture vision, service integration, data processing, and analytical visualization.",
    },
    links: {
      website: "https://gdash.comercias.com.br",
      repository: "https://github.com/alvaro-amorim/gdash-project-challenge",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para imagem do projeto GDASH DASHBOARD.",
        en: "Visual area prepared for the GDASH DASHBOARD project image.",
      },
      status: "pending",
      accent: {
        primary: "#93c5fd",
        secondary: "#6366f1",
        tertiary: "#67e8f9",
      },
      layout: "data-monitoring",
      mockupHint: {
        pt: "Moldura para mapa de dados, sinais climáticos e insights.",
        en: "Frame for data map, climate signals and insights.",
      },
    },
    featured: true,
  },
  {
    slug: "glace-confeitaria",
    title: {
      pt: "GLACÊ CONFEITARIA",
      en: "GLACÊ CONFEITARIA",
    },
    subtitle: {
      pt: "Catálogo e dashboard",
      en: "Catalog and dashboard",
    },
    shortDescription: {
      pt: "Catálogo de produtos com finalização via WhatsApp e dashboard interno com assistente de IA.",
      en: "Product catalog with checkout via WhatsApp and an internal dashboard with an AI assistant.",
    },
    fullDescription: {
      pt: "Aplicação para operação de confeitaria, com catálogo público, fluxo de compra via WhatsApp e dashboard interno para estoque, caixa, cardápio e pedidos.",
      en: "Application for bakery operations, with public catalog, WhatsApp checkout flow, and internal dashboard for inventory, cash flow, menu, and orders.",
    },
    status: {
      pt: "Publicado",
      en: "Published",
    },
    category: ["Catálogo", "Dashboard", "IA"],
    stack: ["Next.js", "React", "Gemini API", "MongoDB"],
    problem: {
      pt: "Uma operação de confeitaria precisa expor produtos, simplificar pedidos e apoiar a rotina interna de gestão.",
      en: "A bakery operation needs to expose products, simplify orders, and support internal management routines.",
    },
    solution: {
      pt: "Catálogo com finalização via WhatsApp e dashboard interno com assistente de IA para tarefas, inconsistências e insights operacionais.",
      en: "Catalog with WhatsApp checkout and internal dashboard with an AI assistant for tasks, inconsistencies, and operational insights.",
    },
    highlights: {
      pt: [
        "Controle de estoque, caixa, cardápio e pedidos.",
        "Dashboard com assistente IA para geração de tarefas, análise de inconsistências e insights operacionais.",
        "Fluxo de compra simplificado com finalização via WhatsApp.",
      ],
      en: [
        "Inventory, cash flow, menu, and order control.",
        "Dashboard with AI assistant for task generation, inconsistency analysis, and operational insights.",
        "Streamlined purchase flow with checkout through WhatsApp.",
      ],
    },
    technicalChallenges: {
      pt: [
        "Alinhar catálogo público e rotina administrativa.",
        "Manter o fluxo de compra simples para o usuário final.",
        "Adicionar IA como apoio operacional prático.",
      ],
      en: [
        "Align public catalog and administrative routine.",
        "Keep the purchase flow simple for the final user.",
        "Add AI as practical operational support.",
      ],
    },
    whatItShows: {
      pt: "Demonstra capacidade de conectar experiência pública, operação interna e automações úteis em um produto de negócio local.",
      en: "Shows the ability to connect public experience, internal operations, and useful automations in a local business product.",
    },
    links: {
      website: "https://cardapio-glace.vercel.app/",
    },
    visuals: {
      thumbnail: null,
      heroImage: null,
      gallery: [],
      alt: {
        pt: "Área visual preparada para imagem do projeto GLACÊ CONFEITARIA.",
        en: "Visual area prepared for the GLACÊ CONFEITARIA project image.",
      },
      status: "pending",
      accent: {
        primary: "#f0abfc",
        secondary: "#a855f7",
        tertiary: "#7dd3fc",
      },
      layout: "commerce-catalog",
      mockupHint: {
        pt: "Moldura para catálogo público, pedidos e gestão interna.",
        en: "Frame for public catalog, orders and internal management.",
      },
    },
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export const projectLinks: ProfileLink[] = projects.flatMap((project) => {
  const links: ProfileLink[] = [
    {
      label: project.title,
      href: project.links.website,
      display: project.links.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      kind: "project",
    },
  ];

  if (project.links.repository) {
    links.push({
      label: {
        pt: `${project.title.pt} Repositório`,
        en: `${project.title.en} Repository`,
      },
      href: project.links.repository,
      display: project.links.repository.replace(/^https?:\/\//, ""),
      kind: "repo",
    });
  }

  return links;
});
