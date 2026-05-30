alter table public.shortlist_players
  add column if not exists recruitment_brief_id uuid references public.recruitment_briefs(id) on delete set null,
  add column if not exists recruitment_brief_name text,
  add column if not exists recruitment_role_archetype text;
