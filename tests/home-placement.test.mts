import assert from "node:assert/strict";
import test from "node:test";

import { primaryProjectSlugs, projects } from "../src/content/project-catalog.ts";
import {
  defaultProjectHomePlacement,
  normalizeProjectHomePlacement,
  selectHomeProjectCollections,
  type ProjectHomePlacement,
} from "../src/lib/projects/home-placement.ts";

test("curated primary projects remain the safe default for both home surfaces", () => {
  const collections = selectHomeProjectCollections(projects);

  assert.deepEqual(
    collections.homeProjects.map((project) => project.slug),
    [...primaryProjectSlugs],
  );
  assert.deepEqual(
    collections.carouselProjects.map((project) => project.slug),
    [...primaryProjectSlugs],
  );
});

test("home grid and carousel use independent visibility and order", () => {
  const placements = new Map<string, ProjectHomePlacement>([
    ["margem-app", {
      carouselOrder: 30,
      homeOrder: 20,
      showInCarousel: false,
      showInHome: true,
    }],
    ["fluxo", {
      carouselOrder: 10,
      homeOrder: 40,
      showInCarousel: true,
      showInHome: false,
    }],
    ["robet", {
      carouselOrder: 0,
      homeOrder: 0,
      showInCarousel: true,
      showInHome: true,
    }],
  ]);
  const collections = selectHomeProjectCollections(projects, placements);

  assert.equal(collections.homeProjects[0]?.slug, "robet");
  assert.equal(collections.homeProjects.some((project) => project.slug === "margem-app"), true);
  assert.equal(collections.homeProjects.some((project) => project.slug === "fluxo"), false);
  assert.equal(collections.carouselProjects[0]?.slug, "robet");
  assert.equal(collections.carouselProjects.some((project) => project.slug === "fluxo"), true);
  assert.equal(collections.carouselProjects.some((project) => project.slug === "margem-app"), false);
});

test("legacy and invalid placement values normalize without a migration", () => {
  assert.deepEqual(
    normalizeProjectHomePlacement("margem-app", undefined),
    defaultProjectHomePlacement("margem-app"),
  );
  assert.deepEqual(
    normalizeProjectHomePlacement("novo-projeto", {
      carouselOrder: -20,
      homeOrder: Number.NaN,
      showInCarousel: true,
      showInHome: true,
    }),
    {
      carouselOrder: 0,
      homeOrder: 1_000,
      showInCarousel: true,
      showInHome: true,
    },
  );
});
