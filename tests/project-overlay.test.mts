import assert from "node:assert/strict";
import test from "node:test";

import { projects } from "../src/content/projects.ts";
import {
  applyPublicProjectDetailOverlay,
  applyPublicProjectOverlay,
} from "../src/lib/projects/project-overlay.ts";

function content(project: (typeof projects)[number]) {
  return project as unknown as Record<string, unknown>;
}

test("published database content overrides a static project", () => {
  const original = projects[0];
  const override = {
    ...original,
    title: {
      ...original.title,
      pt: "Título editado no Admin",
    },
  };

  const result = applyPublicProjectOverlay(projects, [
    {
      content: content(override),
      publicationStatus: "published",
      slug: original.slug,
      sortOrder: 0,
    },
  ]);

  assert.equal(result.find((project) => project.slug === original.slug)?.title.pt, "Título editado no Admin");
});

test("draft and archived rows hide matching static projects", () => {
  const draftSlug = projects[0].slug;
  const archivedSlug = projects[1].slug;
  const result = applyPublicProjectOverlay(projects, [
    {
      content: content(projects[0]),
      publicationStatus: "draft",
      slug: draftSlug,
      sortOrder: 0,
    },
    {
      content: content(projects[1]),
      publicationStatus: "archived",
      slug: archivedSlug,
      sortOrder: 10,
    },
  ]);

  assert.equal(result.some((project) => project.slug === draftSlug), false);
  assert.equal(result.some((project) => project.slug === archivedSlug), false);
});

test("invalid published content preserves the static fallback", () => {
  const original = projects[0];
  const result = applyPublicProjectOverlay(projects, [
    {
      content: {
        slug: original.slug,
        title: "invalid",
      },
      publicationStatus: "published",
      slug: original.slug,
      sortOrder: 0,
    },
  ]);

  assert.equal(result.find((project) => project.slug === original.slug)?.title.pt, original.title.pt);
  assert.equal(
    applyPublicProjectDetailOverlay(original, {
      content: { slug: original.slug },
      publicationStatus: "published",
      slug: original.slug,
      sortOrder: 0,
    }),
    original,
  );
});

test("a valid new published project is added in configured order", () => {
  const source = projects[0];
  const added = {
    ...source,
    slug: "novo-case-admin",
    title: {
      en: "New Admin Case",
      pt: "Novo Case Admin",
    },
  };
  const result = applyPublicProjectOverlay(projects, [
    {
      content: content(added),
      publicationStatus: "published",
      slug: added.slug,
      sortOrder: 5,
    },
  ]);

  assert.equal(result.some((project) => project.slug === added.slug), true);
  assert.equal(result[1].slug, added.slug);
});

test("project detail returns null for an explicit draft or archived override", () => {
  const original = projects[0];

  assert.equal(
    applyPublicProjectDetailOverlay(original, {
      content: content(original),
      publicationStatus: "draft",
      slug: original.slug,
      sortOrder: 0,
    }),
    null,
  );
});
