"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { usePortfolioUi } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { downloads } from "@/content/downloads";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { cn } from "@/lib/cn";
import type { DownloadAsset } from "@/types/portfolio";

type CommandGroup = "navigation" | "projects" | "downloads" | "actions";

type PaletteAction = {
  id: string;
  label: string;
  description: string;
  group: CommandGroup;
  keywords: string[];
  closeOnRun?: boolean;
  run: () => void | Promise<void>;
};

const groupOrder: CommandGroup[] = ["navigation", "projects", "downloads", "actions"];

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
}

function downloadAsset(asset: DownloadAsset) {
  const link = document.createElement("a");
  link.href = asset.href;
  link.download = asset.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function CommandPalette() {
  const router = useRouter();
  const { locale, t, toggleLocale, toggleTheme } = usePortfolioUi();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function openPalette() {
    setQuery("");
    setStatus("");
    setIsOpen(true);
  }

  function closePalette() {
    setIsOpen(false);
    setQuery("");
    setStatus("");
  }

  const actions = useMemo<PaletteAction[]>(() => {
    const activeDownloads = downloads[locale];

    return [
      {
        id: "go-home",
        label: t.nav.home,
        description: "/",
        group: "navigation",
        keywords: ["home", "inicio", "portfolio"],
        run: () => router.push("/"),
      },
      {
        id: "go-resume",
        label: t.nav.resume,
        description: "/curriculo",
        group: "navigation",
        keywords: ["curriculo", "resume", "cv"],
        run: () => router.push("/curriculo"),
      },
      {
        id: "go-projects",
        label: t.nav.projects,
        description: "/projetos",
        group: "navigation",
        keywords: ["projetos", "projects", "cases"],
        run: () => router.push("/projetos"),
      },
      {
        id: "go-lab",
        label: t.actions.openLab,
        description: "/lab",
        group: "navigation",
        keywords: ["lab", "developer lab", "mini-games", "debug", "architecture", "latency"],
        run: () => router.push("/lab"),
      },
      ...projects.map<PaletteAction>((project) => ({
        id: `open-${project.slug}`,
        label: project.title[locale],
        description: `/projetos/${project.slug}`,
        group: "projects",
        keywords: [project.slug, project.title.pt, project.title.en, ...project.stack],
        run: () => router.push(`/projetos/${project.slug}`),
      })),
      {
        id: "download-pdf",
        label: t.actions.downloadPdf,
        description: activeDownloads.pdf.fileName,
        group: "downloads",
        keywords: ["pdf", "download", "curriculo", "resume"],
        run: () => downloadAsset(activeDownloads.pdf),
      },
      {
        id: "download-docx",
        label: t.actions.downloadDocx,
        description: activeDownloads.docx.fileName,
        group: "downloads",
        keywords: ["docx", "download", "curriculo", "resume"],
        run: () => downloadAsset(activeDownloads.docx),
      },
      {
        id: "copy-email",
        label: t.lab.commandPalette.copyEmail,
        description: profile.email,
        group: "actions",
        keywords: ["email", "contato", "contact"],
        closeOnRun: false,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            setStatus(t.lab.commandPalette.copiedEmail);
          } catch {
            setStatus(profile.email);
          }
        },
      },
      {
        id: "toggle-theme",
        label: t.lab.commandPalette.toggleTheme,
        description: t.nav.theme,
        group: "actions",
        keywords: ["tema", "theme", "dark", "light"],
        closeOnRun: false,
        run: toggleTheme,
      },
      {
        id: "toggle-language",
        label: t.lab.commandPalette.toggleLanguage,
        description: locale === "pt" ? "EN" : "PT",
        group: "actions",
        keywords: ["idioma", "language", "pt", "en"],
        closeOnRun: false,
        run: toggleLocale,
      },
    ];
  }, [locale, router, t, toggleLocale, toggleTheme]);

  const filteredActions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return actions;
    }

    return actions.filter((action) => {
      const searchable = [action.label, action.description, ...action.keywords].join(" ").toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [actions, query]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut = event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey);

      if (isShortcut && !isEditableTarget(event.target)) {
        event.preventDefault();
        setQuery("");
        setStatus("");
        setIsOpen((current) => !current);
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setStatus("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(focusTimer);
    }

    return undefined;
  }, [isOpen]);

  async function handleRun(action: PaletteAction) {
    await action.run();

    if (action.closeOnRun !== false) {
      closePalette();
    }
  }

  const groupedActions = groupOrder.map((group) => ({
    group,
    actions: filteredActions.filter((action) => action.group === group),
  }));

  const groupLabels: Record<CommandGroup, string> = {
    navigation: t.lab.commandPalette.navigation,
    projects: t.lab.commandPalette.projects,
    downloads: t.lab.commandPalette.downloads,
    actions: t.lab.commandPalette.actions,
  };

  return (
    <>
      <Button
        aria-keyshortcuts="Control+K Meta+K"
        aria-label={t.lab.commandPalette.title}
        className="fixed right-4 bottom-4 z-50 min-h-10 rounded-full px-4 shadow-[var(--shadow-soft)]"
        onClick={openPalette}
        size="sm"
        variant="secondary"
      >
        {t.lab.commandPalette.trigger}
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-black/55 px-3 py-5 backdrop-blur-sm sm:px-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePalette();
            }
          }}
        >
          <div
            aria-modal="true"
            className="soft-reveal mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow-card)]"
            role="dialog"
          >
            <div className="border-b border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text)]">{t.lab.commandPalette.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{t.lab.commandPalette.description}</p>
                </div>
                <Button aria-label="Esc" onClick={closePalette} size="sm" variant="ghost">
                  Esc
                </Button>
              </div>
              <input
                aria-label={t.lab.commandPalette.searchPlaceholder}
                className="mt-4 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.lab.commandPalette.searchPlaceholder}
                ref={inputRef}
                type="search"
                value={query}
              />
              {status ? <p className="mt-2 text-sm text-[var(--muted)]">{status}</p> : null}
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-2">
              {filteredActions.length === 0 ? (
                <p className="p-4 text-sm text-[var(--muted)]">{t.lab.commandPalette.noResults}</p>
              ) : (
                groupedActions.map(({ actions: groupActions, group }) =>
                  groupActions.length > 0 ? (
                    <div className="py-2" key={group}>
                      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                        {groupLabels[group]}
                      </p>
                      <div className="grid gap-1">
                        {groupActions.map((action) => (
                          <button
                            className={cn(
                              "interactive-surface flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left",
                              "hover:bg-[var(--surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                            )}
                            key={action.id}
                            onClick={() => void handleRun(action)}
                            type="button"
                          >
                            <span>
                              <span className="block text-sm font-medium text-[var(--text)]">{action.label}</span>
                              <span className="mt-1 block break-all text-xs text-[var(--muted)]">{action.description}</span>
                            </span>
                            <span className="text-xs text-[var(--muted-soft)]">{t.actions.open}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null,
                )
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
