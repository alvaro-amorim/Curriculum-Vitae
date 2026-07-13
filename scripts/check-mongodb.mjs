import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();
const databaseName = process.env.MONGODB_DB?.trim();

if (!uri || !databaseName) {
  console.error("MongoDB check failed: configure MONGODB_URI and MONGODB_DB in .env.local.");
  process.exitCode = 1;
} else if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
  console.error("MongoDB check failed: MONGODB_URI must use mongodb:// or mongodb+srv://.");
  process.exitCode = 1;
} else {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 8_000,
    maxPoolSize: 2,
    serverApi: {
      deprecationErrors: true,
      strict: true,
      version: ServerApiVersion.v1,
    },
    serverSelectionTimeoutMS: 8_000,
  });
  const startedAt = performance.now();

  try {
    await client.connect();
    const result = await client.db(databaseName).command({ ping: 1 });

    if (result.ok !== 1) {
      throw new Error("MongoDB returned an unexpected ping response.");
    }

    console.log("MongoDB connection successful.");
    console.log(`Database: ${databaseName}`);
    console.log(`Latency: ${Math.max(0, Math.round(performance.now() - startedAt))} ms`);
  } catch (error) {
    const message = error instanceof Error
      ? error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[redacted-mongodb-uri]")
      : "Unknown MongoDB connection error";

    console.error(`MongoDB check failed: ${message.slice(0, 240)}`);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => undefined);
  }
}
