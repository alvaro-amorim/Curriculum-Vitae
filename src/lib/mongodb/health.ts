import { isMongoConfigured, sanitizeMongoError } from "@/lib/mongodb/config";
import { getMongoDatabase } from "@/lib/mongodb/client";

export type MongoHealth = {
  configured: boolean;
  database: string | null;
  latencyMs: number | null;
  message?: string;
  status: "connected" | "not_configured" | "unavailable";
};

export async function checkMongoHealth(): Promise<MongoHealth> {
  if (!isMongoConfigured()) {
    return {
      configured: false,
      database: null,
      latencyMs: null,
      status: "not_configured",
    };
  }

  const startedAt = performance.now();

  try {
    const database = await getMongoDatabase();
    await database.command({ ping: 1 });

    return {
      configured: true,
      database: database.databaseName,
      latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
      status: "connected",
    };
  } catch (error) {
    return {
      configured: true,
      database: process.env.MONGODB_DB?.trim() || null,
      latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
      message: sanitizeMongoError(error),
      status: "unavailable",
    };
  }
}
