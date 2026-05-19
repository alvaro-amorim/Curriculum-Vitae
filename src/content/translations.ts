import type { Locale } from "@/types/portfolio";

type TranslationTree = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    home: string;
    resume: string;
    projects: string;
    theme: string;
    language: string;
    mainNavigation: string;
  };
  actions: {
    downloadPdf: string;
    downloadDocx: string;
    print: string;
    copy: string;
    copied: string;
    open: string;
    viewResume: string;
    viewProjects: string;
    viewGithub: string;
  };
  projectsPage: {
    title: string;
    description: string;
    allCategories: string;
    filtersLabel: string;
    featured: string;
    viewCase: string;
    backHome: string;
    openResume: string;
  };
  caseStudy: {
    backToProjects: string;
    status: string;
    categories: string;
    stack: string;
    problem: string;
    solution: string;
    highlights: string;
    technicalChallenges: string;
    whatItShows: string;
    links: string;
    visitProject: string;
    viewRepository: string;
  };
  home: {
    eyebrow: string;
    title: string;
    subtitle: string;
    intro: string;
    statusTitle: string;
    statusDescription: string;
    architectureTitle: string;
    architectureDescription: string;
    currentPhase: string;
    resumeCta: string;
  };
  resume: {
    title: string;
    subtitle: string;
    about: string;
    contact: string;
    location: string;
    phone: string;
    email: string;
    github: string;
    highlights: string;
    skills: string;
    all: string;
    front: string;
    back: string;
    devops: string;
    other: string;
    education: string;
    certifications: string;
    experience: string;
    projects: string;
    projectCountLabel: string;
    links: string;
    profilePhotoAlt: string;
  };
};

export const dictionary: Record<Locale, TranslationTree> = {
  pt: {
    meta: {
      title: "Álvaro Amorim - Desenvolvedor Full Stack",
      description: "Currículo e portfólio digital de Álvaro Amorim, desenvolvedor Full Stack com foco em aplicações web, produtos SaaS, automações e integrações com IA.",
    },
    nav: {
      home: "Home",
      resume: "Currículo",
      projects: "Projetos",
      theme: "Tema",
      language: "PT",
      mainNavigation: "Navegação principal",
    },
    actions: {
      downloadPdf: "Baixar PDF",
      downloadDocx: "Baixar DOCX",
      print: "Imprimir",
      copy: "Copiar",
      copied: "Copiado",
      open: "Abrir",
      viewResume: "Abrir currículo",
      viewProjects: "Ver projetos",
      viewGithub: "Ver GitHub",
    },
    projectsPage: {
      title: "Case studies de projetos",
      description: "Projetos reais organizados como estudos de caso: contexto, solução, stack, desafios técnicos e o que cada entrega demonstra.",
      allCategories: "Todas",
      filtersLabel: "Filtros de projetos",
      featured: "Destaques",
      viewCase: "Ver case study",
      backHome: "Voltar para home",
      openResume: "Abrir currículo",
    },
    caseStudy: {
      backToProjects: "Voltar para projetos",
      status: "Status",
      categories: "Categorias",
      stack: "Stack",
      problem: "Problema",
      solution: "Solução",
      highlights: "Funcionalidades e destaques",
      technicalChallenges: "Desafios técnicos",
      whatItShows: "O que este projeto demonstra",
      links: "Links",
      visitProject: "Abrir projeto",
      viewRepository: "Ver repositório",
    },
    home: {
      eyebrow: "Álvaro.dev Portfolio OS",
      title: "Álvaro Amorim",
      subtitle: "Desenvolvedor Full Stack",
      intro: "Construo aplicações web, produtos SaaS, automações e integrações com IA, com foco em entrega funcional, arquitetura limpa e experiência de produto.",
      statusTitle: "Case studies estruturados",
      statusDescription: "Projetos reais agora têm rota dedicada, páginas individuais e conteúdo técnico organizado por problema, solução, stack e desafios.",
      architectureTitle: "Próxima evolução",
      architectureDescription: "Interatividade avançada, APIs reais e Developer Lab entram nas próximas fases, sem misturar backend ou mini-games nesta etapa.",
      currentPhase: "Fase 2.1",
      resumeCta: "Currículo objetivo",
    },
    resume: {
      title: "Currículo Interativo",
      subtitle: "Álvaro Amorim • Desenvolvedor Full Stack",
      about: "Sobre mim",
      contact: "Contato",
      location: "Local",
      phone: "Telefone",
      email: "E-mail",
      github: "GitHub",
      highlights: "Destaques",
      skills: "Habilidades",
      all: "Todas",
      front: "Front-end",
      back: "Back-end",
      devops: "DevOps",
      other: "Outros",
      education: "Formação",
      certifications: "Certificações",
      experience: "Experiência",
      projects: "Projetos",
      projectCountLabel: "projetos",
      links: "Links",
      profilePhotoAlt: "Foto de Álvaro Amorim",
    },
  },
  en: {
    meta: {
      title: "Álvaro Amorim - Full Stack Developer",
      description: "Digital resume and portfolio of Álvaro Amorim, a Full Stack Developer focused on web applications, SaaS products, automation, and AI integrations.",
    },
    nav: {
      home: "Home",
      resume: "Resume",
      projects: "Projects",
      theme: "Theme",
      language: "EN",
      mainNavigation: "Main navigation",
    },
    actions: {
      downloadPdf: "Download PDF",
      downloadDocx: "Download DOCX",
      print: "Print",
      copy: "Copy",
      copied: "Copied",
      open: "Open",
      viewResume: "Open resume",
      viewProjects: "View projects",
      viewGithub: "View GitHub",
    },
    projectsPage: {
      title: "Project case studies",
      description: "Real projects organized as case studies: context, solution, stack, technical challenges, and what each delivery demonstrates.",
      allCategories: "All",
      filtersLabel: "Project filters",
      featured: "Featured",
      viewCase: "View case study",
      backHome: "Back home",
      openResume: "Open resume",
    },
    caseStudy: {
      backToProjects: "Back to projects",
      status: "Status",
      categories: "Categories",
      stack: "Stack",
      problem: "Problem",
      solution: "Solution",
      highlights: "Features and highlights",
      technicalChallenges: "Technical challenges",
      whatItShows: "What this project shows",
      links: "Links",
      visitProject: "Open project",
      viewRepository: "View repository",
    },
    home: {
      eyebrow: "Álvaro.dev Portfolio OS",
      title: "Álvaro Amorim",
      subtitle: "Full Stack Developer",
      intro: "I build web applications, SaaS products, automation flows, and AI integrations with a focus on functional delivery, clean architecture, and product experience.",
      statusTitle: "Structured case studies",
      statusDescription: "Real projects now have a dedicated route, individual pages, and technical content organized by problem, solution, stack, and challenges.",
      architectureTitle: "Next evolution",
      architectureDescription: "Advanced interaction, real APIs, and the Developer Lab belong to later phases without mixing backend or mini-games into this step.",
      currentPhase: "Phase 2.1",
      resumeCta: "Objective resume",
    },
    resume: {
      title: "Interactive Resume",
      subtitle: "Álvaro Amorim • Full Stack Developer",
      about: "About me",
      contact: "Contact",
      location: "Location",
      phone: "Phone",
      email: "Email",
      github: "GitHub",
      highlights: "Highlights",
      skills: "Skills",
      all: "All",
      front: "Front-end",
      back: "Back-end",
      devops: "DevOps",
      other: "Other",
      education: "Education",
      certifications: "Certifications",
      experience: "Experience",
      projects: "Projects",
      projectCountLabel: "projects",
      links: "Links",
      profilePhotoAlt: "Photo of Álvaro Amorim",
    },
  },
};

export type Dictionary = TranslationTree;
