"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import type { ProjectRevision } from "@/lib/projects/repository";
import type { Project } from "@/types/portfolio";

import styles from "./admin-projects.module.css";

type EditorProps = {
  initialProject?: Project;
  initialPublicationStatus?: "draft" | "published" | "archived";
  initialSortOrder?: number;
  mode: "create" | "edit";
  revisions?: ProjectRevision[];
};

type ApiResponse = {
  data?: {
    project?: {
      project: Project;
    };
  };
  error?: {
    message?: string;
  };
  ok: boolean;
};

const emptyProject: Project = {
  category: ["SaaS"],
  featured: false,
  fullDescription: { en: "Project full description.", pt: "Descrição completa do projeto." },
  highlights: { en: ["Main highlight"], pt: ["Destaque principal"] },
  links: { website: "https://example.com" },
  problem: { en: "Problem solved by the project.", pt: "Problema resolvido pelo projeto." },
  shortDescription: { en: "Short project description.", pt: "Descrição curta do projeto." },
  slug: "novo-projeto",
  solution: { en: "Solution developed for the project.", pt: "Solução desenvolvida para o projeto." },
  stack: ["Next.js", "TypeScript"],
  status: { en: "In development", pt: "Em desenvolvimento" },
  subtitle: { en: "Project subtitle", pt: "Subtítulo do projeto" },
  technicalChallenges: { en: ["Main technical challenge"], pt: ["Desafio técnico principal"] },
  title: { en: "New Project", pt: "Novo Projeto" },
  whatItShows: { en: "What this project demonstrates.", pt: "O que este projeto demonstra." },
};

function listToText(values: string[]) {
  return values.join("\n");
}

function textToList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function commaList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringValue(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

export function AdminProjectEditor({
  initialProject = emptyProject,
  initialPublicationStatus = "draft",
  initialSortOrder = 0,
  mode,
  revisions = [],
}: EditorProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success">("success");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const slug = stringValue(form, "slug");
    const repository = stringValue(form, "repository");
    const project: Project = {
      category: commaList(form.get("category")),
      featured: form.get("featured") === "on",
      fullDescription: {
        en: stringValue(form, "fullDescriptionEn"),
        pt: stringValue(form, "fullDescriptionPt"),
      },
      highlights: {
        en: textToList(form.get("highlightsEn")),
        pt: textToList(form.get("highlightsPt")),
      },
      links: {
        ...(repository ? { repository } : {}),
        website: stringValue(form, "website"),
      },
      problem: {
        en: stringValue(form, "problemEn"),
        pt: stringValue(form, "problemPt"),
      },
      shortDescription: {
        en: stringValue(form, "shortDescriptionEn"),
        pt: stringValue(form, "shortDescriptionPt"),
      },
      slug,
      solution: {
        en: stringValue(form, "solutionEn"),
        pt: stringValue(form, "solutionPt"),
      },
      stack: commaList(form.get("stack")),
      status: {
        en: stringValue(form, "statusEn"),
        pt: stringValue(form, "statusPt"),
      },
      subtitle: {
        en: stringValue(form, "subtitleEn"),
        pt: stringValue(form, "subtitlePt"),
      },
      technicalChallenges: {
        en: textToList(form.get("technicalChallengesEn")),
        pt: textToList(form.get("technicalChallengesPt")),
      },
      title: {
        en: stringValue(form, "titleEn"),
        pt: stringValue(form, "titlePt"),
      },
      ...(initialProject.visuals ? { visuals: initialProject.visuals } : {}),
      whatItShows: {
        en: stringValue(form, "whatItShowsEn"),
        pt: stringValue(form, "whatItShowsPt"),
      },
    };
    const payload = {
      project,
      publicationStatus: stringValue(form, "publicationStatus"),
      sortOrder: Number(stringValue(form, "sortOrder")),
    };
    const endpoint = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${initialProject.slug}`;

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: mode === "create" ? "POST" : "PUT",
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok || !body.ok) {
        setTone("error");
        setMessage(body.error?.message || "Não foi possível salvar o projeto.");
        return;
      }

      setTone("success");
      setMessage("Projeto salvo com sucesso.");

      if (mode === "create") {
        router.replace(`/admin/projects/${slug}`);
      }

      router.refresh();
    } catch {
      setTone("error");
      setMessage("Não foi possível conectar ao endpoint administrativo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      {message ? <div className={styles.notice} data-tone={tone}>{message}</div> : null}

      <section className={styles.editorSection}>
        <h2>Publicação e identificação</h2>
        <p>O slug fica bloqueado depois da criação para preservar URLs e histórico.</p>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            Slug
            <input defaultValue={initialProject.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" readOnly={mode === "edit"} required />
          </label>
          <label className={styles.field}>
            Status de publicação
            <select defaultValue={initialPublicationStatus} name="publicationStatus">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className={styles.field}>
            Ordem
            <input defaultValue={initialSortOrder} min="0" name="sortOrder" required type="number" />
          </label>
          <label className={styles.checkboxField}>
            <input defaultChecked={initialProject.featured} name="featured" type="checkbox" />
            Projeto em destaque
          </label>
          <label className={styles.fullField}>
            Categorias separadas por vírgula
            <input defaultValue={initialProject.category.join(", ")} name="category" required />
          </label>
          <label className={styles.fullField}>
            Stack separada por vírgula
            <input defaultValue={initialProject.stack.join(", ")} name="stack" required />
          </label>
          <label className={styles.field}>
            Website
            <input defaultValue={initialProject.links.website} name="website" required type="url" />
          </label>
          <label className={styles.field}>
            Repositório opcional
            <input defaultValue={initialProject.links.repository ?? ""} name="repository" type="url" />
          </label>
        </div>
      </section>

      <section className={styles.editorSection}>
        <h2>Identidade bilíngue</h2>
        <p>Títulos, subtítulos e descrições usadas no índice e na metadata.</p>
        <div className={styles.localizedGrid}>
          <label className={styles.field}>Título PT<input defaultValue={initialProject.title.pt} name="titlePt" required /></label>
          <label className={styles.field}>Title EN<input defaultValue={initialProject.title.en} name="titleEn" required /></label>
          <label className={styles.field}>Subtítulo PT<input defaultValue={initialProject.subtitle.pt} name="subtitlePt" required /></label>
          <label className={styles.field}>Subtitle EN<input defaultValue={initialProject.subtitle.en} name="subtitleEn" required /></label>
          <label className={styles.field}>Status PT<input defaultValue={initialProject.status.pt} name="statusPt" required /></label>
          <label className={styles.field}>Status EN<input defaultValue={initialProject.status.en} name="statusEn" required /></label>
          <label className={styles.field}>Descrição curta PT<textarea defaultValue={initialProject.shortDescription.pt} name="shortDescriptionPt" required /></label>
          <label className={styles.field}>Short description EN<textarea defaultValue={initialProject.shortDescription.en} name="shortDescriptionEn" required /></label>
          <label className={styles.field}>Descrição completa PT<textarea defaultValue={initialProject.fullDescription.pt} name="fullDescriptionPt" required /></label>
          <label className={styles.field}>Full description EN<textarea defaultValue={initialProject.fullDescription.en} name="fullDescriptionEn" required /></label>
        </div>
      </section>

      <section className={styles.editorSection}>
        <h2>Case study</h2>
        <p>Contexto, solução e evidências apresentadas na página do projeto.</p>
        <div className={styles.localizedGrid}>
          <label className={styles.field}>Problema PT<textarea defaultValue={initialProject.problem.pt} name="problemPt" required /></label>
          <label className={styles.field}>Problem EN<textarea defaultValue={initialProject.problem.en} name="problemEn" required /></label>
          <label className={styles.field}>Solução PT<textarea defaultValue={initialProject.solution.pt} name="solutionPt" required /></label>
          <label className={styles.field}>Solution EN<textarea defaultValue={initialProject.solution.en} name="solutionEn" required /></label>
          <label className={styles.field}>O que demonstra PT<textarea defaultValue={initialProject.whatItShows.pt} name="whatItShowsPt" required /></label>
          <label className={styles.field}>What it shows EN<textarea defaultValue={initialProject.whatItShows.en} name="whatItShowsEn" required /></label>
          <label className={styles.field}>Destaques PT · um por linha<textarea defaultValue={listToText(initialProject.highlights.pt)} name="highlightsPt" required /></label>
          <label className={styles.field}>Highlights EN · one per line<textarea defaultValue={listToText(initialProject.highlights.en)} name="highlightsEn" required /></label>
          <label className={styles.field}>Desafios técnicos PT · um por linha<textarea defaultValue={listToText(initialProject.technicalChallenges.pt)} name="technicalChallengesPt" required /></label>
          <label className={styles.field}>Technical challenges EN · one per line<textarea defaultValue={listToText(initialProject.technicalChallenges.en)} name="technicalChallengesEn" required /></label>
        </div>
      </section>

      {revisions.length > 0 ? (
        <section className={styles.editorSection}>
          <h2>Histórico recente</h2>
          <p>As últimas versões são registradas automaticamente antes de cada alteração.</p>
          <ol className={styles.revisionList}>
            {revisions.map((revision) => (
              <li key={revision.id}>
                <strong>{revision.action}</strong>
                <span>{revision.changedBy ?? "Admin"}</span>
                <time dateTime={revision.changedAt}>{new Date(revision.changedAt).toLocaleString("pt-BR")}</time>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className={styles.formActions}>
        <Link className={styles.secondaryButton} href="/admin/projects">Cancelar</Link>
        <button className={styles.primaryButton} disabled={pending} type="submit">
          {pending ? "Salvando..." : mode === "create" ? "Criar projeto" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
