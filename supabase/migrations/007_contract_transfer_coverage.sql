alter table public.transfers add column if not exists position_sportmonks_id bigint;
alter table public.transfers add column if not exists detailed_position_sportmonks_id bigint;
alter table public.transfers add column if not exists completed boolean;
alter table public.transfers add column if not exists completed_at date;
alter table public.transfers add column if not exists career_ended boolean;
alter table public.transfers add column if not exists transfer_source text;

create index if not exists idx_players_contract_expires
  on public.players(contract_expires_at);

create index if not exists idx_transfers_player_date
  on public.transfers(player_sportmonks_id, transfer_date desc);

create index if not exists idx_transfers_completed
  on public.transfers(completed, transfer_date desc);
