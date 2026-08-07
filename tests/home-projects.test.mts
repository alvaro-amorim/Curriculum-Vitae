import assert from "node:assert/strict";
import test from "node:test";

import { createHomeProjects, homeProjects } from "../src/content/home-projects.ts";
import { projects } from "../src/content/project-catalog.ts";

test("Home has no static project fallback", () => {
  assert.deepEqual(homeProjects, []);
});

test("home showcase renders any Admin-selected projects in the received order", () => {
  const selectedSlugs = ["gdash-dashboard", "fluxo", "comerc-ias"];
  const selectedProjects = selectedSlugs.flatMap((slug) => {
    const project = projects.find((item) => item.slug === slug);
    return project ? [project] : [];
  });
  const showcases = createHomeProjects(selectedProjects);

  assert.deepEqual(
    showcases.map((project) => project.caseHref.replace("/projetos/", "")),
    selectedSlugs,
  );
  assert.equal(showcases.every((project) => project.brandLabel.length > 0), true);
});

test("home showcase accepts an empty database selection", () => {
  assert.deepEqual(createHomeProjects([]), []);
});
