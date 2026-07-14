import type { CreateIndexesOptions, IndexDescription } from "mongodb";

import { getMongoCollections } from "@/lib/mongodb/collections";
import { MONGODB_INDEX_SPECS } from "@/lib/mongodb/index-specs";

function toIndexDescriptions(specs: readonly unknown[]) {
  return specs as IndexDescription[];
}

export async function ensureMongoIndexes(options?: CreateIndexesOptions) {
  const collections = await getMongoCollections();

  const [
    adminLoginAttempts,
    adminSessions,
    adminUsers,
    arcadeSessions,
    arcadeScores,
    projectMediaAssets,
    portfolioProjects,
    portfolioProjectRevisions,
  ] = await Promise.all([
    collections.adminLoginAttempts.createIndexes(
      toIndexDescriptions(MONGODB_INDEX_SPECS.adminLoginAttempts),
      options,
    ),
    collections.adminSessions.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.adminSessions), options),
    collections.adminUsers.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.adminUsers), options),
    collections.arcadeSessions.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.arcadeSessions), options),
    collections.arcadeScores.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.arcadeScores), options),
    collections.projectMediaAssets.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.projectMediaAssets), options),
    collections.portfolioProjects.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.portfolioProjects), options),
    collections.portfolioProjectRevisions.createIndexes(
      toIndexDescriptions(MONGODB_INDEX_SPECS.portfolioProjectRevisions),
      options,
    ),
  ]);

  return {
    adminLoginAttempts,
    adminSessions,
    adminUsers,
    arcadeScores,
    arcadeSessions,
    projectMediaAssets,
    portfolioProjectRevisions,
    portfolioProjects,
  };
}
