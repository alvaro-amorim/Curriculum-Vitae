"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { ProjectCollectionId } from "@/lib/projects/project-collection";
import type { ProjectHomePlacement } from "@/lib/projects/home-placement";

import { AdminProjectJsonImportModal } from "./admin-project-json-import-modal";
import styles from "./admin-projects.module.css";

type ProjectSummary = {
  collection: ProjectCollectionId;
  homePlacement: ProjectHomePlacement;
  publicationStatus: "draft" | "published" | "archived";
  slug: string;
  sortOrder: number;
  subtitle: string;
  title: string;
  updatedAt: string;
};

type ApiResponse = {
  data?: {
    archived?: boolean;
    deleted?: boolean;
    deletedMediaAssets?: number;
  };
  error?: {
    message?: string;
  };
  ok: boolean;
};

type PendingAction = {
  kind: "archive" | "delete";
  slug: string;
} | null;

const collectionLabels: Record<ProjectCollectionId, string> = {
  primary: "Projeto principal",
  labs: "Laboratório técnico",
  secondary: "Outro case",
};

function placementLabel(enabled: boolean, order: number) {
  return enabled ? `Ativo · ordem ${order}` : "Oculto";
}

export function AdminProjectList({
  databaseReady,
  projects,
}: {
  databaseReady: boolean;
  projects: ProjectSummary[];
}) {
  const router = useRouter();
  const importButtonRef = useRef<HTMLButtonElement | null>(null);
  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success" | "warning">("warning");

  async function archiveProject(slug: string) {
    const confirmed = window.confirm(`Arquivar o projeto ${slug}? Ele deixará de aparecer publicamente, mas continuará no banco.`);

    if (!confirmed) {
      return;
    }

    setPendingAction({ kind: "archive", slug });
    setMessage("");

    try {
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok || !body.ok) {
        setTone("error");
        setMessage(body.error?.message || "Não foi possível arquivar o projeto.");
        return;
      }

      setTone("success");
      setMessage("Projeto arquivado e removido do catálogo público.");
      router.refresh();
    } catch {
      setTone("error");
      setMessage("Não foi possível conectar ao endpoint do projeto.");
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteProject(slug: string) {
    const typedSlug = window.prompt(
      `EXCLUSÃO PERMANENTE\n\nIsso apagará o projeto, suas revisões e mídias vinculadas.\n\nDigite exatamente o slug abaixo para confirmar:\n${slug}`,
    );

    if (typedSlug !== slug) {
      if (typedSlug !== null) {
        setTone("warning");
        setMessage("Exclusão cancelada: o slug digitado não confere.");
      }
      return;
    }

    setPendingAction({ kind: "delete", slug });
    setMessage("");

    try {
      const response = await fetch(`/api/admin/projects/${slug}/permanent`, {
        method: "DELETE",
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok || !body.ok || !body.data?.deleted) {
        setTone("error");
        setMessage(body.error?.message || "Não foi possível excluir o projeto permanentemente.");
        return;
      }

      const deletedMedia = body.data.deletedMediaAssets ?? 0;
      setTone("success");
      setMessage(
        deletedMedia > 0
          ? `Projeto excluído permanentemente com ${deletedMedia} mídia(s) vinculada(s).`
          : "Projeto excluído permanentemente do banco.",
      );
      router.refresh();
    } catch {
      setTone("error");
      setMessage("Não foi possível conectar ao endpoint de exclusão permanente.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      {!databaseReady ? (
        <div className={styles.notice} data-tone="error">
          <span>O MongoDB não está disponível. Nenhum fallback estático será publicado.</span>
        </div>
      ) : null}

      {message ? (
        <div className={styles.notice} data-tone={tone} aria-live="polite">
          <span>{message}</span>
        </div>
      ) : null}

      <div className={styles.toolbar}>
        <span>{projects.length} registros administrativos no MongoDB</span>
        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            disabled={!databaseReady}
            onClick={() => setImportModalOpen(true)}
            ref={importButtonRef}
            type="button"
          >
            Sincronizar via JSON
          </button>
          {databaseReady ? (
            <Link className={styles.primaryButton} href="/admin/projects/new">
              Novo projeto
            </Link>
          ) : (
            <button className={styles.primaryButton} disabled type="button">
              Novo projeto
            </button>
          )}
        </div>
      </div>

      {projects.length > 0 ? (
        <div className={styles.projectTable}>
          {projects.map((project) => {
            const isPending = pendingAction?.slug === project.slug;
            const isArchiving = isPending && pendingAction?.kind === "archive";
            const isDeleting = isPending && pendingAction?.kind === "delete";

            return (
              <article
                className={styles.projectRow}
                data-highlighted={highlightedSlugs.includes(project.slug)}
                key={project.slug}
              >
                <div className={styles.projectIdentity}>
                  <strong>{project.title}</strong>
                  <small>{project.subtitle}</small>
                  <small>{collectionLabels[project.collection]}</small>
                </div>
                <div className={styles.projectMeta}>
                  <small>Slug · ordem do catálogo {project.sortOrder}</small>
                  <strong>{project.slug}</strong>
                </div>
                <div className={styles.projectMeta}>
                  <small>Exibição pública</small>
                  <strong>Grade: {placementLabel(project.homePlacement.showInHome, project.homePlacement.homeOrder)}</strong>
                  <strong>Carrossel: {placementLabel(project.homePlacement.showInCarousel, project.homePlacement.carouselOrder)}</strong>
                </div>
                <div className={styles.rowActions}>
                  <span className={styles.status} data-status={project.publicationStatus}>
                    {project.publicationStatus}
                  </span>
                  <Link className={styles.linkButton} href={`/admin/projects/${project.slug}`}>
                    Editar
                  </Link>
                  <button
                    className={styles.secondaryButton}
                    disabled={isPending || project.publicationStatus === "archived"}
                    onClick={() => void archiveProject(project.slug)}
                    type="button"
                  >
                    {isArchiving ? "Arquivando..." : "Arquivar"}
                  </button>
                  <button
                    className={styles.dangerButton}
                    disabled={isPending}
                    onClick={() => void deleteProject(project.slug)}
                    type="button"
                  >
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>O MongoDB ainda não possui projetos. Sincronize um JSON administrativo ou crie um novo case.</p>
        </div>
      )}

      {importModalOpen ? (
        <AdminProjectJsonImportModal
          onClose={() => {
            setImportModalOpen(false);
            window.setTimeout(() => importButtonRef.current?.focus(), 0);
          }}
          onImported={(slugs) => {
            setHighlightedSlugs(slugs);
            setTone("success");
            setMessage(
              slugs.length === 1
                ? "Projeto sincronizado com sucesso."
                : `${slugs.length} projetos foram sincronizados com sucesso.`,
            );
            router.refresh();
            window.setTimeout(() => setHighlightedSlugs([]), 12_000);
          }}
          open
        />
      ) : null}
    </>
  );
}
