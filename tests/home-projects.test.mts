import assert from "node:assert/strict";
import test from "node:test";

import { createHomeProjects } from "../src/content/home-projects.ts";
import { primaryProjectSlugs, projects } from "../src/content/project-catalog.ts";

test("home showcase contains only curated primary projects", () => {
  const homeProjects = createHomeProjects(projects);
  const homeSlugs = homeProjects.map((project) => project.caseHref.replace("/projetos/", ""));

  assert.deepEqual(homeSlugs, [...primaryProjectSlugs]);
  assert.equal(homeProjects.some((project) => project.caseHref === "/lab"), false);
  assert.equal(homeProjects.some((project) => project.caseHref === "/"), false);
});

test("home showcase skips a missing primary project without throwing", () => {
  const publicProjects = projects.filter((project) => project.slug !== "fluxo");
  const homeProjects = createHomeProjects(publicProjects);

  assert.equal(homeProjects.some((project) => project.caseHref === "/projetos/fluxo"), false);
  assert.equal(homeProjects.length, primaryProjectSlugs.length - 1);
});
