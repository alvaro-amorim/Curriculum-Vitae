-- R1-E.12.2 - Developer Arcade score database foundation draft.
-- This migration is versioned in the repository but must be applied only in a
-- later approved phase. It intentionally contains no secrets and no seed data.

begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.arcade_sessions (
  id uuid primary key default gen_random_uuid(),
  session_hash text not null unique,
  alias text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint arcade_sessions_session_hash_sha256 check (session_hash ~ '^[a-f0-9]{64}$'),
  constraint arcade_sessions_alias_length check (
    alias is null
    or char_length(btrim(alias)) between 1 and 24
  ),
  constraint arcade_sessions_last_seen_order check (last_seen_at >= created_at)
);

create table if not exists public.arcade_scores (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  score integer not null,
  player_alias text,
  session_hash text not null,
  duration_ms integer not null,
  game_version text not null,
  contract_version text not null default 'v2',
  device_type text not null default 'unknown',
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint arcade_scores_game_id_check check (
    game_id in ('runtime', 'bug-maze', 'code-snake', 'stack-tetris')
  ),
  constraint arcade_scores_score_check check (score between 0 and 100),
  constraint arcade_scores_duration_check check (duration_ms between 250 and 900000),
  constraint arcade_scores_contract_version_check check (contract_version = 'v2'),
  constraint arcade_scores_device_type_check check (device_type in ('desktop', 'mobile', 'unknown')),
  constraint arcade_scores_game_version_length check (char_length(game_version) between 1 and 64),
  constraint arcade_scores_player_alias_length check (
    player_alias is null
    or char_length(btrim(player_alias)) between 1 and 24
  ),
  constraint arcade_scores_session_hash_sha256 check (session_hash ~ '^[a-f0-9]{64}$'),
  constraint arcade_scores_metadata_object check (jsonb_typeof(metadata_json) = 'object'),
  constraint arcade_scores_session_fk foreign key (session_hash)
    references public.arcade_sessions (session_hash)
    on update cascade
    on delete restrict
);

create index if not exists idx_arcade_scores_game_score_created
  on public.arcade_scores (game_id, score desc, created_at desc);

create index if not exists idx_arcade_scores_game_version_score_created
  on public.arcade_scores (game_id, game_version, score desc, created_at desc);

create index if not exists idx_arcade_scores_session_created
  on public.arcade_scores (session_hash, created_at desc);

create index if not exists idx_arcade_scores_created
  on public.arcade_scores (created_at desc);

create index if not exists idx_arcade_scores_game_created
  on public.arcade_scores (game_id, created_at desc);

alter table public.arcade_sessions enable row level security;
alter table public.arcade_scores enable row level security;

comment on table public.arcade_sessions is
  'Anonymous Developer Arcade player sessions. session_hash must be a server-generated hash, not a raw browser id.';

comment on column public.arcade_sessions.session_hash is
  'Lowercase sha256 hex hash. Do not store raw browser identifiers or PII.';

comment on column public.arcade_sessions.alias is
  'Optional display alias. API validation must reject email, phone and other personal data patterns.';

comment on table public.arcade_scores is
  'Developer Arcade score submissions for the four final games. Writes and reads are expected to go through server-side APIs.';

comment on column public.arcade_scores.session_hash is
  'References arcade_sessions.session_hash. Never expose this value in public leaderboard responses.';

comment on column public.arcade_scores.metadata_json is
  'Validated score contract v2 metadata. The API remains responsible for game-specific validation.';

comment on column public.arcade_scores.contract_version is
  'Current active score contract. R1-E.12.1 introduced v2.';

-- No public SELECT, INSERT, UPDATE or DELETE policies are created in this draft.
-- Future Next.js Route Handlers should use the service role only server-side and
-- return sanitized leaderboard DTOs without session_hash.

commit;
