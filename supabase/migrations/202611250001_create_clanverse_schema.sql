create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  coc_player_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracked_clans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  clan_tag text not null,
  clan_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, clan_tag)
);
create table if not exists public.tracked_players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_tag text not null,
  player_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, player_tag)
);

create table if not exists public.clan_snapshots (id uuid primary key default gen_random_uuid(), clan_tag text not null, payload jsonb not null, captured_at timestamptz not null default now(), created_at timestamptz not null default now());
create table if not exists public.player_snapshots (id uuid primary key default gen_random_uuid(), player_tag text not null, payload jsonb not null, captured_at timestamptz not null default now(), created_at timestamptz not null default now());
create table if not exists public.clan_members_snapshots (id uuid primary key default gen_random_uuid(), clan_tag text not null, payload jsonb not null, captured_at timestamptz not null default now(), created_at timestamptz not null default now());
create table if not exists public.war_records (id uuid primary key default gen_random_uuid(), clan_tag text not null, war_key text, payload jsonb not null, state text, captured_at timestamptz not null default now(), created_at timestamptz not null default now(), unique(clan_tag, war_key));
create table if not exists public.war_member_records (id uuid primary key default gen_random_uuid(), war_id uuid references public.war_records(id) on delete cascade, player_tag text not null, payload jsonb not null, captured_at timestamptz not null default now(), created_at timestamptz not null default now());
create table if not exists public.cwl_records (id uuid primary key default gen_random_uuid(), clan_tag text not null, season text, payload jsonb not null, captured_at timestamptz not null default now(), created_at timestamptz not null default now(), unique(clan_tag, season));
create table if not exists public.capital_raid_records (id uuid primary key default gen_random_uuid(), clan_tag text not null, season text, payload jsonb not null, captured_at timestamptz not null default now(), created_at timestamptz not null default now(), unique(clan_tag, season));
create table if not exists public.notification_preferences (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, preferences jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id));
create table if not exists public.search_history (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, query text not null, resource_type text not null default 'clan', created_at timestamptz not null default now());
create table if not exists public.user_bookmarks (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, resource_type text not null, resource_tag text not null, resource_name text, created_at timestamptz not null default now(), unique(user_id, resource_type, resource_tag));
create table if not exists public.api_sync_logs (id uuid primary key default gen_random_uuid(), resource_type text not null, resource_tag text, status text not null, message text, started_at timestamptz not null default now(), completed_at timestamptz);

create index if not exists tracked_clans_tag_idx on public.tracked_clans(clan_tag);
create index if not exists tracked_players_tag_idx on public.tracked_players(player_tag);
create index if not exists clan_snapshots_tag_idx on public.clan_snapshots(clan_tag);
create index if not exists player_snapshots_tag_idx on public.player_snapshots(player_tag);
create index if not exists war_records_tag_idx on public.war_records(clan_tag);

alter table public.profiles enable row level security;
alter table public.tracked_clans enable row level security;
alter table public.tracked_players enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.search_history enable row level security;
alter table public.user_bookmarks enable row level security;

create policy profiles_owner on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy tracked_clans_owner on public.tracked_clans for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy tracked_players_owner on public.tracked_players for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy notification_preferences_owner on public.notification_preferences for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy search_history_owner on public.search_history for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy bookmarks_owner on public.user_bookmarks for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id, display_name, avatar_url) values(new.id, coalesce(new.raw_user_meta_data->>'display_name',''), coalesce(new.raw_user_meta_data->>'avatar_url','')); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
