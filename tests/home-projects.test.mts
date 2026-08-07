import assert from "node:assert/strict";
import test from "node:test";

import { createHomeProjects, homeProjects } from "../src/content/home-projects.ts";
import { primaryProjectSlugs, projects } from "../src/content/project-catalog.ts";

test("default home showcase contains the curated primary projects", () => {
  const homeSlugs = homeProjects.map((project) => project.caseHref.replace("/projetos/", ""));

  assert.deepEqual(homeSlugs, [...primaryProjectSlugs]);
  assert.equal(homeProjects.some((project) => project.caseHref === "/lab"), false);
  assert.equal(homeProjects.some((project) => project.caseHref === "/"), false);
});

test("home showcase renders any admin-selected projects in the received order", () => {
  const selectedSlugs = ["robet", "fluxo", "comerc-ias"];
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

test("home showcase accepts an empty selection", () => {
  assert.deepEqual(createHomeProjects([]), []);
});
