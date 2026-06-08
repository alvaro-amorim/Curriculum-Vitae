# Arcade DB Foundation

R1-E.12.2 prepares the database foundation for the Developer Arcade without
applying any remote SQL.

## Scope

- Project ref expected: `fkiuecyohcyjwygedncx`.
- Migration draft: `supabase/migrations/20260608154425_arcade_scores_foundation.sql`.
- Runtime status: `/api/score` remains local/mock.
- No Supabase client is created in application code in this phase.
- No remote table, policy, bucket, Auth or Admin feature is created in this phase.

## Planned Tables

### `arcade_sessions`

Stores anonymous player session records.

- `id`
- `session_hash`
- `alias`
- `created_at`
- `last_seen_at`

`session_hash` is constrained as lowercase sha256 hex with 64 characters. It
must be generated server-side from a non-PII browser/session identifier in a
future phase.

### `arcade_scores`

Stores validated score contract v2 submissions for the four final games.

- `runtime`
- `bug-maze`
- `code-snake`
- `stack-tetris`

The table stores `score`, `duration_ms`, `game_version`, `contract_version`,
`device_type`, `metadata_json`, `player_alias`, `session_hash` and `created_at`.

## Security Model

- RLS is enabled on both tables.
- No public policy is created in the draft.
- Public inserts are intentionally not allowed.
- Future reads and writes should go through Next.js Route Handlers.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- Public leaderboard responses must not expose `session_hash`.
- Aliases are display-only and should reject emails, phone numbers or other PII
  in the API layer before insert.

## Next Phase

R1-E.12.3 should apply the migration only after reviewing this SQL and confirming
tooling/authentication. The expected implementation order is:

1. Confirm Supabase tooling and permissions.
2. Apply the migration to project `fkiuecyohcyjwygedncx`.
3. Verify tables, constraints, indexes and RLS.
4. Keep `/api/score` local/mock until the persistent API phase is approved.
