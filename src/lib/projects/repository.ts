import type { ClientSession, WithId } from "mongodb";

import { getProjectBySlug, projects as staticProjects } from "@/content/projects";
import { getMongoClient } from "@/lib/mongodb/client";
import {
  getMongoCollections,
  getMongoCollectionsFromDatabase,
  type PortfolioProjectDocument,
  type PortfolioProjectPublicationStatus,
  type PortfolioProjectRevisionDocument,
} from "@/lib/mongodb/collections";
import { readMongoConfig } from "@/lib/mongodb/config";
import {
  applyPublicProjectDetailOverlay,
  applyPublicProjectOverlay,
  parseProjectContent,
  type PublicProjectOverlayRow,
} from "@/lib/projects/project-overlay";
import type { AdminProjectMutation } from "@/lib/projects/project-schema";
import type { Project } from "@/types/portfolio";

export class ProjectNotFoundError extends Error {
  constructor() {
    super("Projeto administrativo não encontrado.");
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectConflictError extends Error {
  constructor() {
    super("Já existe um projeto administrativo com este slug.");
    this.name = "ProjectConflictError";
  }
}

export type AdminProjectRecord = {
  createdAt: string;
  id: string;
  project: Project;
  publicationStatus: PortfolioProjectPublicationStatus;
  publishedAt: string | null;
  sortOrder: number;
  updatedAt: string;
  updatedBy: string | null;
};

export type ProjectRevision = {
  action: PortfolioProjectRevisionDocument["action"];
  changedAt: string;
  changedBy: string | null;
  id: string;
  project: Project;
  publicationStatus: PortfolioProjectPublicationStatus;
  sortOrder: number;
};

function toOverlayRow(document: PortfolioProjectDocument): PublicProjectOverlayRow {
  return {
    content: document.content,
    publicationStatus: document.publicationStatus,
    slug: document.slug,
    sortOrder: document.sortOrder,
  };
}

function toAdminRecord(document: WithId<PortfolioProjectDocument>): AdminProjectRecord | null {
  const project = parseProjectContent(document.content);

  if (!project || project.slug !== document.slug) {
    return null;
  }

  return {
    createdAt: document.createdAt.toISOString(),
    id: document._id.toHexString(),
    project,
    publicationStatus: document.publicationStatus,
    publishedAt: document.publishedAt?.toISOString() ?? null,
    sortOrder: document.sortOrder,
    updatedAt: document.updatedAt.toISOString(),
    updatedBy: document.updatedBy,
  };
}

function revisionAction(
  previous: PortfolioProjectPublicationStatus,
  next: PortfolioProjectPublicationStatus,
): PortfolioProjectRevisionDocument["action"] {
  if (next === "archived") return "archive";
  if (next === "published" && previous !== "published") return "publish";
  return "update";
}

async function insertRevision(
  document: WithId<PortfolioProjectDocument>,
  action: PortfolioProjectRevisionDocument["action"],
  changedBy: string | null,
  session: ClientSession,
) {
  const { databaseName } = readMongoConfig();
  const client = await getMongoClient();
  const { portfolioProjectRevisions } = getMongoCollectionsFromDatabase(client.db(databaseName));

  await portfolioProjectRevisions.insertOne({
    action,
    changedAt: new Date(),
    changedBy,
    content: document.content,
    projectId: document._id,
    publicationStatus: document.publicationStatus,
    slug: document.slug,
    sortOrder: document.sortOrder,
  }, { session });
}

export async function getPublicProjects(): Promise<Project[]> {
  try {
    const { portfolioProjects } = await getMongoCollections();
    const documents = await portfolioProjects
      .find({})
      .sort({ sortOrder: 1, updatedAt: -1 })
      .toArray();

    if (documents.length === 0) {
      return staticProjects;
    }

    return applyPublicProjectOverlay(staticProjects, documents.map(toOverlayRow));
  } catch {
    return staticProjects;
  }
}

export async function getPublicProjectBySlug(slug: string): Promise<Project | null> {
  const staticProject = getProjectBySlug(slug) ?? null;

  try {
    const { portfolioProjects } = await getMongoCollections();
    const document = await portfolioProjects.findOne({ slug });

    return applyPublicProjectDetailOverlay(
      staticProject,
      document ? toOverlayRow(document) : null,
    );
  } catch {
    return staticProject;
  }
}

export async function getAdminProjects(): Promise<AdminProjectRecord[]> {
  const { portfolioProjects } = await getMongoCollections();
  const documents = await portfolioProjects
    .find({})
    .sort({ sortOrder: 1, updatedAt: -1 })
    .toArray();

  return documents
    .map(toAdminRecord)
    .filter((record): record is AdminProjectRecord => record !== null);
}

export async function getAdminProjectBySlug(slug: string) {
  const { portfolioProjects } = await getMongoCollections();
  const document = await portfolioProjects.findOne({ slug });

  return document ? toAdminRecord(document) : null;
}

export async function createAdminProject(input: AdminProjectMutation, updatedBy: string) {
  const client = await getMongoClient();
  const { databaseName } = readMongoConfig();
  const collections = getMongoCollectionsFromDatabase(client.db(databaseName));
  const session = client.startSession();
  let created: WithId<PortfolioProjectDocument> | null = null;

  try {
    await session.withTransaction(async () => {
      const existing = await collections.portfolioProjects.findOne(
        { slug: input.project.slug },
        { session },
      );

      if (existing) {
        throw new ProjectConflictError();
      }

      const now = new Date();
      const document: PortfolioProjectDocument = {
        content: input.project as Project,
        createdAt: now,
        publicationStatus: input.publicationStatus,
        publishedAt: input.publicationStatus === "published" ? now : null,
        slug: input.project.slug,
        sortOrder: input.sortOrder,
        updatedAt: now,
        updatedBy,
      };
      const result = await collections.portfolioProjects.insertOne(document, { session });
      created = { ...document, _id: result.insertedId };
      await insertRevision(created, "create", updatedBy, session);
    });
  } finally {
    await session.endSession();
  }

  const record = created ? toAdminRecord(created) : null;
  if (!record) {
    throw new Error("O projeto criado não passou na validação de leitura.");
  }

  return record;
}

export async function updateAdminProject(input: AdminProjectMutation, updatedBy: string) {
  const client = await getMongoClient();
  const { databaseName } = readMongoConfig();
  const collections = getMongoCollectionsFromDatabase(client.db(databaseName));
  const session = client.startSession();
  let updated: WithId<PortfolioProjectDocument> | null = null;

  try {
    await session.withTransaction(async () => {
      const existing = await collections.portfolioProjects.findOne(
        { slug: input.project.slug },
        { session },
      );

      if (!existing) {
        throw new ProjectNotFoundError();
      }

      await insertRevision(
        existing,
        revisionAction(existing.publicationStatus, input.publicationStatus),
        updatedBy,
        session,
      );

      const now = new Date();
      const publishedAt = input.publicationStatus === "published"
        ? existing.publishedAt ?? now
        : null;

      await collections.portfolioProjects.updateOne(
        { _id: existing._id },
        {
          $set: {
            content: input.project as Project,
            publicationStatus: input.publicationStatus,
            publishedAt,
            sortOrder: input.sortOrder,
            updatedAt: now,
            updatedBy,
          },
        },
        { session },
      );

      updated = {
        ...existing,
        content: input.project as Project,
        publicationStatus: input.publicationStatus,
        publishedAt,
        sortOrder: input.sortOrder,
        updatedAt: now,
        updatedBy,
      };
    });
  } finally {
    await session.endSession();
  }

  const record = updated ? toAdminRecord(updated) : null;
  if (!record) {
    throw new Error("O projeto atualizado não passou na validação de leitura.");
  }

  return record;
}

export async function archiveAdminProject(slug: string, updatedBy: string) {
  const client = await getMongoClient();
  const { databaseName } = readMongoConfig();
  const collections = getMongoCollectionsFromDatabase(client.db(databaseName));
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const existing = await collections.portfolioProjects.findOne({ slug }, { session });

      if (!existing) {
        throw new ProjectNotFoundError();
      }

      if (existing.publicationStatus === "archived") {
        return;
      }

      await insertRevision(existing, "archive", updatedBy, session);
      await collections.portfolioProjects.updateOne(
        { _id: existing._id },
        {
          $set: {
            publicationStatus: "archived",
            publishedAt: null,
            updatedAt: new Date(),
            updatedBy,
          },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}

export async function importStaticProjects(updatedBy: string) {
  const client = await getMongoClient();
  const { databaseName } = readMongoConfig();
  const collections = getMongoCollectionsFromDatabase(client.db(databaseName));
  const session = client.startSession();
  let imported = 0;

  try {
    await session.withTransaction(async () => {
      for (const [index, project] of staticProjects.entries()) {
        const existing = await collections.portfolioProjects.findOne({ slug: project.slug }, { session });

        if (existing) {
          continue;
        }

        const now = new Date();
        const document: PortfolioProjectDocument = {
          content: project,
          createdAt: now,
          publicationStatus: "published",
          publishedAt: now,
          slug: project.slug,
          sortOrder: index * 10,
          updatedAt: now,
          updatedBy,
        };
        const result = await collections.portfolioProjects.insertOne(document, { session });
        await insertRevision({ ...document, _id: result.insertedId }, "create", updatedBy, session);
        imported += 1;
      }
    });
  } finally {
    await session.endSession();
  }

  return imported;
}

export async function getProjectRevisions(slug: string): Promise<ProjectRevision[]> {
  const { portfolioProjectRevisions } = await getMongoCollections();
  const documents = await portfolioProjectRevisions
    .find({ slug })
    .sort({ changedAt: -1 })
    .limit(20)
    .toArray();

  return documents.flatMap((document) => {
    const project = parseProjectContent(document.content);

    return project ? [{
      action: document.action,
      changedAt: document.changedAt.toISOString(),
      changedBy: document.changedBy,
      id: document._id.toHexString(),
      project,
      publicationStatus: document.publicationStatus,
      sortOrder: document.sortOrder,
    }] : [];
  });
}
