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
