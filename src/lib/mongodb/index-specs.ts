export const MONGODB_INDEX_SPECS = {
  arcadeSessions: [
    {
      key: { sessionHash: 1 },
      name: "arcade_sessions_session_hash_unique",
      unique: true,
    },
    {
      key: { lastSeenAt: -1 },
      name: "arcade_sessions_last_seen_desc",
    },
  ],
  arcadeScores: [
    {
      key: { gameId: 1, gameVersion: 1, score: -1, createdAt: 1 },
      name: "arcade_scores_game_version_ranking",
    },
    {
      key: { sessionHash: 1, gameId: 1, gameVersion: 1, score: -1, createdAt: 1 },
      name: "arcade_scores_player_game_version_ranking",
    },
    {
      key: { createdAt: -1 },
      name: "arcade_scores_created_desc",
    },
  ],
  portfolioProjects: [
    {
      key: { slug: 1 },
      name: "portfolio_projects_slug_unique",
      unique: true,
    },
    {
      key: { publicationStatus: 1, sortOrder: 1, updatedAt: -1 },
      name: "portfolio_projects_publication_order",
    },
  ],
  portfolioProjectRevisions: [
    {
      key: { projectId: 1, changedAt: -1 },
      name: "portfolio_project_revisions_project_changed",
    },
    {
      key: { slug: 1, changedAt: -1 },
      name: "portfolio_project_revisions_slug_changed",
    },
  ],
} as const;
