import { MongoClient, ServerApiVersion, type Db } from "mongodb";

import { readMongoConfig } from "./config.ts";

declare global {
  var __portfolioMongoClientPromise: Promise<MongoClient> | undefined;
}

function createMongoClientPromise() {
  const { uri } = readMongoConfig();
  const client = new MongoClient(uri, {
    connectTimeoutMS: 8_000,
    maxIdleTimeMS: 60_000,
    maxPoolSize: 10,
    minPoolSize: 0,
    retryReads: true,
    retryWrites: true,
    serverApi: {
      deprecationErrors: true,
      strict: true,
      version: ServerApiVersion.v1,
    },
    serverSelectionTimeoutMS: 8_000,
  });

  const connection = client.connect().catch(async (error) => {
    if (globalThis.__portfolioMongoClientPromise === connection) {
      globalThis.__portfolioMongoClientPromise = undefined;
    }

    await client.close().catch(() => undefined);
    throw error;
  });

  return connection;
}

export function getMongoClient() {
  if (!globalThis.__portfolioMongoClientPromise) {
    globalThis.__portfolioMongoClientPromise = createMongoClientPromise();
  }

  return globalThis.__portfolioMongoClientPromise;
}

export async function getMongoDatabase(): Promise<Db> {
  const { databaseName } = readMongoConfig();
  const client = await getMongoClient();

  return client.db(databaseName);
}

export async function closeMongoClientForTests() {
  const connection = globalThis.__portfolioMongoClientPromise;
  globalThis.__portfolioMongoClientPromise = undefined;

  if (connection) {
    const client = await connection.catch(() => null);
    await client?.close();
  }
}
