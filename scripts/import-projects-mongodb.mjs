import { MongoClient, ServerApiVersion } from "mongodb";

import { projects } from "../src/content/projects.ts";
import { ProjectContentSchema } from "../src/lib/projects/project-schema.ts";

const uri = process.env.MONGODB_URI?.trim();
const databaseName = process.env.MONGODB_DB?.trim();

if (!uri || !databaseName) {
  console.error("Project import failed: configure MONGODB_URI and MONGODB_DB in .env.local.");
  process.exitCode = 1;
} else {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10_000,
    maxPoolSize: 2,
    retryWrites: true,
    serverApi: {
      deprecationErrors: true,
      strict: true,
      version: ServerApiVersion.v1,
    },
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    const validatedProjects = projects.map((project) => ProjectContentSchema.parse(project));
    await client.connect();
    const database = client.db(databaseName);
    const projectCollection = database.collection("portfolio_projects");
    const revisionCollection = database.collection("portfolio_project_revisions");
    const session = client.startSession();
    let imported = 0;
    let preserved = 0;

    try {
      await session.withTransaction(async () => {
        for (const [index, project] of validatedProjects.entries()) {
          const existing = await projectCollection.findOne({ slug: project.slug }, { session });

          if (existing) {
            preserved += 1;
            continue;
          }

          const now = new Date();
          const document = {
            content: project,
            createdAt: now,
            publicationStatus: "published",
            publishedAt: now,
            slug: project.slug,
            sortOrder: index * 10,
            updatedAt: now,
            updatedBy: "local-import",
          };
          const result = await projectCollection.insertOne(document, { session });
          await revisionCollection.insertOne({
            action: "create",
            changedAt: now,
            changedBy: "local-import",
            content: project,
            projectId: result.insertedId,
            publicationStatus: "published",
            slug: project.slug,
            sortOrder: index * 10,
          }, { session });
          imported += 1;
        }
      });
    } finally {
      await session.endSession();
    }

    console.log(`MongoDB project import completed in database: ${databaseName}`);
    console.log(`Imported: ${imported}`);
    console.log(`Preserved existing records: ${preserved}`);
  } catch (error) {
    const message = error instanceof Error
      ? error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[redacted-mongodb-uri]")
      : "Unknown project import error";

    console.error(`Project import failed: ${message.slice(0, 400)}`);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => undefined);
  }
}
