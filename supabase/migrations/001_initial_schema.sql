create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text not null default 'scout' check (role in ('scout', 'analyst', 'club_admin', 'platform_admin')),
  organization_name text,
  created_at timestamptz not null default now()
);

create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  name text not null,
  short_code text,
  image_path text,
  country_id bigint,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  league_sportmonks_id bigint,
  name text not null,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  name text not null,
  short_code text,
  country_id bigint,
  founded int,
  image_path text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  display_name text not null,
  firstname text,
  lastname text,
  date_of_birth date,
  gender text,
  image_path text,
  height int,
  weight int,
  position_name text,
  nationality_name text,
  hidden_gem_score int not null default 0 check (hidden_gem_score between 0 and 100),
  contract_expires_at date,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.player_stats (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  player_sportmonks_id bigint,
  season_sportmonks_id bigint,
  team_sportmonks_id bigint,
  appearances int,
  minutes_played int,
  goals int,
  assists int,
  rating numeric,
  raw jsonb not null default '{}'::jsonb,
  goals_per_90 numeric generated always as (
    case when minutes_played > 0 then round((goals::numeric * 90) / minutes_played, 2) else null end
  ) stored,
  updated_at timestamptz not null default now()
);

create table public.squad_players (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  team_sportmonks_id bigint not null,
  season_sportmonks_id bigint,
  player_sportmonks_id bigint,
  jersey_number int,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  league_sportmonks_id bigint,
  season_sportmonks_id bigint,
  name text,
  starting_at timestamptz,
  result_info text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.standings (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  season_sportmonks_id bigint,
  team_sportmonks_id bigint,
  position int,
  points int,
  result text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id bigint not null unique,
  player_sportmonks_id bigint,
  from_team_sportmonks_id bigint,
  to_team_sportmonks_id bigint,
  transfer_date date,
  type_name text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.ai_scouting_reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  created_by uuid references public.profiles(id),
  status text not null default 'completed' check (status in ('draft', 'generating', 'completed', 'failed')),
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.shortlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.shortlist_players (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid references public.shortlists(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  stage text not null default 'watchlist' check (stage in ('watchlist', 'scout_further', 'priority_target', 'negotiation', 'rejected')),
  created_at timestamptz not null default now(),
  unique(shortlist_id, player_id)
);

create table public.shortlist_notes (
  id uuid primary key default gen_random_uuid(),
  shortlist_player_id uuid references public.shortlist_players(id) on delete cascade,
  author_id uuid references public.profiles(id),
  note text not null,
  created_at timestamptz not null default now()
);

create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, player_id)
);

create table public.watchlist_events (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid references public.watchlist(id) on delete cascade,
  event_type text not null check (event_type in ('contract_change', 'performance_spike', 'transfer', 'note')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.data_sync_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'sportmonks',
  entity text not null,
  status text not null check (status in ('running', 'success', 'failed')),
  records_processed int not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'scout_pro', 'club', 'enterprise')),
  ai_reports_limit int not null default 5,
  player_views_limit int not null default 200,
  shortlists_limit int not null default 1,
  watchlist_limit int not null default 10,
  created_at timestamptz not null default now()
);

create table public.scout_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  author_id uuid references public.profiles(id),
  rating int check (rating between 1 and 10),
  note text not null,
  created_at timestamptz not null default now()
);

create table public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  unique(club_id, profile_id)
);

create index idx_players_search on public.players using gin (to_tsvector('simple', display_name));
create index idx_players_position on public.players(position_name);
create index idx_players_hidden_gem on public.players(hidden_gem_score desc);
create index idx_player_stats_player on public.player_stats(player_sportmonks_id);
create index idx_squad_players_team on public.squad_players(team_sportmonks_id);
create index idx_fixtures_starting_at on public.fixtures(starting_at);
create index idx_sync_logs_started_at on public.data_sync_logs(started_at desc);

alter table public.profiles enable row level security;
alter table public.leagues enable row level security;
alter table public.seasons enable row level security;
alter table public.clubs enable row level security;
alter table public.players enable row level security;
alter table public.player_stats enable row level security;
alter table public.squad_players enable row level security;
alter table public.fixtures enable row level security;
alter table public.standings enable row level security;
alter table public.transfers enable row level security;
alter table public.ai_scouting_reports enable row level security;
alter table public.shortlists enable row level security;
alter table public.shortlist_players enable row level security;
alter table public.shortlist_notes enable row level security;
alter table public.watchlist enable row level security;
alter table public.watchlist_events enable row level security;
alter table public.data_sync_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scout_notes enable row level security;
alter table public.club_members enable row level security;

create policy "Authenticated read football reference data" on public.leagues for select to authenticated using (true);
create policy "Authenticated read seasons" on public.seasons for select to authenticated using (true);
create policy "Authenticated read clubs" on public.clubs for select to authenticated using (true);
create policy "Authenticated read players" on public.players for select to authenticated using (true);
create policy "Authenticated read player stats" on public.player_stats for select to authenticated using (true);
create policy "Authenticated read squads" on public.squad_players for select to authenticated using (true);
create policy "Authenticated read fixtures" on public.fixtures for select to authenticated using (true);
create policy "Authenticated read standings" on public.standings for select to authenticated using (true);
create policy "Authenticated read transfers" on public.transfers for select to authenticated using (true);

create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid());

create policy "Users manage own shortlists" on public.shortlists for all to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "Users manage own reports" on public.ai_scouting_reports for all to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "Users manage own watchlist" on public.watchlist for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage own notes" on public.scout_notes for all to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy "Platform admins read sync logs" on public.data_sync_logs
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'platform_admin'));
