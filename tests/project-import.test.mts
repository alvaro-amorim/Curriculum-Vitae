import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ObjectId } from "mongodb";

import { ProjectContentSchema } from "../src/lib/projects/project-schema.ts";
import {
  buildProjectImportTemplateResponse,
  buildProjectImportPreview,
  isProjectImportJsonFile,
  previewProjectJsonImport,
  PROJECT_IMPORT_MAX_BYTES,
  PROJECT_IMPORT_MAX_PROJECTS,
  PROJECT_IMPORT_TEMPLATE,
  PROJECT_IMPORT_TEMPLATE_FILE_NAME,
  ProjectJsonImportPayloadSchema,
  syncProjectJsonProjects,
  type ProjectJsonImportProject,
} from "../src/lib/projects/project-import.ts";
import type { Project } from "../src/types/portfolio.ts";

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

function projectFromSource(source: ProjectJsonImportProject): Project {
  return {
    category: source.category,
    featured: source.featured,
    fullDescription: source.fullDescription,
    highlights: source.highlights,
    links: {
      website: source.links.website,
      ...(source.links.repository ? { repository: source.links.repository } : {}),
    },
    problem: source.problem,
    shortDescription: source.shortDescription,
    slug: source.slug,
    solution: source.solution,
    stack: source.stack,
    status: source.status,
    subtitle: source.subtitle,
    technicalChallenges: source.technicalChallenges,
    title: source.title,
    whatItShows: source.whatItShows,
  };
}

function createFakeCollections(options?: {
  existingSlugs?: string[];
  failRevision?: boolean;
  withVisuals?: boolean;
}) {
  const projects = (options?.existingSlugs ?? []).map((slug) => {
    const source = validPayload(slug).projects[0];
    const content = projectFromSource(source);

    if (options?.withVisuals) {
      content.visuals = {
        accent: {
          primary: "#111111",
          secondary: "#222222",
          tertiary: "#333333",
        },
        alt: {
          en: "Existing visual",
          pt: "Visual existente",
        },
        gallery: [],
        heroImage: "https://res.cloudinary.com/demo/image/upload/hero.webp",
        layout: "operational-saas",
        logo: null,
        mockupHint: {
          en: "Existing frame",
          pt: "Moldura existente",
        },
        status: "available",
        thumbnail: null,
      };
    }

    return {
      _id: new ObjectId(),
      collection: "secondary" as const,
      content,
      createdAt: new Date(),
      homePlacement: {
        carouselOrder: 1_000,
        homeOrder: 1_000,
        showInCarousel: false,
        showInHome: false,
      },
      publicationStatus: "draft" as const,
      publishedAt: null,
      slug,
      sortOrder: 10,
      updatedAt: new Date(),
      updatedBy: "fixture",
    };
  });
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
      async insertOne(document: Omit<(typeof projects)[number], "_id">) {
        const insertedId = new ObjectId();
        projects.push({
          ...document,
          _id: insertedId,
        });
        return { insertedId };
      },
      async updateOne(
        query: { _id: ObjectId },
        update: { $set: Partial<(typeof projects)[number]> },
      ) {
        const index = projects.findIndex((project) => project._id.equals(query._id));

        if (index >= 0) {
          projects[index] = {
            ...projects[index],
            ...update.$set,
          };
        }

        return { matchedCount: index >= 0 ? 1 : 0 };
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
    const projectSnapshot = projects.map((project) => ({ ...project }));
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

test("provides a valid synchronization template without media fields", async () => {
  const parsed = ProjectJsonImportPayloadSchema.parse(PROJECT_IMPORT_TEMPLATE);
  assert.equal(parsed.schemaVersion, "1.0");
  assert.equal(parsed.projects[0].collection, "secondary");
  assert.equal(parsed.projects[0].homePlacement.showInHome, false);

  const serialized = JSON.stringify(PROJECT_IMPORT_TEMPLATE);
  for (const forbidden of ["logo", "thumbnail", "heroImage", "gallery", "Cloudinary", "_id", "createdAt", "updatedBy"]) {
    assert.equal(serialized.includes(forbidden), false);
  }

  const response = buildProjectImportTemplateResponse();
  assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.equal(response.headers.get("Content-Disposition"), `attachment; filename="${PROJECT_IMPORT_TEMPLATE_FILE_NAME}"`);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.ok(JSON.parse(await response.text()));
});

test("validates malformed and incomplete synchronization payloads", () => {
  assert.throws(() => JSON.parse("{"), SyntaxError);

  assert.equal(buildProjectImportPreview({ schemaVersion: "2.0", projects: [] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), unknown: true }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], slug: "Nome Invalido" }] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], collection: undefined }] }).invalidCount, 1);
  assert.equal(buildProjectImportPreview({ ...validPayload(), projects: [{ ...validPayload().projects[0], homePlacement: undefined }] }).invalidCount, 1);
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

test("classifies existing slugs as valid updates without modifying MongoDB", async () => {
  const fake = createFakeCollections({ existingSlugs: ["projeto-existente"] });
  const preview = await previewProjectJsonImport(validPayload("projeto-existente"), {
    collections: fake.collections,
  });

  assert.equal(preview.validCount, 1);
  assert.equal(preview.updateCount, 1);
  assert.equal(preview.createCount, 0);
  assert.equal(preview.existingSlugs.includes("projeto-existente"), true);
  assert.equal(preview.projects[0]?.action, "update");
  assert.equal(fake.projects.length, 1);
  assert.equal(fake.revisions.length, 0);
});

test("creates new projects with publication, collection and Home configuration", async () => {
  const payload = validPayload("json-project");
  payload.projects[0].publicationStatus = "published";
  payload.projects[0].collection = "primary";
  payload.projects[0].featured = true;
  payload.projects[0].homePlacement = {
    carouselOrder: 20,
    homeOrder: 10,
    showInCarousel: true,
    showInHome: true,
  };
  const fake = createFakeCollections();
  const result = await syncProjectJsonProjects(payload, "admin@example.com", {
    collections: fake.collections,
    runInTransaction: fake.runInTransaction,
  });

  assert.deepEqual(result.synced, [{ action: "created", slug: "json-project", title: "Novo projeto" }]);
  assert.equal(fake.projects.length, 1);
  assert.equal(fake.projects[0]?.publicationStatus, "published");
  assert.equal(fake.projects[0]?.collection, "primary");
  assert.equal(fake.projects[0]?.homePlacement.showInCarousel, true);
  assert.ok(fake.projects[0]?.publishedAt instanceof Date);
  assert.equal(fake.revisions.length, 1);
  assert.equal(ProjectContentSchema.safeParse(fake.projects[0]?.content).success, true);
});

test("updates existing projects and preserves their registered visuals", async () => {
  const fake = createFakeCollections({
    existingSlugs: ["projeto-existente"],
    withVisuals: true,
  });
  const payload = validPayload("projeto-existente");
  payload.projects[0].title.pt = "Projeto atualizado";
  payload.projects[0].collection = "labs";
  payload.projects[0].sortOrder = 80;
  const result = await syncProjectJsonProjects(payload, "admin@example.com", {
    collections: fake.collections,
    runInTransaction: fake.runInTransaction,
  });

  assert.deepEqual(result.synced, [{ action: "updated", slug: "projeto-existente", title: "Projeto atualizado" }]);
  assert.equal(fake.projects.length, 1);
  assert.equal(fake.projects[0]?.content.title.pt, "Projeto atualizado");
  assert.equal(fake.projects[0]?.content.visuals?.heroImage, "https://res.cloudinary.com/demo/image/upload/hero.webp");
  assert.equal(fake.projects[0]?.collection, "labs");
  assert.equal(fake.projects[0]?.sortOrder, 80);
  assert.equal(fake.revisions.length, 1);
});

test("rolls back the synchronization when revision creation fails", async () => {
  const failing = createFakeCollections({ failRevision: true });

  await assert.rejects(() => syncProjectJsonProjects(validPayload("rollback-projeto"), "admin@example.com", {
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
  assert.match(routeSource, /syncProjectJsonProjects/);
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
