import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ObjectId } from "mongodb";

import { ProjectContentSchema } from "../src/lib/projects/project-schema.ts";
import {
  buildProjectImportTemplateResponse,
  buildProjectImportPreview,
  importProjectJsonDrafts,
  isProjectImportJsonFile,
  previewProjectJsonImport,
  PROJECT_IMPORT_MAX_BYTES,
  PROJECT_IMPORT_MAX_PROJECTS,
  PROJECT_IMPORT_TEMPLATE,
  PROJECT_IMPORT_TEMPLATE_FILE_NAME,
  ProjectJsonImportPayloadSchema,
} from "../src/lib/projects/project-import.ts";

function cloneTemplate() {
  return structuredClone(PROJECT_IMPORT_TEMPLATE);
}

function validPayload(slug = "novo-projeto") {
  const payload = cloneTemplate();
  payload.projects[0].slug = slug;
  payload.projects[0].title.pt = "Novo projeto";
  payload.projects[0].title.en = "New project";
  return payload;
}

function createFakeCollections(options?: { existingSlugs?: string[]; failRevision?: boolean }) {
  const projects = (options?.existingSlugs ?? []).map((slug) => ({
    _id: new ObjectId(),
    content: { ...validPayload(slug).projects[0], links: { website: "" } },
    createdAt: new Date(),
    publicationStatus: "draft",
    publishedAt: null,
    slug,
    sortOrder: 10,
    updatedAt: new Date(),
    updatedBy: "fixture",
  }));
  const revisions: unknown[] = [];
  const collections = {
    portfolioProjects: {
      find(query: { slug?: { $in?: string[] } }) {
        const slugs = query.slug?.$in ?? [];
        return {
          async toArray() {
            return projects.filter((project) => slugs.includes(project.slug));
          },
        };
      },
      async findOne(query: { slug: string }) {
        return projects.find((project) => project.slug === query.slug) ?? null;
      },
      async insertOne(document: (typeof projects)[number]) {
        const insertedId = new ObjectId();
        projects.push({
          ...document,
          _id: insertedId,
        });
        return { insertedId };
      },
    },
    portfolioProjectRevisions: {
      async insertOne(document: unknown) {
        if (options?.failRevision) {
          throw new Error("revision failed");
        }

        revisions.push(document);
        return { insertedId: new ObjectId() };
      },
    },
  };
  const runInTransaction = async (callback: () => Promise<void>) => {
    const projectSnapshot = [...projects];
    const revisionSnapshot = [...revisions];

    try {
      await callback();
    } catch (error) {
      projects.splice(0, projects.length, ...projectSnapshot);
      revisions.splice(0, revisions.length, ...revisionSnapshot);
      throw error;
    }
  };

  return {
    collections: collections as never,
    projects,
    revisions,
    runInTransaction,
  };
}

test("provides a valid canonical JSON template without media fields", async () => {
  assert.equal(ProjectJsonImportPayloadSchema.parse(PROJECT_IMPORT_TEMPLATE).schemaVersion, "1.0");

  const serialized = JSON.stringify(PROJECT_IMPORT_TEMPLATE);
  for (const forbidden of ["logo", "thumbnail", "hero", "gallery", "Cloudinary", "_id", "createdAt", "updatedBy"]) {
    assert.equal(serialized.includes(forbidden), false);
  }

  const response = buildProjectImportTemplateResponse();
  assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.equal(response.headers.get("Content-Disposition"), `attachment; filename="${PROJECT_IMPORT_TEMPLATE_FILE_NAME}"`);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.ok(JSON.parse(await response.text()));
});

test("validates malformed and invalid import payloads", () => {
  assert.throws(() => JSON.parse("{"), SyntaxError);

  assert.equal(buildProjectImportPreview({ schemaVersion: "2.0", projects: [] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), unknown: true }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], slug: "Nome Invalido" }] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], publicationStatus: "published" }] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], title: { en: "Only EN" } }] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], title: { pt: "Só PT" } }] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], stack: [] }] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], links: { website: "ftp://example.com" } }] }).invalidCount, 1);
});

test("enforces project limits, JSON file rules and duplicate slugs", () => {
  const tooMany = {
    schemaVersion: "1.0",
    projects: Array.from({ length: PROJECT_IMPORT_MAX_PROJECTS + 1 }, (_, index) => ({
      ...validPayload(`projeto-${index}`).projects[0],
    })),
  };
  assert.equal(buildProjectImportPreview(tooMany).invalidCount, 1);
  assert.equal(isProjectImportJsonFile("project.json", "application/json"), true);
  assert.equal(isProjectImportJsonFile("project.txt", "text/plain"), false);
  assert.equal(PROJECT_IMPORT_MAX_BYTES, 1024 * 1024);

  const duplicatePayload = {
    schemaVersion: "1.0",
    projects: [
      validPayload("slug-duplicado").projects[0],
      validPayload("slug-duplicado").projects[0],
    ],
  };

  const preview = buildProjectImportPreview(duplicatePayload);
  assert.equal(preview.duplicateSlugs.includes("slug-duplicado"), true);
  assert.equal(preview.invalidCount, 2);
});

test("detects existing slugs without modifying MongoDB during validate", async () => {
  const fake = createFakeCollections({ existingSlugs: ["projeto-existente"] });
  const preview = await previewProjectJsonImport(validPayload("projeto-existente"), {
    collections: fake.collections,
  });

  assert.equal(preview.validCount, 0);
  assert.equal(preview.existingSlugs.includes("projeto-existente"), true);
  assert.equal(fake.projects.length, 1);
  assert.equal(fake.revisions.length, 0);
});

test("imports only new draft projects and creates a revision without media", async () => {
  const fake = createFakeCollections();
  const result = await importProjectJsonDrafts(validPayload("json-draft"), "admin@example.com", {
    collections: fake.collections,
    runInTransaction: fake.runInTransaction,
  });

  assert.deepEqual(result.imported, [{ slug: "json-draft", title: "Novo projeto" }]);
  assert.equal(fake.projects.length, 1);
  assert.equal(fake.projects[0]?.publicationStatus, "draft");
  assert.equal(fake.projects[0]?.publishedAt, null);
  assert.equal(fake.projects[0]?.content.visuals, undefined);
  assert.equal(fake.revisions.length, 1);
  assert.equal(ProjectContentSchema.safeParse(fake.projects[0]?.content).success, true);
});

test("does not overwrite existing projects and rolls back when revision creation fails", async () => {
  const existing = createFakeCollections({ existingSlugs: ["projeto-existente"] });
  const existingResult = await importProjectJsonDrafts(validPayload("projeto-existente"), "admin@example.com", {
    collections: existing.collections,
    runInTransaction: existing.runInTransaction,
  });

  assert.equal(existingResult.imported.length, 0);
  assert.equal(existing.projects.length, 1);
  assert.equal(existing.revisions.length, 0);

  const failing = createFakeCollections({ failRevision: true });
  await assert.rejects(() => importProjectJsonDrafts(validPayload("rollback-projeto"), "admin@example.com", {
    collections: failing.collections,
    runInTransaction: failing.runInTransaction,
  }));
  assert.equal(failing.projects.length, 0);
  assert.equal(failing.revisions.length, 0);
});

test("keeps Admin import routes protected and same-origin aware", () => {
  const routeSource = readFileSync("src/app/api/admin/projects/import/route.ts", "utf8");
  const templateRouteSource = readFileSync("src/app/api/admin/projects/import/template/route.ts", "utf8");

  assert.match(routeSource, /requireAdminApiUser\(request, \{ mutation: true \}\)/);
  assert.match(templateRouteSource, /requireAdminApiUser\(request\)/);
  assert.match(routeSource, /readJsonPayload\(request, ADMIN_PROJECT_IMPORT_MAX_BYTES\)/);
  assert.match(routeSource, /mode === "validate"/);
  assert.match(routeSource, /mode === "import"/);
});

test("exposes an accessible modal with file upload and paste flows", () => {
  const source = readFileSync("src/components/admin/admin-project-json-import-modal.tsx", "utf8");

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /project-json-import-title/);
  assert.match(source, /accept="\.json,application\/json"/);
  assert.match(source, /onDrop/);
  assert.match(source, /textarea/);
  assert.match(source, /Formatar JSON/);
  assert.match(source, /Copiar instrução para IA/);
  assert.match(source, /Escape/);
});
