import type { ClientSession, Db, ObjectId, WithId } from "mongodb";
import { ObjectId as MongoObjectId } from "mongodb";

import { getMongoClient } from "../mongodb/client.ts";
import {
  getMongoCollections,
  getMongoCollectionsFromDatabase,
  type MongoCollections,
  type PortfolioProjectDocument,
  type PortfolioProjectRevisionDocument,
  type ProjectMediaAssetDocument,
} from "../mongodb/collections.ts";
import { readMongoConfig } from "../mongodb/config.ts";
import { parseProjectContent } from "../projects/project-overlay.ts";
import type { Project, ProjectVisuals } from "../../types/portfolio.ts";

import { deleteCloudinaryProjectMedia } from "./cloudinary.ts";
import {
  PROJECT_MEDIA_MAX_ASSETS,
  PROJECT_MEDIA_PROVIDER,
  validateProjectMediaRegistrationPayload,
  type ProjectMediaRegistrationImage,
  type ProjectMediaSelection,
  type ProjectMediaResourceType,
} from "./media-rules.ts";
import {
  buildProjectVisualsFromMediaAssets,
  defaultProjectVisuals,
  type ProjectMediaVisualAsset,
} from "./project-media-visuals.ts";

export class ProjectMediaNotFoundError extends Error {
  constructor() {
    super("Mídia do projeto não encontrada.");
    this.name = "ProjectMediaNotFoundError";
  }
}

export class ProjectMediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectMediaValidationError";
  }
}

export type AdminProjectMediaAsset = {
  alt: {
    en: string;
    pt: string;
  };
  bytes: number;
  createdAt: string;
  format: string;
  height: number;
  id: string;
  position: number;
  projectSlug: string;
  provider: "cloudinary";
  publicId: string;
  resourceType: ProjectMediaResourceType;
  role: ProjectMediaAssetDocument["role"];
  secureUrl: string;
  updatedAt: string;
  width: number;
};

type RegisterProjectMediaInput = {
  createdBy: string | null;
  image: ProjectMediaRegistrationImage;
  projectSlug: string;
};

type SyncMediaInput = {
  mediaAssets: ProjectMediaSelection[] | undefined;
  project: Project;
  publicationStatus: "archived" | "draft" | "published";
  projectSlug: string;
};

type ProjectMediaCollections = Pick<MongoCollections, "portfolioProjects" | "projectMediaAssets">;

function isActiveAsset(document: ProjectMediaAssetDocument) {
  return !document.deletedAt;
}

function toObjectId(value: string) {
  if (!MongoObjectId.isValid(value)) {
    throw new ProjectMediaValidationError("Identificador de mídia inválido.");
  }

  return new MongoObjectId(value);
}

function toAdminMediaAsset(document: WithId<ProjectMediaAssetDocument>): AdminProjectMediaAsset {
  return {
    alt: document.alt,
    bytes: document.bytes,
    createdAt: document.createdAt.toISOString(),
    format: document.format,
    height: document.height,
    id: document._id.toHexString(),
    position: document.position,
    projectSlug: document.projectSlug,
    provider: document.provider,
    publicId: document.publicId,
    resourceType: document.resourceType,
    role: document.role,
    secureUrl: document.secureUrl,
    updatedAt: document.updatedAt.toISOString(),
    width: document.width,
  };
}

function ensureAltForPublishedMedia(
  publicationStatus: SyncMediaInput["publicationStatus"],
  selections: ProjectMediaSelection[],
  assetsById: Map<string, WithId<ProjectMediaAssetDocument>>,
) {
  if (publicationStatus !== "published") {
    return;
  }

  for (const selection of selections) {
    const asset = assetsById.get(selection.id);
    const roleUsesImage = selection.role === "logo" || selection.role === "thumbnail" || selection.role === "hero" || selection.role === "gallery";

    if (roleUsesImage && asset?.resourceType === "image" && (!selection.alt.pt.trim() || !selection.alt.en.trim())) {
      throw new ProjectMediaValidationError("Alt PT/EN é obrigatório para imagens publicadas.");
    }
  }
}

function validateSelections(selections: ProjectMediaSelection[], assets: WithId<ProjectMediaAssetDocument>[]) {
  if (selections.length > PROJECT_MEDIA_MAX_ASSETS) {
    throw new ProjectMediaValidationError("Limite de mídias do projeto excedido.");
  }

  const seenIds = new Set<string>();
  const assetsById = new Map(assets.map((asset) => [asset._id.toHexString(), asset]));
  let logoCount = 0;
  let thumbnailCount = 0;
  let heroCount = 0;

  for (const selection of selections) {
    if (seenIds.has(selection.id)) {
      throw new ProjectMediaValidationError("Mídia duplicada na seleção.");
    }

    seenIds.add(selection.id);
    const asset = assetsById.get(selection.id);

    if (!asset || !isActiveAsset(asset)) {
      throw new ProjectMediaValidationError("Mídia selecionada não pertence ao projeto.");
    }

    if (asset.resourceType !== "image") {
      throw new ProjectMediaValidationError("Apenas imagens podem ser usadas como mídias do projeto.");
    }

    if (selection.role === "logo") logoCount += 1;
    if (selection.role === "thumbnail") thumbnailCount += 1;
    if (selection.role === "hero") heroCount += 1;
  }

  if (logoCount > 1 || thumbnailCount > 1 || heroCount > 1) {
    throw new ProjectMediaValidationError("Logo, thumbnail e hero aceitam apenas um asset por projeto.");
  }
}

function buildProjectWithMedia(
  project: Project,
  selections: ProjectMediaSelection[],
  assets: WithId<ProjectMediaAssetDocument>[],
) {
  const assetsById = new Map(assets.map((asset) => [asset._id.toHexString(), asset]));
  const selected = selections.flatMap<ProjectMediaVisualAsset>((selection) => {
    const asset = assetsById.get(selection.id);

    if (!asset) {
      return [];
    }

    return [{
      alt: selection.alt,
      position: selection.position,
      resourceType: asset.resourceType,
      role: selection.role,
      secureUrl: asset.secureUrl,
    }];
  });

  return {
    ...project,
    visuals: buildProjectVisualsFromMediaAssets(project, selected),
  };
}

async function insertProjectRevision(
  collection: MongoCollections["portfolioProjectRevisions"],
  document: WithId<PortfolioProjectDocument>,
  action: PortfolioProjectRevisionDocument["action"],
  changedBy: string | null,
  session: ClientSession,
) {
  await collection.insertOne({
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

async function getCollectionsForTransaction(databaseName: string) {
  const client = await getMongoClient();
  return {
    client,
    collections: getMongoCollectionsFromDatabase(client.db(databaseName)),
  };
}

export async function getProjectMediaAssets(projectSlug: string) {
  const { projectMediaAssets } = await getMongoCollections();
  const documents = await projectMediaAssets
    .find({
      deletedAt: { $exists: false },
      projectSlug,
    })
    .sort({ role: 1, position: 1, createdAt: -1 })
    .toArray();

  return documents.map(toAdminMediaAsset);
}

async function readProjectMediaCollections(collections?: ProjectMediaCollections) {
  if (collections) {
    return collections;
  }

  const { portfolioProjects, projectMediaAssets } = await getMongoCollections();
  return {
    portfolioProjects,
    projectMediaAssets,
  };
}

export async function registerProjectMediaAsset(
  input: RegisterProjectMediaInput,
  options: {
    collections?: ProjectMediaCollections;
  } = {},
) {
  validateProjectMediaRegistrationPayload(input.image);

  if (input.projectSlug !== input.image.projectSlug) {
    throw new ProjectMediaValidationError("Imagem não pertence ao projeto informado.");
  }

  const { portfolioProjects, projectMediaAssets } = await readProjectMediaCollections(options.collections);
  const [project, existingAssets] = await Promise.all([
    portfolioProjects.findOne({ slug: input.projectSlug }),
    projectMediaAssets.countDocuments({
      deletedAt: { $exists: false },
      projectSlug: input.projectSlug,
    }),
  ]);

  if (!project) {
    throw new ProjectMediaNotFoundError();
  }

  if (existingAssets >= PROJECT_MEDIA_MAX_ASSETS) {
    throw new ProjectMediaValidationError("Limite de mídias do projeto excedido.");
  }

  const now = new Date();
  const document: ProjectMediaAssetDocument = {
    alt: {
      en: "",
      pt: "",
    },
    bytes: input.image.bytes,
    createdAt: now,
    createdBy: input.createdBy,
    format: input.image.format.toLowerCase(),
    height: input.image.height,
    position: existingAssets,
    projectSlug: input.projectSlug,
    provider: PROJECT_MEDIA_PROVIDER,
    publicId: input.image.publicId,
    resourceType: "image",
    role: "unassigned",
    secureUrl: input.image.secureUrl,
    updatedAt: now,
    width: input.image.width,
  };
  const result = await projectMediaAssets.insertOne(document);

  return toAdminMediaAsset({ ...document, _id: result.insertedId });
}

export async function syncProjectMediaSelection(
  input: SyncMediaInput,
  options: {
    collections: MongoCollections;
    session: ClientSession;
  },
) {
  if (!input.mediaAssets) {
    return input.project;
  }

  const objectIds = input.mediaAssets.map((selection) => toObjectId(selection.id));
  const assets = objectIds.length === 0
    ? []
    : await options.collections.projectMediaAssets
      .find({
        _id: { $in: objectIds },
        projectSlug: input.projectSlug,
      }, { session: options.session })
      .toArray();
  const assetsById = new Map(assets.map((asset) => [asset._id.toHexString(), asset]));

  validateSelections(input.mediaAssets, assets);
  ensureAltForPublishedMedia(input.publicationStatus, input.mediaAssets, assetsById);

  await Promise.all(input.mediaAssets.map((selection) => options.collections.projectMediaAssets.updateOne(
    {
      _id: toObjectId(selection.id),
      deletedAt: { $exists: false },
      projectSlug: input.projectSlug,
    },
    {
      $set: {
        alt: selection.alt,
        position: selection.position,
        role: selection.role,
        updatedAt: new Date(),
      },
    },
    { session: options.session },
  )));

  return buildProjectWithMedia(input.project, input.mediaAssets, assets);
}

function removeAssetFromProject(project: Project, asset: ProjectMediaAssetDocument): Project {
  const visuals = defaultProjectVisuals(project);
  const gallery = visuals.gallery.filter((url) => url !== asset.secureUrl);
  const nextVisuals: ProjectVisuals = {
    ...visuals,
    gallery,
    heroImage: visuals.heroImage === asset.secureUrl ? null : visuals.heroImage,
    logo: visuals.logo === asset.secureUrl ? null : visuals.logo,
    thumbnail: visuals.thumbnail === asset.secureUrl ? null : visuals.thumbnail,
  };
  const hasMedia = Boolean(nextVisuals.logo || nextVisuals.thumbnail || nextVisuals.heroImage || nextVisuals.gallery.length > 0);

  nextVisuals.status = hasMedia ? "available" : "pending";

  return {
    ...project,
    visuals: nextVisuals,
  };
}

export async function deleteProjectMediaAsset(assetId: string, deletedBy: string | null) {
  const { databaseName } = readMongoConfig();
  const { client, collections } = await getCollectionsForTransaction(databaseName);
  const objectId = toObjectId(assetId);
  const asset = await collections.projectMediaAssets.findOne({
    _id: objectId,
    deletedAt: { $exists: false },
  });

  if (!asset) {
    throw new ProjectMediaNotFoundError();
  }

  await deleteCloudinaryProjectMedia(asset.publicId);

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const projectDocument = await collections.portfolioProjects.findOne(
        { slug: asset.projectSlug },
        { session },
      );
      const now = new Date();

      if (projectDocument) {
        const project = parseProjectContent(projectDocument.content);

        if (project) {
          const updatedProject = removeAssetFromProject(project, asset);
          await insertProjectRevision(collections.portfolioProjectRevisions, projectDocument, "update", deletedBy, session);
          await collections.portfolioProjects.updateOne(
            { _id: projectDocument._id },
            {
              $set: {
                content: updatedProject,
                updatedAt: now,
                updatedBy: deletedBy,
              },
            },
            { session },
          );
        }
      }

      await collections.projectMediaAssets.updateOne(
        { _id: objectId },
        {
          $set: {
            deletedAt: now,
            position: 0,
            role: "unassigned",
            updatedAt: now,
          },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return {
    projectSlug: asset.projectSlug,
  };
}

export async function rollbackUnregisteredProjectMedia(
  input: ProjectMediaRegistrationImage,
  options: {
    collections?: Pick<MongoCollections, "projectMediaAssets">;
    deleteImage?: (publicId: string) => Promise<void>;
  } = {},
) {
  validateProjectMediaRegistrationPayload(input);

  const collections = options.collections ?? await getMongoCollections();
  const { projectMediaAssets } = collections;
  const existing = await projectMediaAssets.findOne({
    publicId: input.publicId,
  });

  if (existing) {
    throw new ProjectMediaValidationError("A imagem já está registrada e não pode ser revertida por rollback.");
  }

  await (options.deleteImage ?? deleteCloudinaryProjectMedia)(input.publicId);

  return {
    projectSlug: input.projectSlug,
    publicId: input.publicId,
  };
}

export async function projectMediaAssetExists(database: Db, id: ObjectId) {
  return Boolean(await database.collection<ProjectMediaAssetDocument>("project_media_assets").findOne({ _id: id }));
}
