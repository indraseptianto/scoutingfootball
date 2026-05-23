create extension if not exists "pgcrypto";

create table if not exists public.sportmonks_api_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  endpoint text not null,
  query jsonb not null default '{}'::jsonb,
  response jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.sportmonks_target_leagues (
  id uuid primary key default gen_random_uuid(),
  league_sportmonks_id bigint not null unique,
  name text not null,
  priority int not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.continents (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  name text not null,
  code text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  country_sportmonks_id bigint,
  name text not null,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  country_sportmonks_id bigint,
  region_sportmonks_id bigint,
  name text not null,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  city_sportmonks_id bigint,
  country_sportmonks_id bigint,
  name text not null,
  address text,
  zipcode text,
  latitude numeric,
  longitude numeric,
  capacity int,
  image_path text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sportmonks_types (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  name text not null,
  code text,
  developer_name text,
  model_type text,
  stat_group text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.fixture_states (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  name text not null,
  short_name text,
  developer_name text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.stages (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  league_sportmonks_id bigint,
  season_sportmonks_id bigint,
  name text not null,
  type_name text,
  sort_order int,
  starting_at date,
  ending_at date,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  league_sportmonks_id bigint,
  season_sportmonks_id bigint,
  stage_sportmonks_id bigint,
  name text not null,
  round_number int,
  starting_at date,
  ending_at date,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  country_sportmonks_id bigint,
  display_name text not null,
  firstname text,
  lastname text,
  date_of_birth date,
  gender text,
  image_path text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.team_coaches (
  id uuid primary key default gen_random_uuid(),
  team_sportmonks_id bigint not null,
  coach_sportmonks_id bigint not null,
  season_sportmonks_id bigint,
  active boolean not null default true,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(team_sportmonks_id, coach_sportmonks_id, season_sportmonks_id)
);

create table if not exists public.fixture_participants (
  id uuid primary key default gen_random_uuid(),
  fixture_sportmonks_id bigint not null,
  team_sportmonks_id bigint not null,
  location text check (location in ('home', 'away', 'neutral') or location is null),
  winner boolean,
  meta jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(fixture_sportmonks_id, team_sportmonks_id)
);

create table if not exists public.fixture_scores (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint unique,
  fixture_sportmonks_id bigint not null,
  type_sportmonks_id bigint,
  participant_sportmonks_id bigint,
  score_goals int,
  description text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.fixture_events (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  fixture_sportmonks_id bigint not null,
  team_sportmonks_id bigint,
  player_sportmonks_id bigint,
  related_player_sportmonks_id bigint,
  type_sportmonks_id bigint,
  minute int,
  extra_minute int,
  result text,
  info text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.fixture_lineups (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint unique,
  fixture_sportmonks_id bigint not null,
  team_sportmonks_id bigint not null,
  player_sportmonks_id bigint not null,
  position_sportmonks_id bigint,
  formation_position int,
  shirt_number int,
  type_name text,
  captain boolean,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(fixture_sportmonks_id, team_sportmonks_id, player_sportmonks_id, type_name)
);

create table if not exists public.statistic_details (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint unique,
  entity_type text not null check (entity_type in ('player', 'team', 'fixture')),
  entity_sportmonks_id bigint not null,
  fixture_sportmonks_id bigint,
  season_sportmonks_id bigint,
  team_sportmonks_id bigint,
  player_sportmonks_id bigint,
  type_sportmonks_id bigint,
  value_numeric numeric,
  value_text text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.team_statistics (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint unique,
  team_sportmonks_id bigint not null,
  season_sportmonks_id bigint,
  fixture_sportmonks_id bigint,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.player_team_history (
  id uuid primary key default gen_random_uuid(),
  player_sportmonks_id bigint not null,
  team_sportmonks_id bigint not null,
  season_sportmonks_id bigint,
  start_date date,
  end_date date,
  active boolean,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(player_sportmonks_id, team_sportmonks_id, season_sportmonks_id)
);

alter table public.leagues add column if not exists type_name text;
alter table public.leagues add column if not exists category int;
alter table public.leagues add column if not exists active boolean;

alter table public.clubs add column if not exists venue_sportmonks_id bigint;
alter table public.clubs add column if not exists gender text;
alter table public.clubs add column if not exists national_team boolean;

alter table public.players add column if not exists country_sportmonks_id bigint;
alter table public.players add column if not exists position_sportmonks_id bigint;
alter table public.players add column if not exists detailed_position_sportmonks_id bigint;
alter table public.players add column if not exists preferred_foot text;

alter table public.squad_players add column if not exists position_sportmonks_id bigint;
alter table public.squad_players add column if not exists start_date date;
alter table public.squad_players add column if not exists end_date date;

alter table public.fixtures add column if not exists stage_sportmonks_id bigint;
alter table public.fixtures add column if not exists round_sportmonks_id bigint;
alter table public.fixtures add column if not exists venue_sportmonks_id bigint;
alter table public.fixtures add column if not exists state_sportmonks_id bigint;
alter table public.fixtures add column if not exists has_odds boolean;
alter table public.fixtures add column if not exists has_premium_odds boolean;
alter table public.fixtures add column if not exists home_team_sportmonks_id bigint;
alter table public.fixtures add column if not exists away_team_sportmonks_id bigint;
alter table public.fixtures add column if not exists home_score int;
alter table public.fixtures add column if not exists away_score int;

alter table public.standings add column if not exists stage_sportmonks_id bigint;
alter table public.standings add column if not exists round_sportmonks_id bigint;
alter table public.standings add column if not exists played int;
alter table public.standings add column if not exists won int;
alter table public.standings add column if not exists drawn int;
alter table public.standings add column if not exists lost int;
alter table public.standings add column if not exists goals_for int;
alter table public.standings add column if not exists goals_against int;
alter table public.standings add column if not exists goal_difference int generated always as (coalesce(goals_for, 0) - coalesce(goals_against, 0)) stored;

alter table public.transfers add column if not exists amount numeric;
alter table public.transfers add column if not exists currency text;

create index if not exists idx_sportmonks_api_cache_key on public.sportmonks_api_cache(cache_key);
create index if not exists idx_sportmonks_api_cache_expires on public.sportmonks_api_cache(expires_at);
create index if not exists idx_target_leagues_active on public.sportmonks_target_leagues(active, priority);
create index if not exists idx_venues_city on public.venues(city_sportmonks_id);
create index if not exists idx_stages_season on public.stages(season_sportmonks_id);
create index if not exists idx_rounds_season_stage on public.rounds(season_sportmonks_id, stage_sportmonks_id);
create index if not exists idx_fixture_participants_fixture on public.fixture_participants(fixture_sportmonks_id);
create index if not exists idx_fixture_scores_fixture on public.fixture_scores(fixture_sportmonks_id);
create index if not exists idx_fixture_events_fixture on public.fixture_events(fixture_sportmonks_id);
create index if not exists idx_fixture_lineups_fixture_team on public.fixture_lineups(fixture_sportmonks_id, team_sportmonks_id);
create index if not exists idx_statistic_details_entity on public.statistic_details(entity_type, entity_sportmonks_id);
create index if not exists idx_statistic_details_type on public.statistic_details(type_sportmonks_id);
create index if not exists idx_team_statistics_team_season on public.team_statistics(team_sportmonks_id, season_sportmonks_id);
create index if not exists idx_player_team_history_player on public.player_team_history(player_sportmonks_id);
create index if not exists idx_fixtures_league_start on public.fixtures(league_sportmonks_id, starting_at);
create index if not exists idx_fixtures_teams on public.fixtures(home_team_sportmonks_id, away_team_sportmonks_id);
create index if not exists idx_standings_season_team on public.standings(season_sportmonks_id, team_sportmonks_id);

alter table public.sportmonks_api_cache enable row level security;
alter table public.sportmonks_target_leagues enable row level security;
alter table public.continents enable row level security;
alter table public.regions enable row level security;
alter table public.cities enable row level security;
alter table public.venues enable row level security;
alter table public.sportmonks_types enable row level security;
alter table public.fixture_states enable row level security;
alter table public.stages enable row level security;
alter table public.rounds enable row level security;
alter table public.coaches enable row level security;
alter table public.team_coaches enable row level security;
alter table public.fixture_participants enable row level security;
alter table public.fixture_scores enable row level security;
alter table public.fixture_events enable row level security;
alter table public.fixture_lineups enable row level security;
alter table public.statistic_details enable row level security;
alter table public.team_statistics enable row level security;
alter table public.player_team_history enable row level security;

drop policy if exists "Authenticated read target leagues" on public.sportmonks_target_leagues;
create policy "Authenticated read target leagues" on public.sportmonks_target_leagues for select to authenticated using (true);

drop policy if exists "Authenticated read continents" on public.continents;
create policy "Authenticated read continents" on public.continents for select to authenticated using (true);

drop policy if exists "Authenticated read regions" on public.regions;
create policy "Authenticated read regions" on public.regions for select to authenticated using (true);

drop policy if exists "Authenticated read cities" on public.cities;
create policy "Authenticated read cities" on public.cities for select to authenticated using (true);

drop policy if exists "Authenticated read venues" on public.venues;
create policy "Authenticated read venues" on public.venues for select to authenticated using (true);

drop policy if exists "Authenticated read sportmonks types" on public.sportmonks_types;
create policy "Authenticated read sportmonks types" on public.sportmonks_types for select to authenticated using (true);

drop policy if exists "Authenticated read fixture states" on public.fixture_states;
create policy "Authenticated read fixture states" on public.fixture_states for select to authenticated using (true);

drop policy if exists "Authenticated read stages" on public.stages;
create policy "Authenticated read stages" on public.stages for select to authenticated using (true);

drop policy if exists "Authenticated read rounds" on public.rounds;
create policy "Authenticated read rounds" on public.rounds for select to authenticated using (true);

drop policy if exists "Authenticated read coaches" on public.coaches;
create policy "Authenticated read coaches" on public.coaches for select to authenticated using (true);

drop policy if exists "Authenticated read team coaches" on public.team_coaches;
create policy "Authenticated read team coaches" on public.team_coaches for select to authenticated using (true);

drop policy if exists "Authenticated read fixture participants" on public.fixture_participants;
create policy "Authenticated read fixture participants" on public.fixture_participants for select to authenticated using (true);

drop policy if exists "Authenticated read fixture scores" on public.fixture_scores;
create policy "Authenticated read fixture scores" on public.fixture_scores for select to authenticated using (true);

drop policy if exists "Authenticated read fixture events" on public.fixture_events;
create policy "Authenticated read fixture events" on public.fixture_events for select to authenticated using (true);

drop policy if exists "Authenticated read fixture lineups" on public.fixture_lineups;
create policy "Authenticated read fixture lineups" on public.fixture_lineups for select to authenticated using (true);

drop policy if exists "Authenticated read statistic details" on public.statistic_details;
create policy "Authenticated read statistic details" on public.statistic_details for select to authenticated using (true);

drop policy if exists "Authenticated read team statistics" on public.team_statistics;
create policy "Authenticated read team statistics" on public.team_statistics for select to authenticated using (true);

drop policy if exists "Authenticated read player team history" on public.player_team_history;
create policy "Authenticated read player team history" on public.player_team_history for select to authenticated using (true);

insert into public.sportmonks_target_leagues (league_sportmonks_id, name, priority)
values
  (564, 'La Liga', 10),
  (8, 'Premier League', 20),
  (9, 'Championship', 30),
  (12, 'League One', 40),
  (14, 'League Two', 50)
on conflict (league_sportmonks_id) do update
set name = excluded.name,
    priority = excluded.priority,
    active = true;
