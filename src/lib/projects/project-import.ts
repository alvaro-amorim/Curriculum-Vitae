import type { ClientSession, WithId } from "mongodb";
import { z } from "zod";

import { getMongoClient } from "../mongodb/client.ts";
import {
  getMongoCollectionsFromDatabase,
  type MongoCollections,
  type PortfolioProjectDocument,
  type PortfolioProjectPublicationStatus,
} from "../mongodb/collections.ts";
import { readMongoConfig } from "../mongodb/config.ts";
import type { Project } from "../../types/portfolio.ts";
import type { ProjectCollectionId } from "./project-collection.ts";
import type { ProjectHomePlacement } from "./home-placement.ts";

export const PROJECT_IMPORT_SCHEMA_VERSION = "1.0" as const;
export const PROJECT_IMPORT_MAX_BYTES = 1024 * 1024;
export const PROJECT_IMPORT_MAX_PROJECTS = 20;
export const PROJECT_IMPORT_TEMPLATE_FILE_NAME = "portfolio-project-import.template.json";

export const PROJECT_IMPORT_AI_INSTRUCTION = `Analise profundamente o repositório que vou informar. Entenda o objetivo, funcionalidades, arquitetura, stack, diferenciais, desafios técnicos e estágio atual do projeto.

Depois, preencha exatamente a estrutura do arquivo JSON fornecido.

Regras:
- não invente funcionalidades;
- use apenas informações comprovadas pelo código e documentação;
- escreva cópias profissionais para portfólio;
- preencha português e inglês;
- preserve exatamente os nomes dos campos;
- retorne somente JSON válido;
- não inclua Markdown;
- não inclua imagens ou mídias;
- defina coleção, publicação, Home e carrossel conscientemente;
- o mesmo JSON pode criar projetos novos e atualizar projetos existentes.`;

const EXECUTABLE_TEXT_PATTERN = /<\s*(?:script|iframe|object|embed|svg|link|meta|style)\b|javascript\s*:|on[a-z]+\s*=/i;
const SlugSchema = z
  .string()
  .min(2, "Slug obrigatório.")
  .max(80, "Slug muito longo.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use slug em lowercase e kebab-case.");
const TextSchema = z
  .string()
  .trim()
  .min(1, "Campo obrigatório.")
  .max(4_000, "Texto muito longo.")
  .refine((value) => !EXECUTABLE_TEXT_PATTERN.test(value), "Conteúdo executável não é permitido.");
const ShortTextSchema = TextSchema.max(180, "Texto muito longo.");
const ImportUrlSchema = z
  .string()
  .trim()
  .max(2_048, "URL muito longa.")
  .optional()
  .transform((value) => value ?? "")
  .refine((value) => {
    if (!value) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Use uma URL HTTP ou HTTPS.");
const LocalizedShortTextSchema = z.object({
  en: ShortTextSchema,
  pt: ShortTextSchema,
}).strict();
const LocalizedLongTextSchema = z.object({
  en: TextSchema,
  pt: TextSchema,
}).strict();
const LocalizedListSchema = z.object({
  en: z.array(ShortTextSchema).min(1, "Informe pelo menos um item.").max(12),
  pt: z.array(ShortTextSchema).min(1, "Informe pelo menos um item.").max(12),
}).strict().superRefine((value, context) => {
  if (value.en.length !== value.pt.length) {
    context.addIssue({
      code: "custom",
      message: "As listas PT e EN precisam ter a mesma quantidade de itens.",
      path: ["en"],
    });
  }
});

const ProjectHomePlacementImportSchema = z.object({
  carouselOrder: z.number().int().safe().min(0).max(10_000),
  homeOrder: z.number().int().safe().min(0).max(10_000),
  showInCarousel: z.boolean(),
  showInHome: z.boolean(),
}).strict();

export const ProjectJsonImportProjectSchema = z.object({
  category: z.array(ShortTextSchema).min(1).max(8),
  collection: z.enum(["primary", "labs", "secondary"]),
  featured: z.boolean().default(false),
  fullDescription: LocalizedLongTextSchema,
  highlights: LocalizedListSchema,
  homePlacement: ProjectHomePlacementImportSchema,
  links: z.object({
    repository: ImportUrlSchema,
    website: ImportUrlSchema,
  }).strict(),
  problem: LocalizedLongTextSchema,
  publicationStatus: z.enum(["draft", "published", "archived"]),
  shortDescription: LocalizedLongTextSchema,
  slug: SlugSchema,
  solution: LocalizedLongTextSchema,
  sortOrder: z.number().int().safe().min(0).max(10_000),
  stack: z.array(ShortTextSchema).min(1).max(16),
  status: LocalizedShortTextSchema,
  subtitle: LocalizedShortTextSchema,
  technicalChallenges: LocalizedListSchema,
  title: LocalizedShortTextSchema,
  whatItShows: LocalizedLongTextSchema,
}).strict();

export const ProjectJsonImportPayloadSchema = z.object({
  projects: z.array(ProjectJsonImportProjectSchema).min(1).max(PROJECT_IMPORT_MAX_PROJECTS),
  schemaVersion: z.literal(PROJECT_IMPORT_SCHEMA_VERSION),
}).strict();

export const ProjectJsonImportRequestSchema = z.object({
  mode: z.enum(["import", "validate"]),
  payload: z.unknown(),
}).strict();

export type ProjectJsonImportProject = z.infer<typeof ProjectJsonImportProjectSchema>;
export type ProjectJsonImportPayload = z.infer<typeof ProjectJsonImportPayloadSchema>;

export type ProjectImportPreviewItem = {
  action: "create" | "update";
  errors: string[];
  existing: boolean;
  importable: boolean;
  project: Project | null;
  rawSlug: string | null;
  summary: {
    categories: string[];
    collection: ProjectCollectionId | null;
    featured: boolean;
    publicationStatus: PortfolioProjectPublicationStatus | null;
    repository: string;
    showInCarousel: boolean;
    showInHome: boolean;
    slug: string;
    sortOrder: number | null;
    stack: string[];
    status: string;
    subtitle: string;
    titleEn: string;
    titlePt: string;
  };
};

export type ProjectImportPreview = {
  createCount: number;
  duplicateSlugs: string[];
  existingSlugs: string[];
  invalidCount: number;
  projects: ProjectImportPreviewItem[];
  schemaVersion: string | null;
  updateCount: number;
  validCount: number;
};

export type ProjectSyncResultItem = {
  action: "created" | "updated";
  slug: string;
  title: string;
};

type ProjectImportCollections = Pick<MongoCollections, "portfolioProjectRevisions" | "portfolioProjects">;

export const PROJECT_IMPORT_TEMPLATE: ProjectJsonImportPayload = {
  schemaVersion: PROJECT_IMPORT_SCHEMA_VERSION,
  projects: [
    {
      slug: "nome-do-projeto",
      publicationStatus: "draft",
      sortOrder: 60,
      collection: "secondary",
      featured: false,
      homePlacement: {
        showInHome: false,
        homeOrder: 1_000,
        showInCarousel: false,
        carouselOrder: 1_000,
      },
      title: {
        pt: "Nome do projeto",
        en: "Project name",
      },
      subtitle: {
        pt: "Resumo curto do produto",
        en: "Short product summary",
      },
      status: {
        pt: "Em desenvolvimento",
        en: "In development",
      },
      category: [
        "SaaS",
        "Inteligência artificial",
      ],
      stack: [
        "Next.js",
        "TypeScript",
        "MongoDB",
      ],
      shortDescription: {
        pt: "Descrição curta usada nos cards e listagens.",
        en: "Short description used in cards and listings.",
      },
      fullDescription: {
        pt: "Descrição completa apresentando o produto, o público e sua proposta de valor.",
        en: "Full description presenting the product, audience, and value proposition.",
      },
      problem: {
        pt: "Problema real que motivou a criação do projeto.",
        en: "Real problem that motivated the project.",
      },
      solution: {
        pt: "Como o projeto resolve esse problema.",
        en: "How the project solves that problem.",
      },
      highlights: {
        pt: [
          "Destaque principal do projeto",
          "Segunda capacidade relevante",
          "Terceiro diferencial",
        ],
        en: [
          "Main project highlight",
          "Second relevant capability",
          "Third differentiator",
        ],
      },
      technicalChallenges: {
        pt: [
          "Principal desafio técnico enfrentado",
          "Decisão arquitetural importante",
        ],
        en: [
          "Main technical challenge",
          "Important architectural decision",
        ],
      },
      whatItShows: {
        pt: "O que este projeto demonstra sobre minhas capacidades profissionais.",
        en: "What this project demonstrates about my professional capabilities.",
      },
      links: {
        website: "",
        repository: "https://github.com/usuario/repositorio",
      },
    },
  ],
};

export function stringifyProjectImportTemplate() {
  return `${JSON.stringify(PROJECT_IMPORT_TEMPLATE, null, 2)}\n`;
}

export function buildProjectImportTemplateResponse() {
  return new Response(stringifyProjectImportTemplate(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${PROJECT_IMPORT_TEMPLATE_FILE_NAME}"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function isProjectImportJsonFile(fileName: string, mimeType?: string) {
  const hasJsonExtension = /\.json$/i.test(fileName.trim());
  return hasJsonExtension && (!mimeType || mimeType === "application/json" || mimeType === "text/json");
}

function issuesToMessages(error: z.ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });
}

function projectFromImport(input: ProjectJsonImportProject): Project {
  return {
    category: input.category,
    featured: input.featured,
    fullDescription: input.fullDescription,
    highlights: input.highlights,
    links: {
      website: input.links.website,
      ...(input.links.repository ? { repository: input.links.repository } : {}),
    },
    problem: input.problem,
    shortDescription: input.shortDescription,
    slug: input.slug,
    solution: input.solution,
    stack: input.stack,
    status: input.status,
    subtitle: input.subtitle,
    technicalChallenges: input.technicalChallenges,
    title: input.title,
    whatItShows: input.whatItShows,
  };
}

function emptySummary(raw: unknown): ProjectImportPreviewItem["summary"] {
  const record = raw && typeof raw === "object" && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : {};
  const title = record.title && typeof record.title === "object" ? record.title as Record<string, unknown> : {};
  const subtitle = record.subtitle && typeof record.subtitle === "object" ? record.subtitle as Record<string, unknown> : {};
  const status = record.status && typeof record.status === "object" ? record.status as Record<string, unknown> : {};
  const links = record.links && typeof record.links === "object" ? record.links as Record<string, unknown> : {};
  const placement = record.homePlacement && typeof record.homePlacement === "object"
    ? record.homePlacement as Record<string, unknown>
    : {};

  return {
    categories: Array.isArray(record.category) ? record.category.filter((item): item is string => typeof item === "string") : [],
    collection: record.collection === "primary" || record.collection === "labs" || record.collection === "secondary"
      ? record.collection
      : null,
    featured: typeof record.featured === "boolean" ? record.featured : false,
    publicationStatus: record.publicationStatus === "draft" || record.publicationStatus === "published" || record.publicationStatus === "archived"
      ? record.publicationStatus
      : null,
    repository: typeof links.repository === "string" ? links.repository : "",
    showInCarousel: placement.showInCarousel === true,
    showInHome: placement.showInHome === true,
    slug: typeof record.slug === "string" ? record.slug : "",
    sortOrder: typeof record.sortOrder === "number" && Number.isSafeInteger(record.sortOrder) ? record.sortOrder : null,
    stack: Array.isArray(record.stack) ? record.stack.filter((item): item is string => typeof item === "string") : [],
    status: typeof status.pt === "string" ? status.pt : "",
    subtitle: typeof subtitle.pt === "string" ? subtitle.pt : "",
    titleEn: typeof title.en === "string" ? title.en : "",
    titlePt: typeof title.pt === "string" ? title.pt : "",
  };
}

export function buildProjectImportPreview(
  payload: unknown,
  existingSlugValues: Iterable<string> = [],
): ProjectImportPreview {
  const topLevel = z.object({
    projects: z.array(z.unknown()).min(1).max(PROJECT_IMPORT_MAX_PROJECTS),
    schemaVersion: z.literal(PROJECT_IMPORT_SCHEMA_VERSION),
  }).strict().safeParse(payload);

  if (!topLevel.success) {
    return {
      createCount: 0,
      duplicateSlugs: [],
      existingSlugs: [],
      invalidCount: 1,
      projects: [{
        action: "create",
        errors: issuesToMessages(topLevel.error),
        existing: false,
        importable: false,
        project: null,
        rawSlug: null,
        summary: emptySummary(payload),
      }],
      schemaVersion: payload && typeof payload === "object" && "schemaVersion" in payload
        ? String((payload as { schemaVersion?: unknown }).schemaVersion)
        : null,
      updateCount: 0,
      validCount: 0,
    };
  }

  const existingSlugs = new Set(existingSlugValues);
  const slugOccurrences = new Map<string, number>();

  for (const item of topLevel.data.projects) {
    if (item && typeof item === "object" && "slug" in item && typeof (item as { slug?: unknown }).slug === "string") {
      const slug = (item as { slug: string }).slug;
      slugOccurrences.set(slug, (slugOccurrences.get(slug) ?? 0) + 1);
    }
  }

  const duplicateSlugs = [...slugOccurrences.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug)
    .sort();

  const projects = topLevel.data.projects.map((item): ProjectImportPreviewItem => {
    const parsed = ProjectJsonImportProjectSchema.safeParse(item);
    const rawSlug = item && typeof item === "object" && "slug" in item && typeof (item as { slug?: unknown }).slug === "string"
      ? (item as { slug: string }).slug
      : null;
    const errors = parsed.success ? [] : issuesToMessages(parsed.error);

    if (rawSlug && duplicateSlugs.includes(rawSlug)) {
      errors.push("Slug duplicado dentro do arquivo.");
    }

    const existing = rawSlug ? existingSlugs.has(rawSlug) : false;
    const project = parsed.success ? projectFromImport(parsed.data) : null;
    const summary = parsed.success
      ? {
          categories: parsed.data.category,
          collection: parsed.data.collection,
          featured: parsed.data.featured,
          publicationStatus: parsed.data.publicationStatus,
          repository: parsed.data.links.repository,
          showInCarousel: parsed.data.homePlacement.showInCarousel,
          showInHome: parsed.data.homePlacement.showInHome,
          slug: parsed.data.slug,
          sortOrder: parsed.data.sortOrder,
          stack: parsed.data.stack,
          status: parsed.data.status.pt,
          subtitle: parsed.data.subtitle.pt,
          titleEn: parsed.data.title.en,
          titlePt: parsed.data.title.pt,
        }
      : emptySummary(item);

    return {
      action: existing ? "update" : "create",
      errors,
      existing,
      importable: errors.length === 0 && project !== null,
      project,
      rawSlug,
      summary,
    };
  });

  const validProjects = projects.filter((project) => project.importable);
  const previewExistingSlugs = projects
    .filter((project) => project.existing && project.rawSlug)
    .map((project) => project.rawSlug as string)
    .sort();

  return {
    createCount: validProjects.filter((project) => !project.existing).length,
    duplicateSlugs,
    existingSlugs: previewExistingSlugs,
    invalidCount: projects.filter((project) => !project.importable).length,
    projects,
    schemaVersion: topLevel.data.schemaVersion,
    updateCount: validProjects.filter((project) => project.existing).length,
    validCount: validProjects.length,
  };
}

async function existingSlugsForPayload(payload: unknown, collections: ProjectImportCollections) {
  const parsed = z.object({
    projects: z.array(z.object({
      slug: z.string(),
    }).passthrough()).default([]),
  }).passthrough().safeParse(payload);

  if (!parsed.success) {
    return new Set<string>();
  }

  const slugs = [...new Set(parsed.data.projects.map((project) => project.slug))];

  if (slugs.length === 0) {
    return new Set<string>();
  }

  const existing = await collections.portfolioProjects
    .find({ slug: { $in: slugs } }, { projection: { slug: 1 } })
    .toArray();

  return new Set(existing.map((project) => project.slug));
}

export async function previewProjectJsonImport(
  payload: unknown,
  options?: { collections?: ProjectImportCollections },
) {
  const collections = options?.collections ?? await (async () => {
    const { databaseName } = readMongoConfig();
    const client = await getMongoClient();
    return getMongoCollectionsFromDatabase(client.db(databaseName));
  })();
  const existingSlugs = await existingSlugsForPayload(payload, collections);

  return buildProjectImportPreview(payload, existingSlugs);
}

function publishedAtForSync(
  status: PortfolioProjectPublicationStatus,
  existing: PortfolioProjectDocument | null,
  now: Date,
) {
  if (status !== "published") {
    return null;
  }

  return existing?.publishedAt ?? now;
}

function preserveExistingVisuals(project: Project, existing: PortfolioProjectDocument | null) {
  return existing?.content.visuals
    ? { ...project, visuals: existing.content.visuals }
    : project;
}

async function insertSyncRevision(
  collections: ProjectImportCollections,
  document: WithId<PortfolioProjectDocument>,
  action: "create" | "update",
  changedBy: string,
  session?: ClientSession,
) {
  await collections.portfolioProjectRevisions.insertOne({
    action,
    changedAt: new Date(),
    changedBy,
    collection: document.collection,
    content: document.content,
    homePlacement: document.homePlacement,
    projectId: document._id,
    publicationStatus: document.publicationStatus,
    slug: document.slug,
    sortOrder: document.sortOrder,
  }, { session });
}

export async function syncProjectJsonProjects(
  payload: unknown,
  updatedBy: string,
  options?: {
    collections?: ProjectImportCollections;
    runInTransaction?: (callback: (session?: ClientSession) => Promise<void>) => Promise<void>;
  },
) {
  const client = options?.collections ? null : await getMongoClient();
  const collections = options?.collections ?? (() => {
    const { databaseName } = readMongoConfig();
    return getMongoCollectionsFromDatabase(client!.db(databaseName));
  })();
  const preview = await previewProjectJsonImport(payload, { collections });
  const parsedPayload = ProjectJsonImportPayloadSchema.safeParse(payload);
  const synced: ProjectSyncResultItem[] = [];

  if (!parsedPayload.success || preview.invalidCount > 0) {
    return {
      preview,
      synced,
    };
  }

  const syncAll = async (session?: ClientSession) => {
    for (const sourceProject of parsedPayload.data.projects) {
      const existing = await collections.portfolioProjects.findOne({ slug: sourceProject.slug }, { session });
      const project = preserveExistingVisuals(projectFromImport(sourceProject), existing);
      const now = new Date();
      const homePlacement: ProjectHomePlacement = sourceProject.homePlacement;

      if (existing?._id) {
        await insertSyncRevision(
          collections,
          existing as WithId<PortfolioProjectDocument>,
          "update",
          updatedBy,
          session,
        );

        await collections.portfolioProjects.updateOne(
          { _id: existing._id },
          {
            $set: {
              collection: sourceProject.collection,
              content: project,
              homePlacement,
              publicationStatus: sourceProject.publicationStatus,
              publishedAt: publishedAtForSync(sourceProject.publicationStatus, existing, now),
              sortOrder: sourceProject.sortOrder,
              updatedAt: now,
              updatedBy,
            },
          },
          { session },
        );

        synced.push({
          action: "updated",
          slug: sourceProject.slug,
          title: sourceProject.title.pt,
        });
        continue;
      }

      const document: PortfolioProjectDocument = {
        collection: sourceProject.collection,
        content: project,
        createdAt: now,
        homePlacement,
        publicationStatus: sourceProject.publicationStatus,
        publishedAt: publishedAtForSync(sourceProject.publicationStatus, null, now),
        slug: sourceProject.slug,
        sortOrder: sourceProject.sortOrder,
        updatedAt: now,
        updatedBy,
      };
      const result = await collections.portfolioProjects.insertOne(document, { session });
      const createdDocument: WithId<PortfolioProjectDocument> = {
        ...document,
        _id: result.insertedId,
      };

      await insertSyncRevision(collections, createdDocument, "create", updatedBy, session);
      synced.push({
        action: "created",
        slug: sourceProject.slug,
        title: sourceProject.title.pt,
      });
    }
  };

  if (options?.runInTransaction) {
    await options.runInTransaction(syncAll);
  } else {
    const session = client!.startSession();

    try {
      await session.withTransaction(() => syncAll(session));
    } finally {
      await session.endSession();
    }
  }

  return {
    preview,
    synced,
  };
}

/** @deprecated Use syncProjectJsonProjects. */
export const importProjectJsonDrafts = syncProjectJsonProjects;
