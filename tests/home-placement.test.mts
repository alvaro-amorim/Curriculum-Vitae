import assert from "node:assert/strict";
import test from "node:test";

import { projects } from "../src/content/project-catalog.ts";
import {
  defaultProjectHomePlacement,
  normalizeProjectHomePlacement,
  selectHomeProjectCollections,
  type ProjectHomePlacement,
} from "../src/lib/projects/home-placement.ts";

test("projects remain hidden when the database has no featured or placement decision", () => {
  const databaseProjects = projects.slice(0, 3).map((project) => ({
    ...project,
    featured: false,
  }));
  const collections = selectHomeProjectCollections(databaseProjects);

  assert.deepEqual(collections.homeProjects, []);
  assert.deepEqual(collections.carouselProjects, []);
});

test("home grid and carousel use independent database visibility and order", () => {
  const databaseProjects = projects.slice(0, 3).map((project) => ({
    ...project,
    featured: false,
  }));
  const [first, second, third] = databaseProjects;
  const placements = new Map<string, ProjectHomePlacement>([
    [first.slug, {
      carouselOrder: 30,
      homeOrder: 20,
      showInCarousel: false,
      showInHome: true,
    }],
    [second.slug, {
      carouselOrder: 10,
      homeOrder: 40,
      showInCarousel: true,
      showInHome: false,
    }],
    [third.slug, {
      carouselOrder: 0,
      homeOrder: 0,
      showInCarousel: true,
      showInHome: true,
    }],
  ]);
  const collections = selectHomeProjectCollections(databaseProjects, placements);

  assert.deepEqual(collections.homeProjects.map((project) => project.slug), [third.slug, first.slug]);
  assert.deepEqual(collections.carouselProjects.map((project) => project.slug), [third.slug, second.slug]);
});

test("legacy and invalid placement values normalize without a migration", () => {
  const featuredFallback = defaultProjectHomePlacement(true, 30);

  assert.deepEqual(
    normalizeProjectHomePlacement(undefined, featuredFallback),
    featuredFallback,
  );
  assert.deepEqual(
    normalizeProjectHomePlacement({
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
