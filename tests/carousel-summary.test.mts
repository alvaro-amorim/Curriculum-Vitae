import assert from "node:assert/strict";
import test from "node:test";

import {
  CAROUSEL_DESCRIPTION_MAX_LENGTH,
  compactCarouselDescription,
  normalizeProjectHomePlacement,
  selectHomeProjectCollections,
} from "../src/lib/projects/home-placement.ts";
import type { Project } from "../src/types/portfolio.ts";

const project: Project = {
  category: ["SaaS"],
  featured: true,
  fullDescription: { en: "Full description", pt: "Descrição completa" },
  highlights: { en: ["Highlight"], pt: ["Destaque"] },
  links: { website: "https://example.com" },
  problem: { en: "Problem", pt: "Problema" },
  shortDescription: {
    en: "A very long carousel description that intentionally contains enough words to exceed the editorial space reserved in the first fold and must be compacted safely without changing the project's canonical short description.",
    pt: "Uma descrição muito longa para o carrossel que contém palavras suficientes para ultrapassar o espaço editorial reservado na primeira dobra e precisa ser compactada sem alterar a descrição curta canônica do projeto.",
  },
  slug: "project-one",
  solution: { en: "Solution", pt: "Solução" },
  stack: ["Next.js"],
  status: { en: "Published", pt: "Publicado" },
  subtitle: { en: "Subtitle", pt: "Subtítulo" },
  technicalChallenges: { en: ["Challenge"], pt: ["Desafio"] },
  title: { en: "Project One", pt: "Projeto Um" },
  whatItShows: { en: "Evidence", pt: "Evidência" },
};

test("carousel fallback stays inside the editorial character budget", () => {
  const compact = compactCarouselDescription(project.shortDescription);

  assert.ok(compact.pt.length <= CAROUSEL_DESCRIPTION_MAX_LENGTH);
  assert.ok(compact.en.length <= CAROUSEL_DESCRIPTION_MAX_LENGTH);
  assert.ok(compact.pt.endsWith("…"));
  assert.ok(compact.en.endsWith("…"));
});

test("carousel collection receives a compact fallback without changing the Home grid copy", () => {
  const placement = normalizeProjectHomePlacement({
    carouselOrder: 0,
    homeOrder: 0,
    showInCarousel: true,
    showInHome: true,
  });
  const collections = selectHomeProjectCollections(
    [project],
    new Map([[project.slug, placement]]),
  );

  assert.ok(collections.carouselProjects[0].carouselDescription);
  assert.ok((collections.carouselProjects[0].carouselDescription?.pt.length ?? 0) <= CAROUSEL_DESCRIPTION_MAX_LENGTH);
  assert.equal(collections.homeProjects[0].carouselDescription, undefined);
  assert.equal(collections.homeProjects[0].shortDescription.pt, project.shortDescription.pt);
});

test("custom bilingual carousel summary is preserved and empty values clear it", () => {
  const custom = normalizeProjectHomePlacement({
    carouselDescription: {
      en: "Short summary for the carousel.",
      pt: "Resumo curto para o carrossel.",
    },
    carouselOrder: 1,
    homeOrder: 1,
    showInCarousel: true,
    showInHome: true,
  });

  assert.deepEqual(custom.carouselDescription, {
    en: "Short summary for the carousel.",
    pt: "Resumo curto para o carrossel.",
  });

  const cleared = normalizeProjectHomePlacement({
    carouselDescription: { en: "", pt: "" },
    carouselOrder: 1,
    homeOrder: 1,
    showInCarousel: true,
    showInHome: true,
  }, custom);

  assert.equal(cleared.carouselDescription, undefined);
});
