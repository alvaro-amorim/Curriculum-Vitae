-- Phase 1B.1 - Unique-player leaderboard RPCs for the Developer Arcade.
-- Keeps the full score history while ranking only each session's best score.

begin;

create index if not exists idx_arcade_scores_game_session_best
  on public.arcade_scores (game_id, session_hash, score desc, created_at asc, id asc);

create or replace function public.get_arcade_leaderboard(
  p_game_id text,
  p_period text,
  p_limit integer
)
returns table (
  alias text,
  score integer,
  created_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_cutoff timestamptz;
  v_limit integer;
begin
  if p_game_id is null or p_game_id not in ('runtime', 'bug-maze', 'code-snake', 'stack-tetris') then
    raise exception 'Invalid leaderboard game.' using errcode = '22023';
  end if;

  if p_period is null or p_period not in ('all', 'week', 'month') then
    raise exception 'Invalid leaderboard period.' using errcode = '22023';
  end if;

  v_limit := greatest(1, least(coalesce(p_limit, 10), 50));
  v_cutoff := case p_period
    when 'week' then current_timestamp - interval '7 days'
    when 'month' then current_timestamp - interval '30 days'
    else null
  end;

  return query
  with eligible_scores as (
    select
      arcade_scores.id,
      arcade_scores.session_hash,
      arcade_scores.score,
      arcade_scores.created_at
    from public.arcade_scores
    where arcade_scores.game_id = p_game_id
      and (v_cutoff is null or arcade_scores.created_at >= v_cutoff)
  ),
  best_scores as (
    select distinct on (eligible_scores.session_hash)
      eligible_scores.id,
      eligible_scores.session_hash,
      eligible_scores.score,
      eligible_scores.created_at
    from eligible_scores
    order by
      eligible_scores.session_hash,
      eligible_scores.score desc,
      eligible_scores.created_at asc,
      eligible_scores.id asc
  )
  select
    coalesce(nullif(btrim(arcade_sessions.alias), ''), 'Anonymous Dev') as alias,
    best_scores.score,
    best_scores.created_at
  from best_scores
  join public.arcade_sessions
    on arcade_sessions.session_hash = best_scores.session_hash
  order by
    best_scores.score desc,
    best_scores.created_at asc,
    best_scores.id asc
  limit v_limit;
end;
$$;

create or replace function public.get_arcade_player_rankings(
  p_session_hash text
)
returns table (
  game_id text,
  score integer,
  created_at timestamptz,
  rank bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_session_hash is null or p_session_hash !~ '^[a-f0-9]{64}$' then
    return;
  end if;

  return query
  with best_scores as (
    select distinct on (arcade_scores.game_id, arcade_scores.session_hash)
      arcade_scores.id,
      arcade_scores.game_id,
      arcade_scores.session_hash,
      arcade_scores.score,
      arcade_scores.created_at
    from public.arcade_scores
    where arcade_scores.game_id in ('runtime', 'bug-maze', 'code-snake', 'stack-tetris')
    order by
      arcade_scores.game_id,
      arcade_scores.session_hash,
      arcade_scores.score desc,
      arcade_scores.created_at asc,
      arcade_scores.id asc
  ),
  ranked_scores as (
    select
      best_scores.id,
      best_scores.game_id,
      best_scores.session_hash,
      best_scores.score,
      best_scores.created_at,
      row_number() over (
        partition by best_scores.game_id
        order by best_scores.score desc, best_scores.created_at asc, best_scores.id asc
      ) as rank
    from best_scores
  )
  select
    ranked_scores.game_id,
    ranked_scores.score,
    ranked_scores.created_at,
    ranked_scores.rank
  from ranked_scores
  where ranked_scores.session_hash = p_session_hash
  order by
    case ranked_scores.game_id
      when 'runtime' then 1
      when 'bug-maze' then 2
      when 'code-snake' then 3
      when 'stack-tetris' then 4
      else 5
    end;
end;
$$;

revoke all on function public.get_arcade_leaderboard(text, text, integer)
  from public, anon, authenticated;

revoke all on function public.get_arcade_player_rankings(text)
  from public, anon, authenticated;

grant execute on function public.get_arcade_leaderboard(text, text, integer)
  to service_role;

grant execute on function public.get_arcade_player_rankings(text)
  to service_role;

comment on function public.get_arcade_leaderboard(text, text, integer) is
  'Returns one sanitized best-score entry per anonymous Arcade session for a game and rolling period.';

comment on function public.get_arcade_player_rankings(text) is
  'Returns all-time unique-player positions for one server-resolved Arcade session without exposing its hash.';

commit;
