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
    lab: string;
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
    openLab: string;
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
  lab: {
    terminal: {
      title: string;
      description: string;
      promptLabel: string;
      placeholder: string;
      initial: string;
      helpTitle: string;
      unknownCommand: string;
      projectNotFound: string;
      openingProject: string;
      openingLab: string;
      stackTitle: string;
      projectsTitle: string;
      contactTitle: string;
      downloadTitle: string;
      cleared: string;
    };
    commandPalette: {
      trigger: string;
      title: string;
      description: string;
      searchPlaceholder: string;
      noResults: string;
      navigation: string;
      projects: string;
      downloads: string;
      actions: string;
      copyEmail: string;
      copiedEmail: string;
      toggleTheme: string;
      toggleLanguage: string;
    };
    skillRadar: {
      title: string;
      description: string;
      filtersLabel: string;
      allDomains: string;
      levelSummary: string;
    };
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
      lab: "Lab",
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
      openLab: "Abrir Developer Lab",
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
      statusTitle: "Developer Lab ativo",
      statusDescription: "Mini-games técnicos demonstram raciocínio de depuração, arquitetura e performance com score persistente e ranking por melhor resultado de cada jogador.",
      architectureTitle: "Backend persistente",
      architectureDescription: "Route Handlers validam sessão, score e ranking com acesso server-side ao MongoDB, sem expor credenciais ou identificadores internos no navegador.",
      currentPhase: "Estabilização da fundação",
      resumeCta: "Currículo objetivo",
    },
    lab: {
      terminal: {
        title: "Terminal interativo",
        description: "Explore perfil, stack, projetos e downloads por comandos client-side.",
        promptLabel: "Comando do terminal",
        placeholder: "Digite help, projects ou open margem-app",
        initial: "Digite help para ver os comandos disponíveis.",
        helpTitle: "Comandos disponíveis",
        unknownCommand: "Comando não reconhecido. Use help para ver as opções.",
        projectNotFound: "Projeto não encontrado. Use projects para listar os slugs.",
        openingProject: "Abrindo case study",
        openingLab: "Abrindo Developer Lab",
        stackTitle: "Stack principal",
        projectsTitle: "Projetos disponíveis",
        contactTitle: "Contato",
        downloadTitle: "Downloads",
        cleared: "Histórico limpo.",
      },
      commandPalette: {
        trigger: "Ctrl K",
        title: "Command palette",
        description: "Busque rotas, projetos, downloads e ações rápidas.",
        searchPlaceholder: "Buscar comando ou projeto",
        noResults: "Nenhuma ação encontrada.",
        navigation: "Navegação",
        projects: "Projetos",
        downloads: "Downloads",
        actions: "Ações",
        copyEmail: "Copiar e-mail",
        copiedEmail: "E-mail copiado.",
        toggleTheme: "Alternar tema",
        toggleLanguage: "Alternar idioma",
      },
      skillRadar: {
        title: "Skill matrix",
        description: "Habilidades agrupadas por domínio com níveis honestos de familiaridade e evidência prática.",
        filtersLabel: "Filtros de habilidades",
        allDomains: "Todos",
        levelSummary: "Distribuição por nível",
      },
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
      lab: "Lab",
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
      openLab: "Open Developer Lab",
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
      statusTitle: "Developer Lab active",
      statusDescription: "Technical mini-games demonstrate debugging, architecture, and performance reasoning with persistent scores and a leaderboard based on each player's best result.",
      architectureTitle: "Persistent backend",
      architectureDescription: "Route Handlers validate sessions, scores, and rankings through server-side MongoDB access without exposing credentials or internal identifiers to the browser.",
      currentPhase: "Foundation stabilization",
      resumeCta: "Objective resume",
    },
    lab: {
      terminal: {
        title: "Interactive terminal",
        description: "Explore profile, stack, projects, and downloads through client-side commands.",
        promptLabel: "Terminal command",
        placeholder: "Type help, projects, or open margem-app",
        initial: "Type help to see the available commands.",
        helpTitle: "Available commands",
        unknownCommand: "Command not recognized. Use help to see the options.",
        projectNotFound: "Project not found. Use projects to list the slugs.",
        openingProject: "Opening case study",
        openingLab: "Opening Developer Lab",
        stackTitle: "Main stack",
        projectsTitle: "Available projects",
        contactTitle: "Contact",
        downloadTitle: "Downloads",
        cleared: "History cleared.",
      },
      commandPalette: {
        trigger: "Ctrl K",
        title: "Command palette",
        description: "Search routes, projects, downloads, and quick actions.",
        searchPlaceholder: "Search command or project",
        noResults: "No action found.",
        navigation: "Navigation",
        projects: "Projects",
        downloads: "Downloads",
        actions: "Actions",
        copyEmail: "Copy email",
        copiedEmail: "Email copied.",
        toggleTheme: "Toggle theme",
        toggleLanguage: "Toggle language",
      },
      skillRadar: {
        title: "Skill matrix",
        description: "Skills grouped by domain with honest familiarity labels and practical evidence.",
        filtersLabel: "Skill filters",
        allDomains: "All",
        levelSummary: "Level distribution",
      },
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
