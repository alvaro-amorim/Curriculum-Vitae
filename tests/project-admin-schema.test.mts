import assert from "node:assert/strict";
import test from "node:test";

import { projects } from "../src/content/projects.ts";
import {
  AdminProjectMutationSchema,
  ProjectContentSchema,
} from "../src/lib/projects/project-schema.ts";

test("accepts every current static project as editable Admin content", () => {
  for (const project of projects) {
    const parsed = ProjectContentSchema.safeParse(project);
    assert.equal(parsed.success, true, project.slug);
  }
});

test("accepts a valid publication mutation", () => {
  const parsed = AdminProjectMutationSchema.safeParse({
    project: projects[0],
    publicationStatus: "published",
    sortOrder: 20,
  });

  assert.equal(parsed.success, true);
});

test("rejects unsafe slugs, invalid URLs and unknown fields", () => {
  const project = projects[0];
  const unsafeSlug = ProjectContentSchema.safeParse({
    ...project,
    slug: "../admin",
  });
  const invalidUrl = ProjectContentSchema.safeParse({
    ...project,
    links: {
      ...project.links,
      website: "javascript:alert(1)",
    },
  });
  const unknownField = ProjectContentSchema.safeParse({
    ...project,
    adminOnly: true,
  });

  assert.equal(unsafeSlug.success, false);
  assert.equal(invalidUrl.success, false);
  assert.equal(unknownField.success, false);
});

test("rejects empty bilingual project content", () => {
  const project = projects[0];
  const missingEnglishTitle = ProjectContentSchema.safeParse({
    ...project,
    title: {
      ...project.title,
      en: "",
    },
  });
  const missingStack = ProjectContentSchema.safeParse({
    ...project,
    stack: [],
  });

  assert.equal(missingEnglishTitle.success, false);
  assert.equal(missingStack.success, false);
});
