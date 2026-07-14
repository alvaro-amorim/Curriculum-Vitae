import assert from "node:assert/strict";
import test from "node:test";

import { MONGODB_INDEX_SPECS } from "../src/lib/mongodb/index-specs.ts";

test("keeps Admin users, sessions and login attempts indexed", () => {
  const adminUserEmail = MONGODB_INDEX_SPECS.adminUsers.find(
    (index) => index.name === "admin_users_normalized_email_unique",
  );
  const adminSessionToken = MONGODB_INDEX_SPECS.adminSessions.find(
    (index) => index.name === "admin_sessions_token_hash_unique",
  );
  const adminSessionTtl = MONGODB_INDEX_SPECS.adminSessions.find(
    (index) => index.name === "admin_sessions_expires_ttl",
  );
  const adminAttemptTtl = MONGODB_INDEX_SPECS.adminLoginAttempts.find(
    (index) => index.name === "admin_login_attempts_expires_ttl",
  );

  assert.equal(adminUserEmail && "unique" in adminUserEmail ? adminUserEmail.unique : false, true);
  assert.deepEqual(adminUserEmail?.key, { normalizedEmail: 1 });
  assert.equal(adminSessionToken && "unique" in adminSessionToken ? adminSessionToken.unique : false, true);
  assert.deepEqual(adminSessionTtl?.key, { expiresAt: 1 });
  assert.equal("expireAfterSeconds" in (adminSessionTtl ?? {}) ? adminSessionTtl.expireAfterSeconds : null, 0);
  assert.deepEqual(adminAttemptTtl?.key, { expiresAt: 1 });
  assert.equal("expireAfterSeconds" in (adminAttemptTtl ?? {}) ? adminAttemptTtl.expireAfterSeconds : null, 0);
});

test("keeps Arcade session hashes unique", () => {
  const sessionHashIndex = MONGODB_INDEX_SPECS.arcadeSessions.find(
    (index) => index.name === "arcade_sessions_session_hash_unique",
  );

  assert.ok(sessionHashIndex);
  assert.equal("unique" in sessionHashIndex ? sessionHashIndex.unique : false, true);
  assert.deepEqual(sessionHashIndex.key, { sessionHash: 1 });
});

test("supports global and per-player Arcade ranking queries", () => {
  const names = MONGODB_INDEX_SPECS.arcadeScores.map((index) => index.name);

  assert.ok(names.includes("arcade_scores_game_version_ranking"));
  assert.ok(names.includes("arcade_scores_player_game_version_ranking"));
});

test("keeps project slugs unique and publication order indexed", () => {
  const slugIndex = MONGODB_INDEX_SPECS.portfolioProjects.find(
    (index) => index.name === "portfolio_projects_slug_unique",
  );
  const publicationIndex = MONGODB_INDEX_SPECS.portfolioProjects.find(
    (index) => index.name === "portfolio_projects_publication_order",
  );

  assert.ok(slugIndex);
  assert.equal("unique" in slugIndex ? slugIndex.unique : false, true);
  assert.ok(publicationIndex);
  assert.deepEqual(publicationIndex.key, {
    publicationStatus: 1,
    sortOrder: 1,
    updatedAt: -1,
  });
});

test("keeps project media assets indexed for ownership, ordering and cleanup", () => {
  const publicIdIndex = MONGODB_INDEX_SPECS.projectMediaAssets.find(
    (index) => index.name === "project_media_assets_public_id_unique",
  );
  const orderingIndex = MONGODB_INDEX_SPECS.projectMediaAssets.find(
    (index) => index.name === "project_media_assets_project_role_position",
  );
  const createdIndex = MONGODB_INDEX_SPECS.projectMediaAssets.find(
    (index) => index.name === "project_media_assets_project_created_desc",
  );
  const logoIndex = MONGODB_INDEX_SPECS.projectMediaAssets.find(
    (index) => index.name === "project_media_assets_one_active_logo_per_project",
  );
  const deletedIndex = MONGODB_INDEX_SPECS.projectMediaAssets.find(
    (index) => index.name === "project_media_assets_deleted_at",
  );

  assert.ok(publicIdIndex);
  assert.equal("unique" in publicIdIndex ? publicIdIndex.unique : false, true);
  assert.deepEqual(publicIdIndex.key, { publicId: 1 });
  assert.deepEqual(orderingIndex?.key, { projectSlug: 1, role: 1, position: 1 });
  assert.equal(logoIndex && "unique" in logoIndex ? logoIndex.unique : false, true);
  assert.deepEqual(logoIndex?.key, { projectSlug: 1, role: 1 });
  assert.deepEqual(
    logoIndex && "partialFilterExpression" in logoIndex ? logoIndex.partialFilterExpression : null,
    { deletedAt: null, role: "logo" },
  );
  assert.deepEqual(createdIndex?.key, { projectSlug: 1, createdAt: -1 });
  assert.deepEqual(deletedIndex?.key, { deletedAt: 1 });
});
