create table if not exists public.recruitment_briefs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'closed')),
  club_id uuid references public.clubs(id) on delete set null,
  club_sportmonks_id bigint,
  target_position text not null,
  role_archetype text not null,
  tactical_style text not null default 'Press',
  min_age int not null default 18,
  max_age int not null default 26,
  contract_preference text not null default 'Any' check (contract_preference in ('Any', 'Expiring', 'Free Agent')),
  risk_tolerance text not null default 'Medium' check (risk_tolerance in ('Low', 'Medium', 'High')),
  budget_band text not null default 'Value' check (budget_band in ('Value', 'Balanced', 'Premium')),
  league_focus text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recruitment_briefs_status on public.recruitment_briefs(status);
create index if not exists idx_recruitment_briefs_club_sportmonks on public.recruitment_briefs(club_sportmonks_id);
create index if not exists idx_recruitment_briefs_position on public.recruitment_briefs(target_position);

alter table public.recruitment_briefs enable row level security;

drop policy if exists "Authenticated read recruitment briefs" on public.recruitment_briefs;
create policy "Authenticated read recruitment briefs" on public.recruitment_briefs for select to authenticated using (true);

drop policy if exists "Authenticated manage recruitment briefs" on public.recruitment_briefs;
create policy "Authenticated manage recruitment briefs" on public.recruitment_briefs for all to authenticated using (true) with check (true);
