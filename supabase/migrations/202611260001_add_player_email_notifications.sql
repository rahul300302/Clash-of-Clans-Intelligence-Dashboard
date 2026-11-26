create table if not exists public.player_notification_settings (
  player_tag text primary key,
  player_name text not null,
  email text,
  war_alerts boolean not null default false,
  capital_alerts boolean not null default false,
  last_war_state text,
  last_capital_season text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_notification_settings_email_required check (
    (war_alerts = false and capital_alerts = false) or email is not null
  )
);

alter table public.player_notification_settings enable row level security;
revoke all on public.player_notification_settings from anon, authenticated;

create table if not exists public.notification_schedule_runs (
  execution_id text primary key,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  checked_count integer not null default 0,
  sent_count integer not null default 0,
  failure_count integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.notification_schedule_runs enable row level security;
revoke all on public.notification_schedule_runs from anon, authenticated;
