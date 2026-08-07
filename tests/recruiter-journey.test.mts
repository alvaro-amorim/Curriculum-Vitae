import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("Home metadata derives from the canonical career source", () => {
  const source = read("src/app/page.tsx");

  assert.match(source, /career\.seo\.siteDescription\.pt/);
  assert.match(source, /profile\.shortName/);
  assert.doesNotMatch(source, /portf[oó]lio premium/i);
});

test("Topbar uses the canonical localized professional role", () => {
  const source = read("src/components/layout/topbar.tsx");

  assert.match(source, /profile\.role\[locale\]/);
  assert.doesNotMatch(source, /<small>Full Stack Developer<\/small>/);
});

test("Public shell exposes keyboard skip navigation", () => {
  const source = read("src/components/layout/app-shell.tsx");

  assert.match(source, /href="#main-content"/);
  assert.match(source, /id="main-content"/);
  assert.match(source, /Pular para o conteúdo/);
  assert.match(source, /Skip to content/);
});

test("robots keeps administrative routes out of search indexing", () => {
  const source = read("src/app/robots.ts");

  assert.match(source, /"\/admin"/);
  assert.match(source, /"\/api\/admin"/);
});

test("project filters always provide an empty-state recovery action", () => {
  const source = read("src/components/projects/project-grid.tsx");

  assert.match(source, /visibleProjects\.length === 0/);
  assert.match(source, /setActiveCategory\("all"\)/);
  assert.match(source, /Mostrar todos os projetos/);
});

test("projects index stays recruiter-facing instead of exposing storage implementation", () => {
  const source = read("src/components/projects/projects-index.tsx");

  assert.doesNotMatch(source, /MongoDB/);
  assert.doesNotMatch(source, /painel administrativo/i);
  assert.match(source, /decisões técnicas/);
});

test("project detail closes with a recruiter next step and invalid projects are noindex", () => {
  const source = read("src/app/projetos/[slug]/page.tsx");

  assert.match(source, /ProjectRecruiterCta/);
  assert.match(source, /index: false/);
  assert.match(source, /follow: false/);
});

test("404 recovery follows the selected portfolio locale", () => {
  const source = read("src/app/not-found.tsx");

  assert.match(source, /usePortfolioUi/);
  assert.match(source, /locale === "pt"/);
  assert.match(source, /Open resume/);
});
