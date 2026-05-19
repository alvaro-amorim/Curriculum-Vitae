import { downloads } from "@/content/downloads";
import { profile } from "@/content/profile";
import { getProjectBySlug, projects } from "@/content/projects";
import { skills } from "@/content/skills";
import { terminalCommands } from "@/content/terminal";
import type { Locale } from "@/types/portfolio";

export type TerminalAction = {
  type: "navigate" | "download" | "copy" | "clear";
  target?: string;
};

export type TerminalCommandResult = {
  ok: boolean;
  output: string[];
  action?: TerminalAction;
  code?: "UNKNOWN_COMMAND";
};

const localeFallback: Locale = "pt";

function normalizeCommand(command: string) {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function resolveMainStack() {
  const highlighted = new Set(profile.highlights);
  const practical = skills.filter((skill) => skill.level === "practical" || skill.level === "project").map((skill) => skill.name);

  return [...profile.highlights, ...practical.filter((skill) => !highlighted.has(skill))].slice(0, 14);
}

export function executeTerminalCommand(command: string, locale: Locale = localeFallback): TerminalCommandResult {
  const normalized = normalizeCommand(command);
  const [baseCommand, ...args] = normalized.split(" ");
  const activeDownloads = downloads[locale];

  if (!normalized) {
    return {
      ok: false,
      code: "UNKNOWN_COMMAND",
      output: ["Digite um comando. Use help para ver as opções."],
    };
  }

  switch (baseCommand) {
    case "help":
      return {
        ok: true,
        output: ["Comandos disponíveis:", ...terminalCommands.map((item) => `${item.usage} - ${item.description[locale]}`)],
      };
    case "whoami":
      return {
        ok: true,
        output: [profile.fullName, profile.role[locale], profile.positioning[locale], `${profile.location}, ${profile.country[locale]}`],
      };
    case "stack":
      return {
        ok: true,
        output: ["Stack principal:", ...resolveMainStack()],
      };
    case "projects":
      return {
        ok: true,
        output: ["Projetos disponíveis:", ...projects.map((project) => `${project.slug} - ${project.title[locale]} (${project.status[locale]})`)],
      };
    case "lab":
      return {
        ok: true,
        output: [locale === "pt" ? "Abrindo Developer Lab" : "Opening Developer Lab", "/lab"],
        action: {
          type: "navigate",
          target: "/lab",
        },
      };
    case "open": {
      const slug = args[0];

      if (slug === "lab") {
        return {
          ok: true,
          output: [locale === "pt" ? "Abrindo Developer Lab" : "Opening Developer Lab", "/lab"],
          action: {
            type: "navigate",
            target: "/lab",
          },
        };
      }

      const project = slug ? getProjectBySlug(slug) : undefined;

      if (!project) {
        return {
          ok: false,
          code: "UNKNOWN_COMMAND",
          output: ["Projeto não encontrado. Use projects para listar os slugs."],
        };
      }

      return {
        ok: true,
        output: [`Abrindo case study: ${project.title[locale]}`, `/projetos/${project.slug}`],
        action: {
          type: "navigate",
          target: `/projetos/${project.slug}`,
        },
      };
    }
    case "contact":
      return {
        ok: true,
        output: ["Contato:", `E-mail: ${profile.email}`, `Telefone: ${profile.phone}`, `GitHub: ${profile.github}`],
        action: {
          type: "copy",
          target: profile.email,
        },
      };
    case "download":
      return {
        ok: true,
        output: ["Downloads:", activeDownloads.pdf.href, activeDownloads.docx.href],
        action: {
          type: "download",
          target: activeDownloads.pdf.href,
        },
      };
    case "clear":
      return {
        ok: true,
        output: ["Histórico limpo."],
        action: {
          type: "clear",
        },
      };
    default:
      return {
        ok: false,
        code: "UNKNOWN_COMMAND",
        output: ["Comando não reconhecido. Use help para ver as opções."],
      };
  }
}
