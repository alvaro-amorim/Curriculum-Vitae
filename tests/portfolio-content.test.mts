import assert from "node:assert/strict";
import test from "node:test";

import { career } from "../src/content/career.ts";
import { homeCopy } from "../src/content/home-copy.ts";
import { createHomeProjects } from "../src/content/home-projects.ts";
import { primaryProjects } from "../src/content/project-catalog.ts";
import { portfolioContent } from "../src/content/portfolio.ts";

const { education, profile, projects, resumeSummary } = portfolioContent;

test("professional identity is shared across portfolio surfaces", () => {
  assert.strictEqual(profile.role, career.role);
  assert.strictEqual(profile.positioning, career.positioning);
  assert.strictEqual(resumeSummary, career.resumeSummary);
  assert.equal(homeCopy.pt.aboutText, career.homeAbout.pt);
  assert.equal(homeCopy.en.aboutText, career.homeAbout.en);
  assert.strictEqual(homeCopy.pt.aboutStats, career.homeStats.pt);
  assert.strictEqual(homeCopy.en.aboutStats, career.homeStats.en);
});

test("canonical registry keeps required professional data available", () => {
  assert.equal(profile.email, "alvaroaom.jf@gmail.com");
  assert.equal(education.some((item) => item.institution.pt === "FIAP"), true);
  assert.equal(projects.length > 0, true);
  assert.equal(new Set(projects.map((project) => project.slug)).size, projects.length);
});

test("home project showcases derive content from the selected project catalog", () => {
  const showcases = createHomeProjects(primaryProjects);

  assert.equal(showcases.length, primaryProjects.length);

  for (const showcase of showcases) {
    const slug = showcase.caseHref.replace("/projetos/", "");
    const source = primaryProjects.find((project) => project.slug === slug);

    assert.ok(source, `Missing project source for ${slug}`);
    assert.equal(showcase.title, source.title.pt);
    assert.strictEqual(showcase.description, source.shortDescription);
    assert.strictEqual(showcase.carouselStack, source.stack);
    assert.equal(showcase.liveHref, source.links.website || undefined);
  }
});
