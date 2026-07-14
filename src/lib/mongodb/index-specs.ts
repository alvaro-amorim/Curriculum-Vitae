export const MONGODB_INDEX_SPECS = {
  adminUsers: [
    {
      key: { normalizedEmail: 1 },
      name: "admin_users_normalized_email_unique",
      unique: true,
    },
    {
      key: { active: 1 },
      name: "admin_users_active",
    },
  ],
  adminSessions: [
    {
      key: { tokenHash: 1 },
      name: "admin_sessions_token_hash_unique",
      unique: true,
    },
    {
      key: { userId: 1, expiresAt: 1 },
      name: "admin_sessions_user_expires",
    },
    {
      expireAfterSeconds: 0,
      key: { expiresAt: 1 },
      name: "admin_sessions_expires_ttl",
    },
  ],
  adminLoginAttempts: [
    {
      key: { keyHash: 1 },
      name: "admin_login_attempts_key_hash_unique",
      unique: true,
    },
    {
      expireAfterSeconds: 0,
      key: { expiresAt: 1 },
      name: "admin_login_attempts_expires_ttl",
    },
  ],
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
  projectMediaAssets: [
    {
      key: { publicId: 1 },
      name: "project_media_assets_public_id_unique",
      unique: true,
    },
    {
      key: { projectSlug: 1, role: 1, position: 1 },
      name: "project_media_assets_project_role_position",
    },
    {
      key: { projectSlug: 1, role: 1 },
      name: "project_media_assets_one_active_logo_per_project",
      partialFilterExpression: {
        deletedAt: null,
        role: "logo",
      },
      unique: true,
    },
    {
      key: { projectSlug: 1, createdAt: -1 },
      name: "project_media_assets_project_created_desc",
    },
    {
      key: { deletedAt: 1 },
      name: "project_media_assets_deleted_at",
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
