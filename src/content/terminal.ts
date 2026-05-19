import { projects } from "@/content/projects";
import type { LocalizedText } from "@/types/portfolio";

export type TerminalCommand = {
  name: string;
  usage: string;
  description: LocalizedText;
};

export const terminalCommands: TerminalCommand[] = [
  {
    name: "help",
    usage: "help",
    description: {
      pt: "Lista os comandos disponíveis.",
      en: "Lists the available commands.",
    },
  },
  {
    name: "whoami",
    usage: "whoami",
    description: {
      pt: "Mostra perfil e posicionamento.",
      en: "Shows profile and positioning.",
    },
  },
  {
    name: "stack",
    usage: "stack",
    description: {
      pt: "Mostra tecnologias principais.",
      en: "Shows main technologies.",
    },
  },
  {
    name: "projects",
    usage: "projects",
    description: {
      pt: "Lista projetos e slugs.",
      en: "Lists projects and slugs.",
    },
  },
  {
    name: "lab",
    usage: "lab",
    description: {
      pt: "Abre o Developer Lab.",
      en: "Opens the Developer Lab.",
    },
  },
  {
    name: "open lab",
    usage: "open lab",
    description: {
      pt: "Abre o Developer Lab.",
      en: "Opens the Developer Lab.",
    },
  },
  ...projects.map<TerminalCommand>((project) => ({
    name: `open ${project.slug}`,
    usage: `open ${project.slug}`,
    description: {
      pt: `Abre o case study ${project.title.pt}.`,
      en: `Opens the ${project.title.en} case study.`,
    },
  })),
  {
    name: "contact",
    usage: "contact",
    description: {
      pt: "Mostra canais de contato.",
      en: "Shows contact channels.",
    },
  },
  {
    name: "download",
    usage: "download",
    description: {
      pt: "Mostra links de PDF e DOCX.",
      en: "Shows PDF and DOCX links.",
    },
  },
  {
    name: "clear",
    usage: "clear",
    description: {
      pt: "Limpa o histórico do terminal.",
      en: "Clears the terminal history.",
    },
  },
];
