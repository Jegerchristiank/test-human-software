# Security Contracts

## Scope
- API surface: serverless endpoints under `/api/*`.
- Auth: Supabase Auth bearer tokens for user-bound operations.
- Data: Supabase with Row Level Security (RLS) enforced.

## Attack Surface (Public Endpoints)
- `GET /api/health` (public, optional auth): service health + AI availability.
- `GET /api/config` (public): publishable configuration only.
- `POST /api/demo-quiz` (public): demo quiz payload.
- `POST /api/stripe/webhook` (public webhook): Stripe event ingestion.
- `GET /api/me` (auth): user + profile + subscription summary.
- `POST /api/profile` (auth): update profile fields.
- `GET /api/account/export` (auth): export user data.
- `POST /api/account/delete` (auth): account deletion workflow.
- `GET /api/user-state` (auth): fetch synced user state.
- `POST /api/user-state` (auth): update synced user state.
- `POST /api/grade` (auth + AI access): evaluate free-text answers.
- `POST /api/explain` (auth + AI access): generate explanations.
- `POST /api/hint` (auth + AI access): generate hints.
- `POST /api/vision` (auth + AI access): vision tasks (figure/sketch).
- `POST /api/transcribe` (auth + AI access): audio transcription.
- `POST /api/tts` (auth + AI access): text-to-speech.
- `POST /api/stripe/create-checkout-session` (auth): Stripe checkout session.
- `POST /api/stripe/create-setup-intent` (auth): payment method setup intent.
- `POST /api/stripe/create-portal-session` (auth): Stripe customer portal.
- `POST /api/stripe/create-subscription` (auth): create subscription.
- `GET /api/stripe/billing-overview` (auth): billing status overview.
- `POST /api/stripe/set-default-payment-method` (auth): set default payment method.
- `POST /api/stripe/update-subscription` (auth): cancel at period end toggle.

## Authentication and Authorization
- All user-bound endpoints require a verified Supabase JWT (Authorization: Bearer).
- Server-side authorization is enforced by `user.id` and Supabase service role.
- Stripe webhooks are authenticated via Stripe signature verification.

## Rate Limiting
- Dual-dimension rate limiting (IP + user) on authenticated endpoints.
- Eval endpoints (`/api/grade`, `/api/explain`, `/api/hint`, `/api/vision`,
  `/api/transcribe`, `/api/tts`) are rate limited per user and IP.
- Import/ingest endpoints (`/api/user-state`, `/api/stripe/webhook`,
  media upload endpoints) are rate limited to reduce abuse.

## Input Validation
- All JSON payloads are schema-validated with type checks, length limits,
  and unknown-field rejection by default.
- Bodyless POST endpoints explicitly validate an empty JSON payload.
- Tradeoff: Stripe webhook payloads are provider-defined and include
  extra fields; validation enforces required fields while allowing unknown
  fields to avoid breaking provider compatibility.
- Tradeoff: `user_state` nested JSON blobs allow unknown fields for
  backward compatibility, but are bounded by size/shape constraints.

## Secret Handling
- Secrets are only read from environment variables:
  `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY`.
- `/api/config` only returns publishable keys and a `stripeConfigured`
  boolean; no server secrets are returned to clients.

## Data Protection (Supabase RLS)
- User-owned tables (`profiles`, `subscriptions`, `usage_events`,
  `user_state`, `study_sessions`, `session_attempts`, `attempt_parts`)
  enforce owner-based RLS policies.
- Public content tables (`studies`, `study_items`, `item_choices`,
  `item_parts`, `item_model_answers`, `rubrics`, `rubric_criteria`,
  `item_sources`, `item_assets`, `asset_annotations`, `disease_domains`)
  are read-only for anon/authenticated.
- System tables (`rate_limits`, `ingest_runs`, `audit_events`) deny all
  client access; service role only.

## Audit Logging
- AI usage is logged to `usage_events` with minimal metadata.
- Security-sensitive actions are logged to `audit_events` with:
  event type, actor type, status, optional target ids, and a hashed IP.
- Audit metadata is sanitized to avoid secrets or personal data.

## Webhooks
- Stripe webhooks require signature verification and bounded payload size.
- Event fields required for processing are validated before use.
