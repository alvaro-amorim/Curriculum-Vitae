import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("permanent project deletion is protected and isolated from archive", () => {
  const archiveRoute = readFileSync("src/app/api/admin/projects/[slug]/route.ts", "utf8");
  const deleteRoute = readFileSync("src/app/api/admin/projects/[slug]/permanent/route.ts", "utf8");

  assert.match(archiveRoute, /archiveAdminProject/);
  assert.match(deleteRoute, /requireAdminApiUser\(request, \{ mutation: true \}\)/);
  assert.match(deleteRoute, /deleteAdminProjectPermanently/);
  assert.match(deleteRoute, /deleted: true/);
});

test("permanent deletion removes related MongoDB records and Cloudinary media", () => {
  const source = readFileSync("src/lib/projects/repository.ts", "utf8");

  assert.match(source, /deleteCloudinaryProjectMedia/);
  assert.match(source, /portfolioProjectRevisions\.deleteMany\(\{ slug \}/);
  assert.match(source, /projectMediaAssets\.deleteMany\(\{ projectSlug: slug \}/);
  assert.match(source, /portfolioProjects\.deleteOne/);
});

test("Admin requires the exact slug before permanent deletion", () => {
  const source = readFileSync("src/components/admin/admin-project-list.tsx", "utf8");

  assert.match(source, /window\.prompt/);
  assert.match(source, /typedSlug !== slug/);
  assert.match(source, /\/permanent/);
  assert.match(source, />Excluir</);
});
