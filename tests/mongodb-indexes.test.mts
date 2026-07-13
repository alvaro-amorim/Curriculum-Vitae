import assert from "node:assert/strict";
import test from "node:test";

import { MONGODB_INDEX_SPECS } from "../src/lib/mongodb/index-specs.ts";

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

  assert.ok(names.includes("arcade_scores_game_ranking"));
  assert.ok(names.includes("arcade_scores_player_game_ranking"));
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
