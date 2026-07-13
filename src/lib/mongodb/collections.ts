import type { Collection, Db, ObjectId } from "mongodb";

import { getMongoDatabase } from "@/lib/mongodb/client";
import type { LabGameId, Project } from "@/types/portfolio";

export const MONGO_COLLECTIONS = {
  arcadeScores: "arcade_scores",
  arcadeSessions: "arcade_sessions",
  portfolioProjectRevisions: "portfolio_project_revisions",
  portfolioProjects: "portfolio_projects",
} as const;

export type ArcadeSessionDocument = {
  _id?: ObjectId;
  alias: string | null;
  createdAt: Date;
  lastSeenAt: Date;
  sessionHash: string;
};

export type ArcadeScoreDocument = {
  _id?: ObjectId;
  contractVersion: "v2" | "v3";
  createdAt: Date;
  deviceType: "desktop" | "mobile" | "unknown";
  durationMs: number;
  gameId: LabGameId;
  gameVersion: string;
  metadata: Record<string, unknown>;
  playerAlias: string | null;
  score: number;
  sessionHash: string;
};

export type PortfolioProjectPublicationStatus = "archived" | "draft" | "published";

export type PortfolioProjectDocument = {
  _id?: ObjectId;
  content: Project;
  createdAt: Date;
  publicationStatus: PortfolioProjectPublicationStatus;
  publishedAt: Date | null;
  slug: string;
  sortOrder: number;
  updatedAt: Date;
  updatedBy: string | null;
};

export type PortfolioProjectRevisionDocument = {
  _id?: ObjectId;
  action: "archive" | "create" | "publish" | "update";
  changedAt: Date;
  changedBy: string | null;
  content: Project;
  projectId: ObjectId;
  publicationStatus: PortfolioProjectPublicationStatus;
  slug: string;
  sortOrder: number;
};

export type MongoCollections = {
  arcadeScores: Collection<ArcadeScoreDocument>;
  arcadeSessions: Collection<ArcadeSessionDocument>;
  portfolioProjectRevisions: Collection<PortfolioProjectRevisionDocument>;
  portfolioProjects: Collection<PortfolioProjectDocument>;
};

export function getMongoCollectionsFromDatabase(database: Db): MongoCollections {
  return {
    arcadeScores: database.collection<ArcadeScoreDocument>(MONGO_COLLECTIONS.arcadeScores),
    arcadeSessions: database.collection<ArcadeSessionDocument>(MONGO_COLLECTIONS.arcadeSessions),
    portfolioProjectRevisions: database.collection<PortfolioProjectRevisionDocument>(MONGO_COLLECTIONS.portfolioProjectRevisions),
    portfolioProjects: database.collection<PortfolioProjectDocument>(MONGO_COLLECTIONS.portfolioProjects),
  };
}

export async function getMongoCollections() {
  const database = await getMongoDatabase();
  return getMongoCollectionsFromDatabase(database);
}
