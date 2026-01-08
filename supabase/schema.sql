-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_stat_statements";

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'paid', 'trial')),
  stripe_customer_id text unique,
  own_key_enabled boolean not null default false,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table if exists public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Profiles are insertable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;
drop policy if exists "Profiles are deletable by owner" on public.profiles;

create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  to authenticated
  using ((SELECT auth.uid()) = id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  to authenticated
  with check ((SELECT auth.uid()) = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  to authenticated
  using ((SELECT auth.uid()) = id)
  with check ((SELECT auth.uid()) = id);

create policy "Profiles are deletable by owner"
  on public.profiles
  for delete
  to authenticated
  using ((SELECT auth.uid()) = id);

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

alter table if exists public.subscriptions enable row level security;

drop policy if exists "Subscriptions are viewable by owner" on public.subscriptions;

create policy "Subscriptions are viewable by owner"
  on public.subscriptions
  for select
  to authenticated
  using ((SELECT auth.uid()) = user_id);

create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);
create index if not exists idx_subscriptions_stripe_customer_id on public.subscriptions (stripe_customer_id);

-- Usage events
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  model text,
  mode text,
  prompt_chars integer,
  created_at timestamptz not null default now()
);

alter table if exists public.usage_events enable row level security;

drop policy if exists "Usage events are viewable by owner" on public.usage_events;

create policy "Usage events are viewable by owner"
  on public.usage_events
  for select
  to authenticated
  using ((SELECT auth.uid()) = user_id);

create index if not exists idx_usage_events_user_id on public.usage_events (user_id);

-- User state (settings + history sync)
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb,
  show_meta boolean not null default true,
  history jsonb,
  seen jsonb,
  mistakes jsonb,
  performance jsonb,
  figure_captions jsonb,
  best_score numeric,
  theme text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_user_state_updated_at on public.user_state;
create trigger set_user_state_updated_at
before update on public.user_state
for each row
execute function public.set_updated_at();

alter table if exists public.user_state enable row level security;

drop policy if exists "User state is viewable by owner" on public.user_state;
drop policy if exists "User state is insertable by owner" on public.user_state;
drop policy if exists "User state is updatable by owner" on public.user_state;

create policy "User state is viewable by owner"
  on public.user_state
  for select
  to authenticated
  using ((SELECT auth.uid()) = user_id);

create policy "User state is insertable by owner"
  on public.user_state
  for insert
  to authenticated
  with check ((SELECT auth.uid()) = user_id);

create policy "User state is updatable by owner"
  on public.user_state
  for update
  to authenticated
  using ((SELECT auth.uid()) = user_id)
  with check ((SELECT auth.uid()) = user_id);

-- Rate limits
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_rate_limits_updated_at on public.rate_limits;
create trigger set_rate_limits_updated_at
before update on public.rate_limits
for each row
execute function public.set_updated_at();

alter table if exists public.rate_limits enable row level security;

drop policy if exists "Rate limits are not accessible to clients" on public.rate_limits;

create policy "Rate limits are not accessible to clients"
  on public.rate_limits
  for all
  using (false)
  with check (false);

create or replace function public.check_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path TO pg_catalog, public, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_cutoff timestamptz := v_now - make_interval(secs => p_window_seconds);
  v_count integer;
begin
  insert into public.rate_limits(key, count, window_start)
  values (p_key, 1, v_now)
  on conflict (key) do update
  set
    count = case
      when public.rate_limits.window_start < v_cutoff then 1
      else public.rate_limits.count + 1
    end,
    window_start = case
      when public.rate_limits.window_start < v_cutoff then v_now
      else public.rate_limits.window_start
    end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
