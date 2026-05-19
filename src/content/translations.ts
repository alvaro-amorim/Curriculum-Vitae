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
    home: {
      eyebrow: "Álvaro.dev Portfolio OS",
      title: "Álvaro Amorim",
      subtitle: "Desenvolvedor Full Stack",
      intro: "Construo aplicações web, produtos SaaS, automações e integrações com IA, com foco em entrega funcional, arquitetura limpa e experiência de produto.",
      statusTitle: "Migração estrutural inicial",
      statusDescription: "Base Next.js com conteúdo preservado, arquivos estruturados e currículo objetivo em rota dedicada.",
      architectureTitle: "Próxima evolução",
      architectureDescription: "Case studies, interatividade avançada, APIs reais e Developer Lab entram nas próximas fases, sem misturar tudo na primeira entrega.",
      currentPhase: "Fase 1.1",
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
    home: {
      eyebrow: "Álvaro.dev Portfolio OS",
      title: "Álvaro Amorim",
      subtitle: "Full Stack Developer",
      intro: "I build web applications, SaaS products, automation flows, and AI integrations with a focus on functional delivery, clean architecture, and product experience.",
      statusTitle: "Initial structural migration",
      statusDescription: "Next.js foundation with preserved content, structured files, and a direct resume route.",
      architectureTitle: "Next evolution",
      architectureDescription: "Case studies, advanced interaction, real APIs, and the Developer Lab belong to later phases instead of being mixed into the first delivery.",
      currentPhase: "Phase 1.1",
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
