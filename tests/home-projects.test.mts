import assert from "node:assert/strict";
import test from "node:test";

import { createHomeProjects } from "../src/content/home-projects.ts";
import { projects } from "../src/content/projects.ts";

test("home showcase skips unpublished catalog projects without throwing", () => {
  const publicProjects = projects.filter((project) => project.slug !== "gdash-dashboard");
  const homeProjects = createHomeProjects(publicProjects);

  assert.equal(homeProjects.some((project) => project.caseHref === "/projetos/gdash-dashboard"), false);
  assert.equal(homeProjects.some((project) => project.caseHref === "/lab"), true);
  assert.equal(homeProjects.some((project) => project.caseHref === "/"), true);
});
