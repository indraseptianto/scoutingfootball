create table if not exists public.player_match_statistics (
  id uuid primary key default gen_random_uuid(),
  fixture_sportmonks_id bigint not null,
  player_sportmonks_id bigint not null,
  team_sportmonks_id bigint not null,
  opponent_team_sportmonks_id bigint,
  league_sportmonks_id bigint,
  season_sportmonks_id bigint,
  round_sportmonks_id bigint,
  fixture_name text,
  round_name text,
  starting_at timestamptz,
  location text check (location in ('home', 'away', 'neutral') or location is null),
  team_score int,
  opponent_score int,
  result text,
  minutes int,
  rating numeric,
  goals int,
  assists int,
  shots_total int,
  shots_on_target int,
  shots_off_target int,
  expected_goals numeric,
  expected_assists numeric,
  passes_total int,
  passes_accurate int,
  pass_accuracy numeric,
  key_passes int,
  crosses_total int,
  crosses_accurate int,
  long_balls_total int,
  long_balls_accurate int,
  touches int,
  dribble_attempts int,
  dribbles_successful int,
  dribble_success_rate numeric,
  possession_lost int,
  fouls_drawn int,
  fouls_committed int,
  tackles int,
  interceptions int,
  clearances int,
  blocks int,
  duels_total int,
  duels_won int,
  aerials_total int,
  aerials_won int,
  saves int,
  goals_conceded int,
  yellow_cards int,
  red_cards int,
  raw_details jsonb not null default '[]'::jsonb,
  raw_lineup jsonb not null default '{}'::jsonb,
  raw_fixture jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(fixture_sportmonks_id, player_sportmonks_id, team_sportmonks_id)
);

create index if not exists idx_player_match_stats_player_date
  on public.player_match_statistics(player_sportmonks_id, starting_at desc);

create index if not exists idx_player_match_stats_fixture
  on public.player_match_statistics(fixture_sportmonks_id);

create index if not exists idx_player_match_stats_team_season
  on public.player_match_statistics(team_sportmonks_id, season_sportmonks_id);

create index if not exists idx_player_match_stats_league_season
  on public.player_match_statistics(league_sportmonks_id, season_sportmonks_id);

alter table public.player_match_statistics enable row level security;

drop policy if exists "Authenticated read player match statistics" on public.player_match_statistics;
create policy "Authenticated read player match statistics"
  on public.player_match_statistics for select to authenticated using (true);
