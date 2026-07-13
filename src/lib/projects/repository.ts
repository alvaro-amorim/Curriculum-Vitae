import { getProjectBySlug, projects as staticProjects } from "@/content/projects";
import {
  applyPublicProjectDetailOverlay,
  applyPublicProjectOverlay,
  parseProjectContent,
  type PublicProjectOverlayRow,
} from "@/lib/projects/project-overlay";
import type { AdminProjectMutation } from "@/lib/projects/project-schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Project } from "@/types/portfolio";

export type ProjectPublicationStatus = "draft" | "published" | "archived";

export type AdminProjectRecord = {
  createdAt: string;
  id: string;
  project: Project;
  publicationStatus: ProjectPublicationStatus;
  publishedAt: string | null;
  sortOrder: number;
  updatedAt: string;
  updatedBy: string | null;
};

export type ProjectRevision = {
  action: "update" | "delete";
  changedAt: string;
  changedBy: string | null;
  id: number;
  project: Project;
  publicationStatus: ProjectPublicationStatus;
  sortOrder: number;
};

type ProjectRow = {
  content: Record<string, unknown>;
  created_at: string;
  id: string;
  publication_status: ProjectPublicationStatus;
  published_at: string | null;
  slug: string;
  sort_order: number;
  updated_at: string;
  updated_by: string | null;
};

function toOverlayRow(row: Pick<ProjectRow, "content" | "publication_status" | "slug" | "sort_order">): PublicProjectOverlayRow {
  return {
    content: row.content,
    publicationStatus: row.publication_status,
    slug: row.slug,
    sortOrder: row.sort_order,
  };
}

function toAdminRecord(row: ProjectRow): AdminProjectRecord | null {
  const project = parseProjectContent(row.content);

  if (!project || project.slug !== row.slug) {
    return null;
  }

  return {
    createdAt: row.created_at,
    id: row.id,
    project,
    publicationStatus: row.publication_status,
    publishedAt: row.published_at,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

async function readAllProjectRows() {
  const supabase = getSupabaseServerClient();
  return supabase
    .from("portfolio_projects")
    .select("id, slug, content, publication_status, sort_order, published_at, created_at, updated_at, updated_by")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
}

export async function getPublicProjects(): Promise<Project[]> {
  try {
    const { data, error } = await readAllProjectRows();

    if (error || !data || data.length === 0) {
      return staticProjects;
    }

    return applyPublicProjectOverlay(
      staticProjects,
      (data as ProjectRow[]).map(toOverlayRow),
    );
  } catch {
    return staticProjects;
  }
}

export async function getPublicProjectBySlug(slug: string): Promise<Project | null> {
  const staticProject = getProjectBySlug(slug) ?? null;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("slug, content, publication_status, sort_order")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return staticProject;
    }

    return applyPublicProjectDetailOverlay(
      staticProject,
      toOverlayRow(data as Pick<ProjectRow, "content" | "publication_status" | "slug" | "sort_order">),
    );
  } catch {
    return staticProject;
  }
}

export async function getAdminProjects(): Promise<AdminProjectRecord[]> {
  const { data, error } = await readAllProjectRows();

  if (error) {
    throw new Error("A tabela de projetos ainda nao esta disponivel. Aplique a migration do Admin CRUD.");
  }

  return (data as ProjectRow[])
    .map(toAdminRecord)
    .filter((record): record is AdminProjectRecord => record !== null);
}

export async function getAdminProjectBySlug(slug: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("id, slug, content, publication_status, sort_order, published_at, created_at, updated_at, updated_by")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Nao foi possivel carregar o projeto administrativo.");
  }

  return data ? toAdminRecord(data as ProjectRow) : null;
}

export async function saveAdminProject(input: AdminProjectMutation, updatedBy: string) {
  const supabase = getSupabaseServerClient();
  const publishedAt = input.publicationStatus === "published" ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("portfolio_projects")
    .upsert(
      {
        content: input.project as unknown as Record<string, unknown>,
        publication_status: input.publicationStatus,
        published_at: publishedAt,
        slug: input.project.slug,
        sort_order: input.sortOrder,
        updated_by: updatedBy,
      },
      {
        onConflict: "slug",
      },
    )
    .select("id, slug, content, publication_status, sort_order, published_at, created_at, updated_at, updated_by")
    .single();

  if (error || !data) {
    throw new Error("Nao foi possivel salvar o projeto.");
  }

  const record = toAdminRecord(data as ProjectRow);
  if (!record) {
    throw new Error("O projeto salvo nao passou na validacao de leitura.");
  }

  return record;
}

export async function archiveAdminProject(slug: string, updatedBy: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("portfolio_projects")
    .update({
      publication_status: "archived",
      published_at: null,
      updated_by: updatedBy,
    })
    .eq("slug", slug);

  if (error) {
    throw new Error("Nao foi possivel arquivar o projeto.");
  }
}

export async function importStaticProjects(updatedBy: string) {
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const payload = staticProjects.map((project, index) => ({
    content: project as unknown as Record<string, unknown>,
    publication_status: "published" as const,
    published_at: now,
    slug: project.slug,
    sort_order: index * 10,
    updated_by: updatedBy,
  }));
  const { error } = await supabase
    .from("portfolio_projects")
    .upsert(payload, { onConflict: "slug" });

  if (error) {
    throw new Error("Nao foi possivel importar o catalogo versionado.");
  }

  return payload.length;
}

export async function getProjectRevisions(slug: string): Promise<ProjectRevision[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_project_revisions")
    .select("id, content, publication_status, sort_order, action, changed_at, changed_by")
    .eq("slug", slug)
    .order("changed_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return data.flatMap((row) => {
    const project = parseProjectContent(row.content);
    return project ? [{
      action: row.action,
      changedAt: row.changed_at,
      changedBy: row.changed_by,
      id: row.id,
      project,
      publicationStatus: row.publication_status,
      sortOrder: row.sort_order,
    }] : [];
  });
}
