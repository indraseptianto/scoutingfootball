create table if not exists public.season_player_statistics (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint unique,
  player_sportmonks_id bigint not null,
  team_sportmonks_id bigint,
  league_sportmonks_id bigint,
  season_sportmonks_id bigint not null,
  position_name text,
  appearances int,
  starts int,
  minutes int,
  rating numeric,
  goals int,
  assists int,
  shots_total int,
  shots_on_target int,
  shots_off_target int,
  expected_goals numeric,
  expected_goals_on_target numeric,
  expected_assists numeric,
  shooting_performance numeric,
  passes_total int,
  passes_accurate int,
  pass_accuracy numeric,
  key_passes int,
  chances_created int,
  big_chances_created int,
  passes_final_third int,
  crosses_total int,
  crosses_accurate int,
  accurate_crosses_percentage numeric,
  long_balls_total int,
  long_balls_accurate int,
  long_balls_won_percentage numeric,
  touches int,
  dribble_attempts int,
  dribbles_successful int,
  dribble_success_rate numeric,
  possession_lost int,
  dispossessed int,
  turn_overs int,
  ball_recoveries int,
  fouls_drawn int,
  fouls_committed int,
  tackles int,
  tackles_won int,
  tackles_won_percentage numeric,
  interceptions int,
  clearances int,
  blocks int,
  duels_total int,
  duels_won int,
  duels_lost int,
  duels_won_percentage numeric,
  aerials_total int,
  aerials_won int,
  aerials_lost int,
  aerials_won_percentage numeric,
  saves int,
  goals_conceded int,
  yellow_cards int,
  red_cards int,
  source text not null default 'sportmonks' check (source in ('sportmonks', 'match_aggregate')),
  raw_details jsonb not null default '[]'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(player_sportmonks_id, team_sportmonks_id, season_sportmonks_id)
);

create index if not exists idx_season_player_stats_player
  on public.season_player_statistics(player_sportmonks_id, season_sportmonks_id);

create index if not exists idx_season_player_stats_team_season
  on public.season_player_statistics(team_sportmonks_id, season_sportmonks_id);

create index if not exists idx_season_player_stats_league_season
  on public.season_player_statistics(league_sportmonks_id, season_sportmonks_id);

alter table public.season_player_statistics enable row level security;

drop policy if exists "Authenticated read season player statistics" on public.season_player_statistics;
create policy "Authenticated read season player statistics"
  on public.season_player_statistics for select to authenticated using (true);
