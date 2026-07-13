import type { CreateIndexesOptions, IndexDescription } from "mongodb";

import { getMongoCollections } from "@/lib/mongodb/collections";
import { MONGODB_INDEX_SPECS } from "@/lib/mongodb/index-specs";

function toIndexDescriptions(specs: readonly unknown[]) {
  return specs as IndexDescription[];
}

export async function ensureMongoIndexes(options?: CreateIndexesOptions) {
  const collections = await getMongoCollections();

  const [arcadeSessions, arcadeScores, portfolioProjects, portfolioProjectRevisions] = await Promise.all([
    collections.arcadeSessions.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.arcadeSessions), options),
    collections.arcadeScores.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.arcadeScores), options),
    collections.portfolioProjects.createIndexes(toIndexDescriptions(MONGODB_INDEX_SPECS.portfolioProjects), options),
    collections.portfolioProjectRevisions.createIndexes(
      toIndexDescriptions(MONGODB_INDEX_SPECS.portfolioProjectRevisions),
      options,
    ),
  ]);

  return {
    arcadeScores,
    arcadeSessions,
    portfolioProjectRevisions,
    portfolioProjects,
  };
}
