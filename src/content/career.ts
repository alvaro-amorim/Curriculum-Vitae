import type { Locale, LocalizedText } from "@/types/portfolio";

type LocalizedList = Record<Locale, readonly string[]>;
type LocalizedPairs = Record<Locale, readonly (readonly [string, string])[]>;

export const career = {
  role: {
    pt: "Desenvolvedor Full Stack Júnior",
    en: "Junior Full Stack Developer",
  } satisfies LocalizedText,
  positioning: {
    pt: "Aplicações Web • Produtos SaaS • Automações • Integrações com IA",
    en: "Web Applications • SaaS Products • Automation • AI Integrations",
  } satisfies LocalizedText,
  availability: {
    pt: "Disponível para novos desafios",
    en: "Available for new challenges",
  } satisfies LocalizedText,
  focus: {
    pt: "Produtos web, automações e IA aplicada",
    en: "Web products, automation, and applied AI",
  } satisfies LocalizedText,
  homeAbout: {
    pt: "Sou desenvolvedor Full Stack Júnior focado em produtos web, automações, dados e IA aplicada.",
    en: "I am a Junior Full Stack Developer focused on web products, automations, data and applied AI.",
  } satisfies LocalizedText,
  aboutIntro: {
    pt: "Sou Álvaro Amorim, desenvolvedor Full Stack Júnior em Juiz de Fora. Transformo problemas reais em produtos web claros, funcionais e preparados para evoluir.",
    en: "I am Álvaro Amorim, a Junior Full Stack Developer based in Juiz de Fora. I turn real problems into clear, functional web products prepared to evolve.",
  } satisfies LocalizedText,
  resumeSummary: {
    pt: [
      "Desenvolvedor Full Stack Júnior com foco em aplicações web, produtos SaaS, automações e integrações com IA.",
      "Atuo como freelancer e desenvolvedor de projetos próprios, participando do ciclo completo de construção: requisitos, regras de negócio, arquitetura, interface, APIs, bancos de dados, integrações e deploy.",
      "Trago maturidade corporativa de experiências anteriores em logística, processos operacionais, atendimento ao público e resolução de problemas em tempo real.",
      "Busco minha primeira oportunidade formal em desenvolvimento para contribuir com evolução de produto, aprendizado contínuo e entrega de soluções reais.",
    ],
    en: [
      "Junior Full Stack Developer focused on web applications, SaaS products, automation, and AI integrations.",
      "I work as a freelancer and build my own projects, taking part in the complete product cycle: requirements, business rules, architecture, interfaces, APIs, databases, integrations, and deployment.",
      "I bring professional maturity from previous experience in logistics, operational processes, customer service, and real-time problem solving.",
      "I am seeking my first formal software development opportunity to contribute to product evolution, continuous learning, and the delivery of real solutions.",
    ],
  } satisfies LocalizedList,
  journey: {
    pt: [
      ["2025", "Formação em Desenvolvimento Full Stack"],
      ["2026", "Pós-graduação em IA para Devs na FIAP (em andamento)"],
      ["Agora", "Projetos reais, estudo contínuo e busca pela primeira oportunidade formal em desenvolvimento"],
    ],
    en: [
      ["2025", "Degree in Full Stack Development"],
      ["2026", "Postgraduate program in AI for Developers at FIAP (in progress)"],
      ["Now", "Real projects, continuous learning, and the search for my first formal development opportunity"],
    ],
  } satisfies LocalizedPairs,
  homeStats: {
    pt: [
      ["6", "Projetos principais"],
      ["2024", "Atuação em desenvolvimento"],
      ["PT/EN", "Portfólio bilíngue"],
    ],
    en: [
      ["6", "Featured projects"],
      ["2024", "Development work since"],
      ["PT/EN", "Bilingual portfolio"],
    ],
  } satisfies LocalizedPairs,
  seo: {
    siteDescription: {
      pt: "Álvaro Amorim — Desenvolvedor Full Stack Júnior focado em aplicações web, SaaS, automações e integrações com IA.",
      en: "Álvaro Amorim — Junior Full Stack Developer focused on web applications, SaaS, automation, and AI integrations.",
    } satisfies LocalizedText,
    resumeDescription: {
      pt: "Currículo de Álvaro Amorim, Desenvolvedor Full Stack Júnior, com perfil, contato, formação, experiência, habilidades, projetos e downloads em PDF/DOCX.",
      en: "Resume of Álvaro Amorim, Junior Full Stack Developer, with profile, contact details, education, experience, skills, projects, and PDF/DOCX downloads.",
    } satisfies LocalizedText,
    resumeOpenGraphDescription: {
      pt: "Resumo profissional, experiência, formação, habilidades e projetos de Álvaro Amorim, Desenvolvedor Full Stack Júnior.",
      en: "Professional summary, experience, education, skills, and projects of Álvaro Amorim, Junior Full Stack Developer.",
    } satisfies LocalizedText,
    keywords: [
      "Álvaro Amorim",
      "Desenvolvedor Full Stack Júnior",
      "Next.js",
      "React",
      "TypeScript",
      "SaaS",
      "IA",
      "Portfólio",
    ],
  },
} as const;

export const resumeSummary = career.resumeSummary;
