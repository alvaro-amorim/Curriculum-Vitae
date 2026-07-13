"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "./admin-projects.module.css";

type ProjectSummary = {
  publicationStatus: "draft" | "published" | "archived";
  slug: string;
  sortOrder: number;
  subtitle: string;
  title: string;
  updatedAt: string;
};

type ApiResponse = {
  data?: {
    imported?: number;
  };
  error?: {
    message?: string;
  };
  ok: boolean;
};

export function AdminProjectList({
  databaseReady,
  projects,
}: {
  databaseReady: boolean;
  projects: ProjectSummary[];
}) {
  const router = useRouter();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success" | "warning">("warning");

  async function importCatalog() {
    setImporting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/projects/import", {
        method: "POST",
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok || !body.ok) {
        setTone("error");
        setMessage(body.error?.message || "Não foi possível importar o catálogo.");
        return;
      }

      const imported = body.data?.imported ?? 0;
      setTone("success");
      setMessage(
        imported > 0
          ? `${imported} projetos adicionados ao MongoDB. Registros existentes foram preservados.`
          : "Nenhum projeto novo para importar. Os registros existentes foram preservados.",
      );
      router.refresh();
    } catch {
      setTone("error");
      setMessage("Não foi possível conectar ao endpoint de importação.");
    } finally {
      setImporting(false);
    }
  }

  async function archiveProject(slug: string) {
    const confirmed = window.confirm(`Arquivar o projeto ${slug}? Ele deixará de aparecer publicamente.`);

    if (!confirmed) {
      return;
    }

    setPendingSlug(slug);
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
      setPendingSlug(null);
    }
  }

  return (
    <>
      {!databaseReady ? (
        <div className={styles.notice} data-tone="error">
          <span>O MongoDB não está disponível. O portfólio público continua usando o catálogo estático de segurança.</span>
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
            disabled={!databaseReady || importing}
            onClick={() => void importCatalog()}
            type="button"
          >
            {importing ? "Importando..." : "Importar projetos ausentes"}
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
          {projects.map((project) => (
            <article className={styles.projectRow} key={project.slug}>
              <div className={styles.projectIdentity}>
                <strong>{project.title}</strong>
                <small>{project.subtitle}</small>
              </div>
              <div className={styles.projectMeta}>
                <small>Slug</small>
                <strong>{project.slug}</strong>
              </div>
              <div className={styles.projectMeta}>
                <small>Ordem</small>
                <strong>{project.sortOrder}</strong>
              </div>
              <div className={styles.rowActions}>
                <span className={styles.status} data-status={project.publicationStatus}>
                  {project.publicationStatus}
                </span>
                <Link className={styles.linkButton} href={`/admin/projects/${project.slug}`}>
                  Editar
                </Link>
                <button
                  className={styles.dangerButton}
                  disabled={pendingSlug === project.slug || project.publicationStatus === "archived"}
                  onClick={() => void archiveProject(project.slug)}
                  type="button"
                >
                  {pendingSlug === project.slug ? "Arquivando..." : "Arquivar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>O MongoDB ainda não possui projetos. Importe o catálogo atual ou crie um novo case.</p>
        </div>
      )}
    </>
  );
}
