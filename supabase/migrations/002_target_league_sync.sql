create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  name text not null,
  iso2 text,
  iso3 text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  name text not null,
  code text,
  developer_name text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.club_season_memberships (
  id uuid primary key default gen_random_uuid(),
  team_sportmonks_id bigint not null,
  league_sportmonks_id bigint not null,
  season_sportmonks_id bigint not null,
  created_at timestamptz not null default now(),
  unique(team_sportmonks_id, season_sportmonks_id)
);

alter table public.seasons add column if not exists is_current boolean;
alter table public.seasons add column if not exists starting_at date;
alter table public.seasons add column if not exists ending_at date;

create index if not exists idx_countries_name on public.countries(name);
create index if not exists idx_positions_name on public.positions(name);
create index if not exists idx_club_season_memberships_season on public.club_season_memberships(season_sportmonks_id);
create index if not exists idx_club_season_memberships_league on public.club_season_memberships(league_sportmonks_id);
create index if not exists idx_seasons_current_league on public.seasons(league_sportmonks_id, is_current);

alter table public.countries enable row level security;
alter table public.positions enable row level security;
alter table public.club_season_memberships enable row level security;

drop policy if exists "Authenticated read countries" on public.countries;
create policy "Authenticated read countries" on public.countries for select to authenticated using (true);

drop policy if exists "Authenticated read positions" on public.positions;
create policy "Authenticated read positions" on public.positions for select to authenticated using (true);

drop policy if exists "Authenticated read club season memberships" on public.club_season_memberships;
create policy "Authenticated read club season memberships" on public.club_season_memberships for select to authenticated using (true);
