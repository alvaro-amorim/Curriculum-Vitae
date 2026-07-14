import type { Collection, Db, ObjectId } from "mongodb";

import type { LabGameId, Project } from "@/types/portfolio";

import { getMongoDatabase } from "./client.ts";

export const MONGO_COLLECTIONS = {
  adminLoginAttempts: "admin_login_attempts",
  adminSessions: "admin_sessions",
  adminUsers: "admin_users",
  arcadeScores: "arcade_scores",
  arcadeSessions: "arcade_sessions",
  projectMediaAssets: "project_media_assets",
  portfolioProjectRevisions: "portfolio_project_revisions",
  portfolioProjects: "portfolio_projects",
} as const;

export type AdminPasswordParametersDocument = {
  blockSize: number;
  cost: number;
  keyLength: number;
  maxmem: number;
  parallelization: number;
};

export type AdminUserDocument = {
  _id?: ObjectId;
  active: boolean;
  createdAt: Date;
  email: string;
  lastLoginAt: Date | null;
  normalizedEmail: string;
  passwordAlgorithm: "scrypt-v1";
  passwordChangedAt: Date;
  passwordHash: string;
  passwordParameters: AdminPasswordParametersDocument;
  passwordSalt: string;
  role: "owner";
  updatedAt: Date;
};

export type AdminSessionDocument = {
  _id?: ObjectId;
  createdAt: Date;
  expiresAt: Date;
  lastSeenAt: Date;
  revokedAt?: Date | null;
  tokenHash: string;
  userAgent?: string;
  userId: ObjectId;
};

export type AdminLoginAttemptDocument = {
  _id?: ObjectId;
  attempts: number;
  blockedUntil: Date | null;
  expiresAt: Date;
  keyHash: string;
  windowStartedAt: Date;
};

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

export type ProjectMediaAssetDocument = {
  _id?: ObjectId;
  alt: {
    en: string;
    pt: string;
  };
  bytes: number;
  createdAt: Date;
  createdBy: string | null;
  deletedAt?: Date | null;
  format: string;
  height: number;
  position: number;
  projectSlug: string;
  provider: "cloudinary";
  publicId: string;
  resourceType: "image";
  role: "unassigned" | "logo" | "thumbnail" | "hero" | "gallery";
  secureUrl: string;
  updatedAt: Date;
  width: number;
};

export type MongoCollections = {
  adminLoginAttempts: Collection<AdminLoginAttemptDocument>;
  adminSessions: Collection<AdminSessionDocument>;
  adminUsers: Collection<AdminUserDocument>;
  arcadeScores: Collection<ArcadeScoreDocument>;
  arcadeSessions: Collection<ArcadeSessionDocument>;
  projectMediaAssets: Collection<ProjectMediaAssetDocument>;
  portfolioProjectRevisions: Collection<PortfolioProjectRevisionDocument>;
  portfolioProjects: Collection<PortfolioProjectDocument>;
};

export function getMongoCollectionsFromDatabase(database: Db): MongoCollections {
  return {
    adminLoginAttempts: database.collection<AdminLoginAttemptDocument>(MONGO_COLLECTIONS.adminLoginAttempts),
    adminSessions: database.collection<AdminSessionDocument>(MONGO_COLLECTIONS.adminSessions),
    adminUsers: database.collection<AdminUserDocument>(MONGO_COLLECTIONS.adminUsers),
    arcadeScores: database.collection<ArcadeScoreDocument>(MONGO_COLLECTIONS.arcadeScores),
    arcadeSessions: database.collection<ArcadeSessionDocument>(MONGO_COLLECTIONS.arcadeSessions),
    projectMediaAssets: database.collection<ProjectMediaAssetDocument>(MONGO_COLLECTIONS.projectMediaAssets),
    portfolioProjectRevisions: database.collection<PortfolioProjectRevisionDocument>(MONGO_COLLECTIONS.portfolioProjectRevisions),
    portfolioProjects: database.collection<PortfolioProjectDocument>(MONGO_COLLECTIONS.portfolioProjects),
  };
}

export async function getMongoCollections() {
  const database = await getMongoDatabase();
  return getMongoCollectionsFromDatabase(database);
}
