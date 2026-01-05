-- Enable required extensions
create extension if not exists "pgcrypto";

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

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

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

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "Subscriptions are viewable by owner"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

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

alter table public.usage_events enable row level security;

create policy "Usage events are viewable by owner"
  on public.usage_events
  for select
  using (auth.uid() = user_id);

-- User state (settings + history sync)
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb,
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

create trigger set_user_state_updated_at
before update on public.user_state
for each row
execute function public.set_updated_at();

alter table public.user_state enable row level security;

create policy "User state is viewable by owner"
  on public.user_state
  for select
  using (auth.uid() = user_id);

create policy "User state is insertable by owner"
  on public.user_state
  for insert
  with check (auth.uid() = user_id);

create policy "User state is updatable by owner"
  on public.user_state
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
