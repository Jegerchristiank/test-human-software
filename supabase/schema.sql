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
  plan text not null default 'free' check (plan in ('free', 'paid', 'trial', 'lifetime')),
  stripe_customer_id text unique,
  own_key_enabled boolean not null default false,
  is_admin boolean not null default false,
  admin_notes text,
  disabled_at timestamptz,
  disabled_reason text,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.profiles
  add column if not exists is_admin boolean not null default false;
alter table if exists public.profiles
  add column if not exists admin_notes text;
alter table if exists public.profiles
  add column if not exists disabled_at timestamptz;
alter table if exists public.profiles
  add column if not exists disabled_reason text;

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

revoke insert, update on public.profiles from authenticated;
grant insert (id, email, full_name, own_key_enabled, terms_accepted_at, privacy_accepted_at)
  on public.profiles to authenticated;
grant update (email, full_name, own_key_enabled, terms_accepted_at, privacy_accepted_at)
  on public.profiles to authenticated;

-- Stored OpenAI keys (encrypted; service role only)
create table if not exists public.user_openai_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  key_ciphertext text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(key_ciphertext) <= 2000)
);

drop trigger if exists set_user_openai_keys_updated_at on public.user_openai_keys;
create trigger set_user_openai_keys_updated_at
before update on public.user_openai_keys
for each row
execute function public.set_updated_at();

alter table if exists public.user_openai_keys enable row level security;

drop policy if exists "User OpenAI keys are not accessible to clients" on public.user_openai_keys;
create policy "User OpenAI keys are not accessible to clients"
  on public.user_openai_keys
  for all
  using (false)
  with check (false);

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

-- Evaluation logs
create table if not exists public.evaluation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  studio text not null,
  policy_id text not null,
  evaluation_type text not null,
  question_key text,
  group_key text,
  input_hash text not null,
  output_hash text not null,
  input_version text,
  output_version text,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table if exists public.evaluation_logs enable row level security;

drop policy if exists "Evaluation logs are viewable by owner" on public.evaluation_logs;

create policy "Evaluation logs are viewable by owner"
  on public.evaluation_logs
  for select
  to authenticated
  using ((SELECT auth.uid()) = user_id);

create index if not exists idx_evaluation_logs_user_id on public.evaluation_logs (user_id);
create index if not exists idx_evaluation_logs_policy_id on public.evaluation_logs (policy_id);

-- Audit events (security logging)
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  actor_type text not null,
  event_type text not null,
  status text not null,
  target_type text,
  target_id text,
  ip_hash text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  check (char_length(actor_type) <= 32),
  check (char_length(event_type) <= 128),
  check (char_length(status) <= 32),
  check (target_type is null or char_length(target_type) <= 64),
  check (target_id is null or char_length(target_id) <= 200),
  check (status in ('success', 'failure', 'denied', 'requested')),
  check (actor_type in ('user', 'system', 'webhook'))
);

alter table if exists public.audit_events enable row level security;

drop policy if exists "Audit events are not accessible to clients" on public.audit_events;
create policy "Audit events are not accessible to clients"
  on public.audit_events
  for all
  using (false)
  with check (false);

create index if not exists idx_audit_events_user_id on public.audit_events (user_id);
create index if not exists idx_audit_events_event_type on public.audit_events (event_type);

-- Stripe webhook events (idempotency tracking)
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  livemode boolean,
  status text not null default 'received',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  check (char_length(event_id) <= 200),
  check (char_length(event_type) <= 200),
  check (status in ('received', 'processed', 'failed'))
);

alter table if exists public.stripe_webhook_events enable row level security;

drop policy if exists "Stripe webhook events are not accessible to clients" on public.stripe_webhook_events;
create policy "Stripe webhook events are not accessible to clients"
  on public.stripe_webhook_events
  for all
  using (false)
  with check (false);

-- User state (settings + history sync)
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb,
  active_session jsonb,
  show_meta boolean not null default true,
  history jsonb,
  seen jsonb,
  mistakes jsonb,
  performance jsonb,
  figure_captions jsonb,
  best_score numeric,
  best_scores jsonb,
  theme text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.user_state
  add column if not exists active_session jsonb;

alter table if exists public.user_state
  add column if not exists show_meta boolean not null default true;

alter table if exists public.user_state
  add column if not exists best_scores jsonb;

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

-- Dataset snapshots (admin-managed question data)
create table if not exists public.dataset_snapshots (
  dataset text primary key,
  payload jsonb not null,
  raw_text text,
  item_count integer,
  imported_by uuid references auth.users(id) on delete set null,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (dataset in ('mcq', 'kortsvar', 'sygdomslaere'))
);

drop trigger if exists set_dataset_snapshots_updated_at on public.dataset_snapshots;
create trigger set_dataset_snapshots_updated_at
before update on public.dataset_snapshots
for each row
execute function public.set_updated_at();

alter table if exists public.dataset_snapshots enable row level security;

drop policy if exists "Dataset snapshots are not accessible to clients" on public.dataset_snapshots;
create policy "Dataset snapshots are not accessible to clients"
  on public.dataset_snapshots
  for all
  using (false)
  with check (false);

-- Dataset versions (draft/published history for admin imports)
create table if not exists public.dataset_versions (
  id uuid primary key default gen_random_uuid(),
  dataset text not null,
  status text not null default 'draft',
  source text not null default 'manual',
  base_version_id uuid references public.dataset_versions(id) on delete set null,
  item_count integer not null default 0,
  raw_text text,
  qa_summary jsonb,
  created_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (dataset in ('mcq', 'kortsvar', 'sygdomslaere')),
  check (status in ('draft', 'published', 'archived'))
);

create index if not exists idx_dataset_versions_dataset on public.dataset_versions (dataset);
create index if not exists idx_dataset_versions_status on public.dataset_versions (status);
create index if not exists idx_dataset_versions_dataset_status
  on public.dataset_versions (dataset, status);

drop trigger if exists set_dataset_versions_updated_at on public.dataset_versions;
create trigger set_dataset_versions_updated_at
before update on public.dataset_versions
for each row
execute function public.set_updated_at();

alter table if exists public.dataset_versions enable row level security;

drop policy if exists "Dataset versions are not accessible to clients" on public.dataset_versions;
create policy "Dataset versions are not accessible to clients"
  on public.dataset_versions
  for all
  using (false)
  with check (false);

-- Dataset items (normalized rows for admin editing/search)
create table if not exists public.dataset_items (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.dataset_versions(id) on delete cascade,
  dataset text not null,
  item_type text not null,
  item_key text not null,
  year integer,
  session text,
  number integer,
  opgave integer,
  label text,
  category text,
  priority text,
  weight text,
  title text,
  search_text text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (dataset in ('mcq', 'kortsvar', 'sygdomslaere')),
  check (char_length(item_key) <= 200)
);

create unique index if not exists idx_dataset_items_version_key
  on public.dataset_items (version_id, item_key);
create index if not exists idx_dataset_items_version_id on public.dataset_items (version_id);
create index if not exists idx_dataset_items_dataset on public.dataset_items (dataset);
create index if not exists idx_dataset_items_category on public.dataset_items (category);
create index if not exists idx_dataset_items_year on public.dataset_items (year);
create index if not exists idx_dataset_items_priority on public.dataset_items (priority);

drop trigger if exists set_dataset_items_updated_at on public.dataset_items;
create trigger set_dataset_items_updated_at
before update on public.dataset_items
for each row
execute function public.set_updated_at();

alter table if exists public.dataset_items enable row level security;

drop policy if exists "Dataset items are not accessible to clients" on public.dataset_items;
create policy "Dataset items are not accessible to clients"
  on public.dataset_items
  for all
  using (false)
  with check (false);

-- Dataset version events (audit/rollback history)
create table if not exists public.dataset_version_events (
  id uuid primary key default gen_random_uuid(),
  dataset text not null,
  version_id uuid references public.dataset_versions(id) on delete set null,
  action text not null,
  actor uuid references auth.users(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  check (dataset in ('mcq', 'kortsvar', 'sygdomslaere')),
  check (char_length(action) <= 40)
);

create index if not exists idx_dataset_events_dataset on public.dataset_version_events (dataset);
create index if not exists idx_dataset_events_version on public.dataset_version_events (version_id);

alter table if exists public.dataset_version_events enable row level security;

drop policy if exists "Dataset version events are not accessible to clients" on public.dataset_version_events;
create policy "Dataset version events are not accessible to clients"
  on public.dataset_version_events
  for all
  using (false)
  with check (false);

alter table if exists public.dataset_snapshots
  add column if not exists published_version_id uuid references public.dataset_versions(id) on delete set null;

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

-- Studio data pipeline types
do $$
begin
  if not exists (select 1 from pg_type where typname = 'study_item_type') then
    create type public.study_item_type as enum ('mcq', 'short', 'disease');
  end if;
  if not exists (select 1 from pg_type where typname = 'item_part_type') then
    create type public.item_part_type as enum ('short_part', 'disease_domain');
  end if;
  if not exists (select 1 from pg_type where typname = 'study_session_status') then
    create type public.study_session_status as enum ('active', 'completed', 'abandoned');
  end if;
  if not exists (select 1 from pg_type where typname = 'attempt_status') then
    create type public.attempt_status as enum ('unanswered', 'answered', 'skipped');
  end if;
  if not exists (select 1 from pg_type where typname = 'source_type') then
    create type public.source_type as enum ('human', 'llm', 'legacy');
  end if;
  if not exists (select 1 from pg_type where typname = 'asset_type') then
    create type public.asset_type as enum ('image');
  end if;
end $$;

-- Studies
create table if not exists public.studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(slug) <= 64)
);

drop trigger if exists set_studies_updated_at on public.studies;
create trigger set_studies_updated_at
before update on public.studies
for each row
execute function public.set_updated_at();

alter table if exists public.studies enable row level security;

drop policy if exists "Studies are readable" on public.studies;
create policy "Studies are readable"
  on public.studies
  for select
  to anon, authenticated
  using (true);

insert into public.studies (slug, title, description)
values
  ('human', 'Human Biologi', 'MCQ og kortsvar for humanbiologi.'),
  ('sygdomslaere', 'Sygdomslaere', 'Sygdomsdomainer og sektioner for sygdomslaere.')
on conflict (slug) do nothing;

-- Ingest runs
create table if not exists public.ingest_runs (
  id uuid primary key,
  source_system text not null,
  source_version text not null,
  source_hash text not null,
  pipeline_version text not null,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  check (char_length(source_system) <= 64),
  check (char_length(source_version) <= 64),
  check (char_length(pipeline_version) <= 64)
);

create unique index if not exists idx_ingest_runs_source on public.ingest_runs
  (source_system, source_hash, pipeline_version);

alter table if exists public.ingest_runs enable row level security;

drop policy if exists "Ingest runs are not accessible to clients" on public.ingest_runs;
create policy "Ingest runs are not accessible to clients"
  on public.ingest_runs
  for all
  using (false)
  with check (false);

-- Item bank
create table if not exists public.study_items (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  item_type public.study_item_type not null,
  source_system text not null,
  source_key text not null unique,
  source_version text not null,
  source_hash text,
  content_hash text not null,
  ingest_run_id uuid references public.ingest_runs(id),
  year integer,
  session text,
  category text,
  title text,
  stem text not null,
  priority text,
  weight text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(source_key) <= 200),
  check (year is null or year >= 1900),
  check (
    (item_type = 'disease' and year is null) or
    (item_type <> 'disease' and year is not null)
  ),
  check (
    item_type <> 'disease' or
    priority in ('high', 'medium', 'low', 'excluded')
  ),
  check (
    (item_type = 'disease' and priority is not null) or
    (item_type <> 'disease' and priority is null)
  )
);

create index if not exists idx_study_items_study_id on public.study_items (study_id);
create index if not exists idx_study_items_item_type on public.study_items (item_type);
create index if not exists idx_study_items_category on public.study_items (category);

drop trigger if exists set_study_items_updated_at on public.study_items;
create trigger set_study_items_updated_at
before update on public.study_items
for each row
execute function public.set_updated_at();

alter table if exists public.study_items enable row level security;

drop policy if exists "Study items are readable" on public.study_items;
create policy "Study items are readable"
  on public.study_items
  for select
  to anon, authenticated
  using (true);

-- MCQ choices
create table if not exists public.item_choices (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.study_items(id) on delete cascade,
  label text not null,
  choice_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0,
  source_key text not null unique,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(label) <= 4),
  check (sort_order >= 0)
);

create index if not exists idx_item_choices_item_id on public.item_choices (item_id);

drop trigger if exists set_item_choices_updated_at on public.item_choices;
create trigger set_item_choices_updated_at
before update on public.item_choices
for each row
execute function public.set_updated_at();

alter table if exists public.item_choices enable row level security;

drop policy if exists "Item choices are readable" on public.item_choices;
create policy "Item choices are readable"
  on public.item_choices
  for select
  to anon, authenticated
  using (true);

-- Disease domains
create table if not exists public.disease_domains (
  id uuid primary key default gen_random_uuid(),
  domain_key text not null unique,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(domain_key) <= 64)
);

drop trigger if exists set_disease_domains_updated_at on public.disease_domains;
create trigger set_disease_domains_updated_at
before update on public.disease_domains
for each row
execute function public.set_updated_at();

alter table if exists public.disease_domains enable row level security;

drop policy if exists "Disease domains are readable" on public.disease_domains;
create policy "Disease domains are readable"
  on public.disease_domains
  for select
  to anon, authenticated
  using (true);

insert into public.disease_domains (domain_key, title, sort_order)
values
  ('key_points', 'Key points', 1),
  ('definition', 'Definition', 2),
  ('occurrence', 'Occurrence', 3),
  ('pathogenesis', 'Pathogenesis', 4),
  ('etiology', 'Etiology', 5),
  ('symptoms_findings', 'Symptoms and findings', 6),
  ('diagnostics', 'Diagnostics', 7),
  ('complications', 'Complications', 8),
  ('treatment', 'Treatment', 9),
  ('prevention', 'Prevention', 10),
  ('prognosis', 'Prognosis', 11)
on conflict (domain_key) do nothing;

-- Short/disease parts
create table if not exists public.item_parts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.study_items(id) on delete cascade,
  part_type public.item_part_type not null,
  label text,
  domain_id uuid references public.disease_domains(id),
  prompt text not null,
  sort_order integer not null default 0,
  source_key text not null unique,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sort_order >= 0),
  check (
    (part_type = 'disease_domain' and domain_id is not null) or
    (part_type = 'short_part' and domain_id is null)
  )
);

create index if not exists idx_item_parts_item_id on public.item_parts (item_id);
create index if not exists idx_item_parts_domain_id on public.item_parts (domain_id);

drop trigger if exists set_item_parts_updated_at on public.item_parts;
create trigger set_item_parts_updated_at
before update on public.item_parts
for each row
execute function public.set_updated_at();

alter table if exists public.item_parts enable row level security;

drop policy if exists "Item parts are readable" on public.item_parts;
create policy "Item parts are readable"
  on public.item_parts
  for select
  to anon, authenticated
  using (true);

-- Model answers
create table if not exists public.item_model_answers (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.study_items(id) on delete cascade,
  part_id uuid references public.item_parts(id) on delete cascade,
  answer_text text not null,
  version text not null,
  source_key text not null unique,
  source_type public.source_type not null default 'human',
  source_system text,
  source_version text,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (part_id is not null or item_id is not null),
  check (char_length(version) <= 64),
  check (source_type <> 'llm' or (source_system is not null and source_version is not null))
);

create index if not exists idx_item_model_answers_item_id on public.item_model_answers (item_id);
create index if not exists idx_item_model_answers_part_id on public.item_model_answers (part_id);

drop trigger if exists set_item_model_answers_updated_at on public.item_model_answers;
create trigger set_item_model_answers_updated_at
before update on public.item_model_answers
for each row
execute function public.set_updated_at();

alter table if exists public.item_model_answers enable row level security;

drop policy if exists "Item model answers are readable" on public.item_model_answers;
create policy "Item model answers are readable"
  on public.item_model_answers
  for select
  to anon, authenticated
  using (true);

-- Rubrics
create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.study_items(id) on delete cascade,
  part_id uuid references public.item_parts(id) on delete cascade,
  rubric_text text,
  max_points numeric,
  version text not null,
  source_key text not null unique,
  source_type public.source_type not null default 'human',
  source_system text,
  source_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (part_id is not null or item_id is not null),
  check (char_length(version) <= 64)
);

create index if not exists idx_rubrics_item_id on public.rubrics (item_id);
create index if not exists idx_rubrics_part_id on public.rubrics (part_id);

drop trigger if exists set_rubrics_updated_at on public.rubrics;
create trigger set_rubrics_updated_at
before update on public.rubrics
for each row
execute function public.set_updated_at();

alter table if exists public.rubrics enable row level security;

drop policy if exists "Rubrics are readable" on public.rubrics;
create policy "Rubrics are readable"
  on public.rubrics
  for select
  to anon, authenticated
  using (true);

create table if not exists public.rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references public.rubrics(id) on delete cascade,
  criterion_key text not null,
  description text,
  max_points numeric not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rubric_id, criterion_key),
  check (sort_order >= 0)
);

create index if not exists idx_rubric_criteria_rubric_id on public.rubric_criteria (rubric_id);

drop trigger if exists set_rubric_criteria_updated_at on public.rubric_criteria;
create trigger set_rubric_criteria_updated_at
before update on public.rubric_criteria
for each row
execute function public.set_updated_at();

alter table if exists public.rubric_criteria enable row level security;

drop policy if exists "Rubric criteria are readable" on public.rubric_criteria;
create policy "Rubric criteria are readable"
  on public.rubric_criteria
  for select
  to anon, authenticated
  using (true);

-- Sources and assets
create table if not exists public.item_sources (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.study_items(id) on delete cascade,
  part_id uuid references public.item_parts(id) on delete cascade,
  source_text text not null,
  source_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (item_id is not null or part_id is not null)
);

create index if not exists idx_item_sources_item_id on public.item_sources (item_id);
create index if not exists idx_item_sources_part_id on public.item_sources (part_id);

drop trigger if exists set_item_sources_updated_at on public.item_sources;
create trigger set_item_sources_updated_at
before update on public.item_sources
for each row
execute function public.set_updated_at();

alter table if exists public.item_sources enable row level security;

drop policy if exists "Item sources are readable" on public.item_sources;
create policy "Item sources are readable"
  on public.item_sources
  for select
  to anon, authenticated
  using (true);

create table if not exists public.item_assets (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.study_items(id) on delete cascade,
  part_id uuid references public.item_parts(id) on delete cascade,
  asset_type public.asset_type not null,
  asset_path text not null,
  source_key text not null unique,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_item_assets_item_id on public.item_assets (item_id);
create index if not exists idx_item_assets_part_id on public.item_assets (part_id);

drop trigger if exists set_item_assets_updated_at on public.item_assets;
create trigger set_item_assets_updated_at
before update on public.item_assets
for each row
execute function public.set_updated_at();

alter table if exists public.item_assets enable row level security;

drop policy if exists "Item assets are readable" on public.item_assets;
create policy "Item assets are readable"
  on public.item_assets
  for select
  to anon, authenticated
  using (true);

create table if not exists public.asset_annotations (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.item_assets(id) on delete cascade,
  annotation_type text not null check (annotation_type in ('caption', 'audit')),
  text text,
  match boolean,
  confidence numeric,
  issues text,
  source_type public.source_type not null default 'human',
  llm_model text,
  llm_prompt_version text,
  llm_output_version text not null,
  source_key text not null unique,
  source_system text,
  source_version text,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (confidence is null or (confidence >= 0 and confidence <= 1)),
  check (
    source_type <> 'llm' or (llm_model is not null and llm_prompt_version is not null)
  )
);

create index if not exists idx_asset_annotations_asset_id on public.asset_annotations (asset_id);

drop trigger if exists set_asset_annotations_updated_at on public.asset_annotations;
create trigger set_asset_annotations_updated_at
before update on public.asset_annotations
for each row
execute function public.set_updated_at();

alter table if exists public.asset_annotations enable row level security;

drop policy if exists "Asset annotations are readable" on public.asset_annotations;
create policy "Asset annotations are readable"
  on public.asset_annotations
  for select
  to anon, authenticated
  using (true);

-- Sessions and attempts
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_id uuid not null references public.studies(id) on delete cascade,
  status public.study_session_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  item_count_target integer,
  include_mcq boolean,
  include_short boolean,
  ratio_mcq integer,
  ratio_short integer,
  shuffle_questions boolean,
  shuffle_options boolean,
  auto_advance boolean,
  auto_advance_delay_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (item_count_target is null or item_count_target > 0)
);

create index if not exists idx_study_sessions_user_id on public.study_sessions (user_id);
create index if not exists idx_study_sessions_study_id on public.study_sessions (study_id);

drop trigger if exists set_study_sessions_updated_at on public.study_sessions;
create trigger set_study_sessions_updated_at
before update on public.study_sessions
for each row
execute function public.set_updated_at();

alter table if exists public.study_sessions enable row level security;

drop policy if exists "Study sessions are viewable by owner" on public.study_sessions;
drop policy if exists "Study sessions are insertable by owner" on public.study_sessions;
drop policy if exists "Study sessions are updatable by owner" on public.study_sessions;

create policy "Study sessions are viewable by owner"
  on public.study_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Study sessions are insertable by owner"
  on public.study_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Study sessions are updatable by owner"
  on public.study_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.session_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  item_id uuid not null references public.study_items(id) on delete cascade,
  status public.attempt_status not null default 'unanswered',
  position integer not null,
  started_at timestamptz,
  completed_at timestamptz,
  score numeric,
  max_score numeric,
  mcq_choice_label text,
  is_correct boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, position),
  check (position > 0)
);

create index if not exists idx_session_attempts_session_id on public.session_attempts (session_id);
create index if not exists idx_session_attempts_item_id on public.session_attempts (item_id);

drop trigger if exists set_session_attempts_updated_at on public.session_attempts;
create trigger set_session_attempts_updated_at
before update on public.session_attempts
for each row
execute function public.set_updated_at();

alter table if exists public.session_attempts enable row level security;

drop policy if exists "Session attempts are viewable by owner" on public.session_attempts;
drop policy if exists "Session attempts are insertable by owner" on public.session_attempts;
drop policy if exists "Session attempts are updatable by owner" on public.session_attempts;

create policy "Session attempts are viewable by owner"
  on public.session_attempts
  for select
  to authenticated
  using (
    exists (
      select 1 from public.study_sessions
      where public.study_sessions.id = session_id
        and public.study_sessions.user_id = (select auth.uid())
    )
  );

create policy "Session attempts are insertable by owner"
  on public.session_attempts
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.study_sessions
      where public.study_sessions.id = session_id
        and public.study_sessions.user_id = (select auth.uid())
    )
  );

create policy "Session attempts are updatable by owner"
  on public.session_attempts
  for update
  to authenticated
  using (
    exists (
      select 1 from public.study_sessions
      where public.study_sessions.id = session_id
        and public.study_sessions.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.study_sessions
      where public.study_sessions.id = session_id
        and public.study_sessions.user_id = (select auth.uid())
    )
  );

create table if not exists public.attempt_parts (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.session_attempts(id) on delete cascade,
  part_id uuid not null references public.item_parts(id) on delete cascade,
  answer_text text,
  awarded_points numeric,
  max_points numeric,
  is_correct boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attempt_id, part_id)
);

create index if not exists idx_attempt_parts_attempt_id on public.attempt_parts (attempt_id);
create index if not exists idx_attempt_parts_part_id on public.attempt_parts (part_id);

drop trigger if exists set_attempt_parts_updated_at on public.attempt_parts;
create trigger set_attempt_parts_updated_at
before update on public.attempt_parts
for each row
execute function public.set_updated_at();

alter table if exists public.attempt_parts enable row level security;

drop policy if exists "Attempt parts are viewable by owner" on public.attempt_parts;
drop policy if exists "Attempt parts are insertable by owner" on public.attempt_parts;
drop policy if exists "Attempt parts are updatable by owner" on public.attempt_parts;

create policy "Attempt parts are viewable by owner"
  on public.attempt_parts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.session_attempts
      join public.study_sessions on public.study_sessions.id = public.session_attempts.session_id
      where public.session_attempts.id = attempt_id
        and public.study_sessions.user_id = (select auth.uid())
    )
  );

create policy "Attempt parts are insertable by owner"
  on public.attempt_parts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.session_attempts
      join public.study_sessions on public.study_sessions.id = public.session_attempts.session_id
      where public.session_attempts.id = attempt_id
        and public.study_sessions.user_id = (select auth.uid())
    )
  );

create policy "Attempt parts are updatable by owner"
  on public.attempt_parts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.session_attempts
      join public.study_sessions on public.study_sessions.id = public.session_attempts.session_id
      where public.session_attempts.id = attempt_id
        and public.study_sessions.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.session_attempts
      join public.study_sessions on public.study_sessions.id = public.session_attempts.session_id
      where public.session_attempts.id = attempt_id
        and public.study_sessions.user_id = (select auth.uid())
    )
  );

-- BEGIN STUDIO_PIPELINE_DATA
-- Data inserts moved to supabase/studio_pipeline.sql.
-- Regenerate via: python3 scripts/build_studio_pipeline.py
-- END STUDIO_PIPELINE_DATA
