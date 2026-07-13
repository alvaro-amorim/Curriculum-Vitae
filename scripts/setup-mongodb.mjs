import { MongoClient, ServerApiVersion } from "mongodb";

import { MONGODB_INDEX_SPECS } from "../src/lib/mongodb/index-specs.ts";

const uri = process.env.MONGODB_URI?.trim();
const databaseName = process.env.MONGODB_DB?.trim();

const collectionSpecs = [
  ["arcade_sessions", MONGODB_INDEX_SPECS.arcadeSessions],
  ["arcade_scores", MONGODB_INDEX_SPECS.arcadeScores],
  ["portfolio_projects", MONGODB_INDEX_SPECS.portfolioProjects],
  ["portfolio_project_revisions", MONGODB_INDEX_SPECS.portfolioProjectRevisions],
];

if (!uri || !databaseName) {
  console.error("MongoDB setup failed: configure MONGODB_URI and MONGODB_DB in .env.local.");
  process.exitCode = 1;
} else {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10_000,
    maxPoolSize: 2,
    serverApi: {
      deprecationErrors: true,
      strict: true,
      version: ServerApiVersion.v1,
    },
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    await client.connect();
    const database = client.db(databaseName);
    await database.command({ ping: 1 });

    for (const [collectionName, indexes] of collectionSpecs) {
      const collection = database.collection(collectionName);
      const createdIndexes = await collection.createIndexes(indexes);
      console.log(`${collectionName}: ${createdIndexes.join(", ")}`);
    }

    console.log(`MongoDB schema ready in database: ${databaseName}`);
  } catch (error) {
    const message = error instanceof Error
      ? error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[redacted-mongodb-uri]")
      : "Unknown MongoDB setup error";

    console.error(`MongoDB setup failed: ${message.slice(0, 300)}`);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => undefined);
  }
}
