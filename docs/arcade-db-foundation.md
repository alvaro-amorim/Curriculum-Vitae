# Arcade DB Foundation

R1-E.12.2 prepared the database foundation draft for the Developer Arcade.
R1-E.12.3 applied that migration to the Supabase remote project.

## Scope

- Project ref expected: `fkiuecyohcyjwygedncx`.
- Applied migration: `supabase/migrations/20260608154425_arcade_scores_foundation.sql`.
- Runtime status: `/api/score` remains local/mock.
- No Supabase client is created in application code in this phase.
- Remote tables created: `arcade_sessions` and `arcade_scores`.
- No public policy, bucket, Auth, Leaderboard or Admin feature is created in this phase.

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
- No public policy was created.
- Public inserts are intentionally not allowed.
- Future reads and writes should go through Next.js Route Handlers.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- Public leaderboard responses must not expose `session_hash`.
- Aliases are display-only and should reject emails, phone numbers or other PII
  in the API layer before insert.

## Remote Verification

- Project ref: `fkiuecyohcyjwygedncx`.
- `npx supabase db push --dry-run` reported the remote database up to date after
  apply.
- `supabase_migrations.schema_migrations` contains version `20260608154425`.
- Read-only catalog checks confirmed both tables, RLS enabled, expected
  constraints and indexes, no public policies and zero seed rows.

## Next Phase

R1-E.12.4 should add anonymous player identity before score persistence. The
expected implementation order is:

1. Create a local anonymous player session id without collecting PII.
2. Hash the session id server-side before database writes.
3. Add optional alias validation.
4. Keep `/api/score` local/mock until the persistent score API phase is
   approved.
