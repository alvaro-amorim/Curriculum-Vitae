import assert from "node:assert/strict";
import test from "node:test";

import {
  groupProjectsByCollection,
  labProjectSlugs,
  primaryProjectSlugs,
  projects,
  secondaryProjectSlugs,
} from "../src/content/project-catalog.ts";

const expectedSlugs = [
  ...primaryProjectSlugs,
  ...labProjectSlugs,
  ...secondaryProjectSlugs,
];

test("project curation keeps six primary projects and six technical labs", () => {
  assert.equal(primaryProjectSlugs.length, 6);
  assert.equal(labProjectSlugs.length, 6);
  assert.equal(new Set(expectedSlugs).size, expectedSlugs.length);
});

test("every curated slug resolves to a complete project", () => {
  for (const slug of expectedSlugs) {
    const project = projects.find((item) => item.slug === slug);

    assert.ok(project, `Missing curated project: ${slug}`);
    assert.ok(project.shortDescription.pt.length > 0);
    assert.ok(project.shortDescription.en.length > 0);
    assert.ok(project.stack.length > 0);
    assert.ok(project.links.website || project.links.repository, `Project ${slug} has no public evidence link`);
  }
});

test("catalog order follows primary, labs, then secondary projects", () => {
  assert.deepEqual(
    projects.slice(0, expectedSlugs.length).map((project) => project.slug),
    expectedSlugs,
  );

  const groups = groupProjectsByCollection(projects);
  assert.deepEqual(groups.find((group) => group.id === "primary")?.projects.map((project) => project.slug), [...primaryProjectSlugs]);
  assert.deepEqual(groups.find((group) => group.id === "labs")?.projects.map((project) => project.slug), [...labProjectSlugs]);
  assert.deepEqual(groups.find((group) => group.id === "secondary")?.projects.map((project) => project.slug), [...secondaryProjectSlugs]);
});
