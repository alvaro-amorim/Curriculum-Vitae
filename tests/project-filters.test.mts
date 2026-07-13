import assert from "node:assert/strict";
import test from "node:test";

import {
  filterProjects,
  getProjectFilters,
  normalizeProjectTerm,
  projectHasCategory,
  projectHasTechnology,
} from "../src/lib/project-filters.ts";
import type { Project } from "../src/types/portfolio.ts";

const project: Project = {
  slug: "example",
  title: { pt: "Exemplo", en: "Example" },
  subtitle: { pt: "Teste", en: "Test" },
  shortDescription: { pt: "Teste", en: "Test" },
  fullDescription: { pt: "Teste", en: "Test" },
  status: { pt: "Publicado", en: "Published" },
  category: ["Métricas", "IA"],
  stack: ["React 19", "Tailwind CSS", "NestJS", "PostgreSQL"],
  problem: { pt: "Teste", en: "Test" },
  solution: { pt: "Teste", en: "Test" },
  highlights: { pt: [], en: [] },
  technicalChallenges: { pt: [], en: [] },
  whatItShows: { pt: "Teste", en: "Test" },
  links: { website: "https://example.com" },
};

test("normalizes accents, whitespace and case", () => {
  assert.equal(normalizeProjectTerm("  MéTRICAS "), "metricas");
});

test("matches localized categories", () => {
  assert.equal(projectHasCategory(project, ["Metricas"]), true);
  assert.equal(projectHasCategory(project, ["SaaS"]), false);
});

test("matches versioned and variant technology names", () => {
  assert.equal(projectHasTechnology(project, ["React"]), true);
  assert.equal(projectHasTechnology(project, ["Tailwind"]), true);
  assert.equal(projectHasTechnology(project, ["NestJS"]), true);
  assert.equal(projectHasTechnology(project, ["MongoDB"]), false);
});

test("builds localized filter labels", () => {
  const ptFilters = getProjectFilters("pt");
  const enFilters = getProjectFilters("en");

  assert.equal(ptFilters.find((filter) => filter.id === "ai")?.label, "IA");
  assert.equal(enFilters.find((filter) => filter.id === "ai")?.label, "AI");
  assert.equal(ptFilters.find((filter) => filter.id === "data")?.label, "Dados");
  assert.equal(enFilters.find((filter) => filter.id === "data")?.label, "Data");
});

test("returns all projects for unknown or all filters without losing order", () => {
  const projects: Project[] = [
    project,
    { ...project, slug: "second", category: ["SaaS"], stack: ["Next.js"] },
  ];
  const filters = getProjectFilters("pt");

  assert.deepEqual(filterProjects(projects, "all", filters), projects);
  assert.deepEqual(filterProjects(projects, "unknown", filters), projects);
  assert.deepEqual(filterProjects(projects, "saas", filters).map((item) => item.slug), ["second"]);
});
