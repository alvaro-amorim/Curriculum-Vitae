"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloads } from "@/content/downloads";
import { profile } from "@/content/profile";
import { getProjectBySlug, projects } from "@/content/projects";
import { skills } from "@/content/skills";
import { terminalCommands } from "@/content/terminal";

type TerminalLink = {
  href: string;
  label: string;
  download?: string;
};

type TerminalLine = {
  id: string;
  kind: "command" | "output" | "error";
  text?: string;
  items?: string[];
  links?: TerminalLink[];
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function InteractiveTerminal() {
  const router = useRouter();
  const { locale, t } = usePortfolioUi();
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");

  const primarySkills = useMemo(() => {
    const highlighted = new Set(profile.highlights);
    const practical = skills.filter((skill) => skill.level === "practical" || skill.level === "project").map((skill) => skill.name);
    return [...profile.highlights, ...practical.filter((skill) => !highlighted.has(skill))].slice(0, 14);
  }, []);

  function output(line: Omit<TerminalLine, "id" | "kind">, kind: TerminalLine["kind"] = "output"): TerminalLine {
    return {
      id: createId(),
      kind,
      ...line,
    };
  }

  function runCommand(rawCommand: string) {
    const normalized = rawCommand.trim().replace(/\s+/g, " ");
    const [command, ...args] = normalized.toLowerCase().split(" ");
    const activeDownloads = downloads[locale];

    if (!normalized) {
      return;
    }

    const commandLine = output({ text: normalized }, "command");

    if (command === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    let response: TerminalLine[];

    switch (command) {
      case "help":
        response = [
          output({
            text: t.lab.terminal.helpTitle,
            items: terminalCommands.map((terminalCommand) => `${terminalCommand.usage} - ${terminalCommand.description[locale]}`),
          }),
        ];
        break;
      case "whoami":
        response = [
          output({
            text: profile.fullName,
            items: [profile.role[locale], profile.positioning[locale], `${profile.location}, ${profile.country[locale]}`],
          }),
        ];
        break;
      case "stack":
        response = [
          output({
            text: t.lab.terminal.stackTitle,
            items: primarySkills,
          }),
        ];
        break;
      case "projects":
        response = [
          output({
            text: t.lab.terminal.projectsTitle,
            items: projects.map((project) => `${project.slug} - ${project.title[locale]} (${project.status[locale]})`),
            links: projects.map((project) => ({
              href: `/projetos/${project.slug}`,
              label: project.title[locale],
            })),
          }),
        ];
        break;
      case "lab":
        response = [
          output({
            text: t.lab.terminal.openingLab,
            links: [
              {
                href: "/lab",
                label: "/lab",
              },
            ],
          }),
        ];
        window.setTimeout(() => router.push("/lab"), 120);
        break;
      case "open": {
        const slug = args[0];

        if (slug === "lab") {
          response = [
            output({
              text: t.lab.terminal.openingLab,
              links: [
                {
                  href: "/lab",
                  label: "/lab",
                },
              ],
            }),
          ];
          window.setTimeout(() => router.push("/lab"), 120);
          break;
        }

        const project = slug ? getProjectBySlug(slug) : undefined;

        if (!project) {
          response = [
            output(
              {
                text: t.lab.terminal.projectNotFound,
                items: projects.map((item) => item.slug),
              },
              "error",
            ),
          ];
          break;
        }

        response = [
          output({
            text: `${t.lab.terminal.openingProject}: ${project.title[locale]}`,
            links: [
              {
                href: `/projetos/${project.slug}`,
                label: `/projetos/${project.slug}`,
              },
            ],
          }),
        ];
        window.setTimeout(() => router.push(`/projetos/${project.slug}`), 120);
        break;
      }
      case "contact":
        response = [
          output({
            text: t.lab.terminal.contactTitle,
            items: [profile.email, profile.phone, profile.github],
            links: [
              { href: `mailto:${profile.email}`, label: profile.email },
              { href: profile.github, label: "GitHub" },
            ],
          }),
        ];
        break;
      case "download":
        response = [
          output({
            text: t.lab.terminal.downloadTitle,
            links: [
              {
                href: activeDownloads.pdf.href,
                label: activeDownloads.pdf.fileName,
                download: activeDownloads.pdf.fileName,
              },
              {
                href: activeDownloads.docx.href,
                label: activeDownloads.docx.fileName,
                download: activeDownloads.docx.fileName,
              },
            ],
          }),
        ];
        break;
      default:
        response = [output({ text: t.lab.terminal.unknownCommand }, "error")];
    }

    setHistory((current) => [...current, commandLine, ...response]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(input);
  }

  return (
    <section className="interactive-surface rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] p-5">
        <div>
          <Badge>{t.home.currentPhase}</Badge>
          <h2 className="mt-3 text-lg font-semibold text-[var(--text)]">{t.lab.terminal.title}</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted)]">{t.lab.terminal.description}</p>
        </div>
        <Button onClick={() => runCommand("help")} size="sm" variant="secondary">
          help
        </Button>
      </div>

      <div
        aria-live="polite"
        className="min-h-[360px] space-y-3 overflow-x-auto p-5 font-mono text-sm"
      >
        {history.length === 0 ? (
          <p className="text-[var(--muted)]">
            <span className="text-[var(--accent)]">$</span> {t.lab.terminal.initial}
            <span className="terminal-caret ml-1 inline-block h-4 w-2 translate-y-0.5 bg-[var(--accent)]" aria-hidden="true" />
          </p>
        ) : null}

        {history.map((line) => (
          <div className="soft-reveal" key={line.id}>
            {line.kind === "command" ? (
              <p className="text-[var(--text)]">
                <span className="text-[var(--accent)]">$</span> {line.text}
              </p>
            ) : (
              <div className={line.kind === "error" ? "text-red-300" : "text-[var(--muted)]"}>
                {line.text ? <p className="text-[var(--text)]">{line.text}</p> : null}
                {line.items ? (
                  <ul className="mt-2 grid gap-1">
                    {line.items.map((item) => (
                      <li className="break-words" key={item}>
                        <span className="text-[var(--accent)]">-</span> {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {line.links ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {line.links.map((link) =>
                      link.href.startsWith("/") && !link.download ? (
                        <Link className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-strong)]" href={link.href} key={link.href}>
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-strong)]"
                          download={link.download}
                          href={link.href}
                          key={link.href}
                          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                        >
                          {link.label}
                        </a>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      <form className="border-t border-[var(--border)] p-4" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="interactive-terminal-input">
          {t.lab.terminal.promptLabel}
        </label>
        <div className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--ring)]">
          <span className="font-mono text-sm text-[var(--accent)]">$</span>
          <input
            aria-label={t.lab.terminal.promptLabel}
            autoComplete="off"
            className="h-12 min-w-0 flex-1 bg-transparent font-mono text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted-soft)]"
            data-terminal-input
            id="interactive-terminal-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.lab.terminal.placeholder}
            value={input}
          />
          <Button size="sm" type="submit" variant="primary">
            Enter
          </Button>
        </div>
      </form>
    </section>
  );
}
