# Activity Log

## 2025-02-14
- Purpose: align API security/validation with agent rules and add stable UI selectors (data-testid) while keeping Supabase auth.
- Files: api/_lib/response.js, api/_lib/rateLimit.js, api/config.js, api/health.js, api/me.js, api/grade.js, api/explain.js, api/hint.js, api/tts.js, api/transcribe.js, api/vision.js, api/demo-quiz.js, api/profile.js, api/account/delete.js, api/stripe/set-default-payment-method.js, api/stripe/update-subscription.js, api/stripe/webhook.js, index.html, sygdomslaere.html, consent.html, docs/activity.md.
- Commands: rg -n "id=\"" *.html; rg -n "readJson" api; python3 - <<'PY' ...; npm test.
- Security: added CSP + security headers to API responses, enforced dual-dimension rate limiting, and added schema validation with unknown-field rejection.
- Follow-ups: consider adding an explicit CORS allowlist if cross-origin API calls are needed.

## 2026-01-10
- Purpose: bundle ClerkJS initialization through esbuild so the publishable key flows from `VITE_CLERK_PUBLISHABLE_KEY` into `clerk-init.js`.
- Files: src/clerk-init.js, scripts/build-clerk.mjs, package.json, README.md, index.html, clerk-init.js, docs/activity.md.
- Commands: `npm run build:clerk`.
- Security: the public key is injected at build time and stored only in the generated asset; runtime code logs errors instead of crashing when the key is absent.
- Follow-ups: rerun `npm run build:clerk` whenever the Clerk publishable key changes (CI/deploy pipelines should run the script as well).
## 2026-01-10
- Purpose: mount Clerk SignIn/UserButton components inside the auth panel so Clerk login is visible alongside the existing UI.
- Files: src/clerk-init.js, clerk-init.js, index.html, styles.css, package.json, package-lock.json, docs/activity.md.
- Commands: `npm install @clerk/clerk-js`, `npm run build:clerk`.
- Security: the new component toggles on Clerk session events, keeps the publishable key on the server side, logs missing credentials, and does not leak secrets to the UI.
- Follow-ups: ensure CI runs `npm run build:clerk` and consider routing consent/auth screens through Clerk when the component is active.
## 2026-01-10
- Formål: Verificere klikflow for auto-session, filterændringer, session-slut og “Mere” panels i Sygdomslære Studio.
- Berørte filer: sygdomslaere.html, sygdomslaere.js, docs/activity.md
- Kommandoer: sed -n '1,260p' sygdomslaere.html; sed -n '260,520p' sygdomslaere.html; rg -n "startSession\(|refreshSessionFromFilters|sessionComplete|newSessionBtn" sygdomslaere.js; date +%Y-%m-%d
- Sikkerhedsimplikationer: Ingen; kun gennemgang af UI-flow.
- Opfølgning: Test i browser via lokal server (se instruktioner).

## 2026-01-10
- Purpose: remove redundant root activity log so docs/activity.md is the single source of record.
- Files: activity.md, docs/activity.md.
- Commands: date +%F.
- Security: none.
- Follow-ups: none.

## 2026-01-10
- Purpose: add stable data-testid hooks to legal/static pages for automation.
- Files: handelsbetingelser.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, docs/activity.md.
- Commands: date +%F.
- Security: none.
- Follow-ups: none.

## 2026-01-10
- Purpose: switch frontend auth UX to Clerk, add Clerk-backed request verification, and move user_state sync to authenticated API endpoints.
- Files: api/_lib/clerk.js, api/_lib/auth.js, api/user-state.js, app.js, consent.js, sygdomslaere.js, index.html, consent.html, sygdomslaere.html, src/clerk-init.js, clerk-init.js, tests/apiValidation.test.mjs, package.json, package-lock.json, README.md, docs/activity.md.
- Commands: `npm install @clerk/backend`, `npm run build:clerk`, `npm test`.
- Security: Clerk session tokens are now verified server-side; user_state updates are validated, rate-limited, and scoped to the authenticated user.
- Follow-ups: ensure `CLERK_SECRET_KEY` is set in runtime env and run `npm run build:clerk` in CI/deploy.

## 2026-01-10
- Purpose: add per-section data-testid hooks to legal cards for automation.
- Files: handelsbetingelser.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, docs/activity.md.
- Commands: date +%F.
- Security: none.
- Follow-ups: none.

## 2026-01-10
- Purpose: extend data-testid coverage to all HTML pages (page-level wrappers and static link groups).
- Files: index.html, consent.html, sygdomslaere.html, docs/activity.md.
- Commands: date +%F.
- Security: none.
- Follow-ups: none.
## 2026-01-10
- Formål: Ombygge Sygdomslære Studio layout til Human Biologi Studio-look med blødt rødt tema.
- Berørte filer: sygdomslaere.html, sygdomslaere.css, docs/activity.md
- Kommandoer: sed -n '1,200p' docs/activity.md; sed -n '1,220p' index.html; rg -n "builder|workspace|session|kortsvar|studie|oversigt|overblik|Træning|Spørgsmål" index.html; sed -n '440,680p' index.html; sed -n '1,200p' styles.css; rg -n "menu-shell|menu-header|menu-grid|panel builder|builder-section|preset" styles.css; sed -n '1120,1400p' styles.css; rg -n "more-drawer|settings-drawer|details" styles.css; sed -n '1500,1615p' styles.css; rg -n "\\.btn" -n styles.css | head; sed -n '1950,2025p' styles.css; rg -n "summary-card" index.html; sed -n '780,860p' index.html; rg -n "\\.chip|\\.priority-pill|\\.toggle" styles.css | head -n 40; sed -n '1800,1885p' styles.css; rg -n "progress-bar" styles.css; sed -n '2120,2165p' styles.css; rg -n "\\.tabs|\\.tab" styles.css | head -n 40; rg -n "\\.footer" styles.css; rg -n "\\.pill" styles.css | head -n 40; sed -n '3230,3265p' styles.css; rg -n "\\.field" styles.css | head -n 40; sed -n '4800,4875p' styles.css; rg -n "type=\\\"range\\\"|range-control" styles.css; sed -n '1420,1475p' styles.css; rg -n "textarea" styles.css; sed -n '320,420p' styles.css; sed -n '3920,3985p' styles.css; cat <<'EOF' > sygdomslaere.html; rg -n "id=\\\"(stat-diseases|stat-sections|stat-categories|search-input|category-chips|priority-chips|weight-chips|section-chips|toggle-include-excluded|deck-size|toggle-priority-weight|toggle-focus-weak|toggle-shuffle|reset-filters-btn|pool-count|disease-count|reveal-btn|skip-btn|new-session-btn|card-answer|rating-row|overview-list|expand-all-btn|reset-progress-btn)\\\"" sygdomslaere.html; cat <<'EOF' > sygdomslaere.css; date +%Y-%m-%d
- Sikkerhedsimplikationer: Kun UI/layout og styling; ingen ændring i dataadgang eller endpoints.
- Opfølgning: Visuel verifikation i browser samt tjek af session/filtre/overblik efter layoutændring.
## 2026-01-10
- Formål: Løfte Sygdomslære-shell over baggrundslag for stabil visuel layering.
- Berørte filer: sygdomslaere.css, docs/activity.md
- Kommandoer: apply_patch (sygdomslaere.css); date +%Y-%m-%d
- Sikkerhedsimplikationer: Ingen.
- Opfølgning: Ingen.
## 2026-01-10
- Formål: Gøre studioskift hurtigere ved at tidsbegrænse sync før navigation.
- Berørte filer: app.js, sygdomslaere.js, docs/activity.md
- Kommandoer: apply_patch (app.js); apply_patch (sygdomslaere.js); date +%Y-%m-%d
- Sikkerhedsimplikationer: Begrænset ventetid kan udsætte server-synk af brugerdata; lokal state bevares og næste sync forsøges senere.
- Opfølgning: Verificér at studioskift føles direkte, og at seneste user state stadig synkroniseres ved fortsat brug.

## 2026-01-10
- Purpose: add finer-grained data-testid hooks across all screens in index.html plus consent and sygdomslaere panels; run automation checks.
- Files: index.html, consent.html, sygdomslaere.html, docs/activity.md.
- Commands: rg --files -g "*.html"; rg -n "<section" index.html; sed -n '120,220p' index.html; sed -n '220,340p' index.html; sed -n '380,460p' index.html; sed -n '430,520p' index.html; sed -n '980,1080p' index.html; sed -n '1168,1255p' index.html; sed -n '1280,1405p' index.html; sed -n '1405,1505p' index.html; sed -n '1505,1635p' index.html; npm test; python3 - <<'PY' ...
- Security: none.
- Follow-ups: none.

## 2026-01-10
- Formål: Integrere Sygdomslære som kursus-tab i hovedappen uden reload, mappe sygdomsdata ind i kortsvar-flowet og tilpasse UI/tema til blødt rødt udtryk.
- Berørte filer: app.js, index.html, styles.css, sygdomslaere.html, docs/activity.md.
- Kommandoer: sed -n '430,760p' index.html; sed -n '14140,14380p' app.js; rg -n "studio-|sygdom|human" index.html; rg -n "navigateToStudio|course|sygdom" app.js; python3 - <<'PY' ...; apply_patch (app.js, index.html, styles.css, sygdomslaere.html); date +%F.
- Sikkerhedsimplikationer: Ingen nye endpoints eller credential-ændringer; kun client-side UI og routing-tilpasning.
- Opfølgning: Verificér i browser at studioskift sker uden fuld reload, at sygdomsflowet kun viser kortsvar/sektioner, og at rødt tema aktiveres.

## 2026-01-11
- Purpose: prevent repeated Clerk sign-in mounts to reduce rate-limit errors and rebuild the Clerk bundle.
- Files: src/clerk-init.js, clerk-init.js, docs/activity.md.
- Commands: `date +%F`, `npm run build:clerk`.
- Security: reduces repeated authentication attempts; no secrets added or logged.
- Follow-ups: verify login flow in browser; if 429 persists, review Clerk dashboard sign-in/passkey settings and rate limits.

## 2026-01-11
- Purpose: allow Clerk image assets and Cloudflare Turnstile to load by widening CSP for the login flow.
- Files: vercel.json, docs/activity.md.
- Commands: `date +%F`.
- Security: CSP remains restrictive but now permits Clerk image hosts and Turnstile scripts/frames required for auth.
- Follow-ups: verify login icons load and sign-up captcha completes; re-capture HAR if failures persist.

## 2026-01-11
- Purpose: map Humanbiologi vs Sygdomslære studio surfaces and define an explicit Studio Engine contract spec to prevent MCQ/drawing/50-50 scoring leakage.
- Files: docs/activity.md.
- Commands: rg --files; cat docs/activity.md; sed -n '1,260p' app.js; rg -n "studio|sygdom|human" app.js; rg -n "isDisease|sygdom|disease" app.js; sed -n '1360,1700p' app.js; sed -n '14640,14880p' app.js; rg -n "rules|modal" app.js; sed -n '13070,13130p' app.js; rg -n "maybeResolveStudioPreference" app.js; sed -n '2160,2305p' app.js; rg -n "\\+3|\\-1" app.js; sed -n '3440,3520p' app.js; rg -n "MCQ|kortsvar|drawing|skitse|canvas|score" index.html; sed -n '440,560p' index.html; sed -n '1580,1665p' index.html; sed -n '1,260p' sygdomslaere.html; sed -n '1,240p' sygdomslaere.js; sed -n '100,220p' styles.css; sed -n '1,80p' data/questions.json; sed -n '1,80p' data/kortsvar.json; sed -n '1,80p' data/sygdomslaere.json; rg -n "Studio Engine|studio engine|engine contract|kontrakt" -S .; date +%F.
- Security: no runtime changes; contract spec only.
- Follow-ups: implement the contract at the canonical location and wire app.js/index.html gating to enforce studio-specific capabilities.

## 2026-01-11
- Purpose: add a deterministic, versioned studio data pipeline and Supabase schema for studies, item bank, disease domains, rubrics, model answers, sessions, and attempts; version LLM audit outputs.
- Files: supabase/schema.sql, scripts/build_studio_pipeline.py, scripts/audit_figures.py, docs/activity.md.
- Commands: cat docs/activity.md; sed -n '1,260p' scripts/convert_rawdata.py; sed -n '1,260p' scripts/convert_kortsvar.py; sed -n '260,520p' scripts/convert_kortsvar.py; sed -n '1,260p' scripts/convert_sygdomslaere.py; sed -n '1,260p' scripts/audit_figures.py; rg -n "openai|LLM|model|prompt" scripts api data; python3 - <<'PY' ...; date +%F.
- Security: added RLS policies for user-scoped tables, locked ingest_runs to service role only, and enforced schema validation via check constraints.
- Follow-ups: generate SQL via scripts/build_studio_pipeline.py and apply migrations; verify RLS with manual queries before exposing data reads.

## 2026-01-11
- Purpose: enforce single-file database setup by embedding studio pipeline SQL into supabase/schema.sql and deprecating external SQL output.
- Files: supabase/schema.sql, scripts/build_studio_pipeline.py, scripts/studio_pipeline.sql, docs/activity.md.
- Commands: cat docs/activity.md; sed -n '1,20p' scripts/studio_pipeline.sql; python3 scripts/build_studio_pipeline.py; rg -n "BEGIN STUDIO_PIPELINE_DATA|END STUDIO_PIPELINE_DATA" supabase/schema.sql; date +%F.
- Security: no change; pipeline SQL now lives inside schema.sql under explicit markers.
- Follow-ups: apply supabase/schema.sql via CLI or chunked execution if SQL editor limits persist.

## 2026-01-11
- Purpose: document security contracts, add audit logging, and tighten validation for Stripe endpoints and webhooks.
- Files: api/_lib/body.js, api/_lib/audit.js, api/profile.js, api/user-state.js, api/account/delete.js, api/account/export.js, api/stripe/create-checkout-session.js, api/stripe/create-portal-session.js, api/stripe/create-setup-intent.js, api/stripe/create-subscription.js, api/stripe/set-default-payment-method.js, api/stripe/update-subscription.js, api/stripe/webhook.js, supabase/schema.sql, docs/security-contracts.md, tests/body.test.mjs, docs/activity.md.
- Commands: cat docs/activity.md; rg --files api; rg -n "readJson\\(" api; rg -n "STRIPE_SECRET_KEY|CLERK_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY" -S .; sed -n '1,260p' api/*.js; sed -n '1,220p' supabase/schema.sql; apply_patch (multiple files); date +%F.
- Security: added audit_events table with RLS deny policies, sanitized audit logging for account/Stripe actions, validated Stripe webhook fields, and enforced empty-body validation for bodyless POST endpoints.
- Follow-ups: apply supabase/schema.sql in Supabase; run `npm test`; verify audit_events RLS in Supabase.

## 2026-01-11
- Purpose: centralize studio scoring/capabilities policy, add a dev-only debug panel, and add trace-id instrumentation for AI evaluation endpoints with minimal tests.
- Files: studio-policy.js, app.js, index.html, styles.css, api/_lib/trace.js, api/_lib/response.js, api/grade.js, api/hint.js, api/explain.js, api/vision.js, tests/studioPolicy.test.mjs, tests/routingAuth.integration.test.mjs, docs/activity.md.
- Commands: `npm test -- tests/studioPolicy.test.mjs tests/routingAuth.integration.test.mjs`, `date +%F`.
- Security: added trace-id propagation for AI evaluation endpoints (header + response field) without logging PII; debug panel is dev-only.
- Follow-ups: none.

## 2026-01-11
- Purpose: split auth flow into sign-in/sign-up routes, keep the landing page marketing-only, and enforce auth gating while isolating demo history.
- Files: app.js, auth.js, sign-in.html, sign-up.html, index.html, docs/activity.md.
- Commands: cat docs/activity.md; sed -n '3460,3615p' app.js; rg -n "allowDemo" app.js; rg -n "sign-up.html|sign-in.html" *.html; apply_patch (app.js, sign-in.html); cat <<'EOF' > auth.js; cat <<'EOF' > sign-up.html; date +%F.
- Security: unauthenticated users now redirect to sign-in before protected screens; demo quiz results no longer merge into real history; redirect targets remain same-origin via existing Clerk sanitization.
- Follow-ups: verify auth redirect flow and demo-only behavior in the browser.

## 2026-01-11
- Purpose: implement Studio Engine contracts for Sygdomslære (case_structured), structured hint levels with history-based progression, and capability gating to disable MCQ/drawing.
- Files: app.js, studio-engine.js, index.html, docs/studio-engine.md, tests/studioEngine.test.mjs, docs/activity.md.
- Commands: rg -n "StudioEngine|hint|buildReviewQueue|toggleQuestionHint" app.js; sed -n '9880,10110p' app.js; apply_patch (app.js, studio-engine.js, index.html); apply_patch (docs/studio-engine.md, tests/studioEngine.test.mjs); npm test; date +%F.
- Security: disabled sketch/drawing for Sygdomslære, switched hints to local structured generation (no AI calls), and kept existing auth/rate limits unchanged.
- Follow-ups: verify Sygdomslære sessions show structured hints and no MCQ/sketch UI.

## 2026-01-11
- Purpose: route studio policy through Studio Engine contracts and document wrapper dependencies.
- Files: studio-policy.js, tests/studioPolicy.test.mjs, docs/studio-engine.md, docs/activity.md.
- Commands: sed -n '1,200p' docs/activity.md; rg -n "studio-policy|studio-engine|app.js" index.html; sed -n '1,240p' studio-policy.js; sed -n '1,260p' studio-engine.js; rg -n "getScoringPolicy|getStudioPolicy|scoringPolicy" app.js; sed -n '280,420p' app.js; rg -n "STUDIO_POLICY" app.js; rg -n "policy\\.domains|contract\\.domains|domains\\]" app.js; sed -n '11140,11220p' app.js; sed -n '1,240p' docs/studio-engine.md; rg -n "studio-policy" -S .; cat package.json; rg -n "STUDIO_TYPES" -S .; rg -n "function getHintPolicy|const hintPolicy|hintPolicy" app.js; sed -n '9960,10080p' app.js; rg -n "return \\{" studio-engine.js; sed -n '300,380p' studio-engine.js; sed -n '6180,6245p' app.js; `npm test`; `date +%F`.
- Security: none.
- Follow-ups: verify Sygdomslaere uses structured hints and hides MCQ/sketch UI in the browser.

## 2026-01-11
- Formaal: Tilpasse resultat- og historikvisning til studio-specifik scoring (rubric vs grade) og dokumentere scoring contracts/policies.
- Berorte filer: app.js, docs/scoring-contracts.md, docs/activity.md.
- Kommandoer: sed -n '1,200p' docs/activity.md; rg -n "showResults|renderHistory|scoreSummary" app.js; sed -n '12980,13240p' app.js; sed -n '11240,11480p' app.js; rg -n "result-rubric" index.html; apply_patch (app.js); cat <<'EOF' > docs/scoring-contracts.md; date +%F.
- Sikkerhedsimplikationer: Ingen nye endpoints; rubric/grade-visning og kontrakt-log er dokumenteret uden at logge rae answers.
- Opfoelgning: Verificer i UI at Humanbiologi viser grade + MCQ/kortsvar og Sygdomslaere viser rubricdaekning uden grade.

## 2026-01-11
- Formaal: Uddybe scoring contracts med result-UI mapping for rubric vs grade.
- Berorte filer: docs/scoring-contracts.md, docs/activity.md.
- Kommandoer: apply_patch (docs/scoring-contracts.md); date +%F.
- Sikkerhedsimplikationer: Ingen; dokumentationsopdatering.
- Opfoelgning: Ingen.

## 2026-01-11
- Formaal: Lukke kritiske fejl fra Prompt 9 (rate limiting fail-open, account delete/export fejlhaandtering, auth fallback) og align Sygdomslaere-domæner til data, samt fjerne ubrugte Sygdomslaere-assets og opdatere tests.
- Berorte filer: api/_lib/rateLimit.js, api/account/delete.js, api/account/export.js, api/_lib/auth.js, api/grade.js, studio-engine.js, app.js, data/sygdomslaere.json, scripts/convert_sygdomslaere.py, docs/studio-engine.md, tests/accountDelete.test.mjs, tests/rateLimitEnforce.test.mjs, tests/apiValidation.test.mjs, sygdomslaere.js, sygdomslaere.css, docs/activity.md.
- Kommandoer: ls; sed -n '1,200p' docs/activity.md; rg -n "Prompt 9|Prompt9|Prompt\\s*9" -S .; sed -n '1,220p' api/account/delete.js; sed -n '1,220p' api/_lib/rateLimit.js; python3 - <<'PY' ...; rg -n "Samfundsbyrde|Nøglepunkter|keypoints" -S .; sed -n '1,200p' studio-engine.js; sed -n '1,200p' sygdomslaere.js; sed -n '1,200p' docs/studio-engine.md; sed -n '1,240p' api/grade.js; cat package.json; rg -n "sygdomslaere\\.js|sygdomslaere\\.css" -S .; rg -n "getUserFromRequest" -S api; npm test -- tests/apiValidation.test.mjs tests/rateLimitEnforce.test.mjs tests/accountDelete.test.mjs; date +%F.
- Sikkerhedsimplikationer: Rate limiting fejler nu lukket med kontrolleret 503 ved backend-fejl; account delete/export stopper og logger ved Supabase-fejl; auth accepterer gyldige tokens selv ved Clerk API-fejl; grade-validering afviser ikke-understøttede studios tidligere.
- Opfoelgning: Overvej at koere fuld test-suite hvis der er behov for bred regressionstest.

## 2026-01-11
- Purpose: switch auth back to Supabase (email/password + Google/Apple OAuth), remove Clerk assets/deps, and tighten CSP.
- Files: api/_lib/auth.js, api/account/delete.js, api/_lib/clerk.js, app.js, auth.js, consent.js, sign-in.html, sign-up.html, consent.html, index.html, styles.css, package.json, package-lock.json, scripts/build-clerk.mjs, src/clerk-init.js, clerk-init.js, vercel.json, docs/security-contracts.md, agents.md, README.md, tests/accountDelete.test.mjs, tests/authSupabase.test.mjs, docs/activity.md.
- Commands: rg -n "Clerk|clerk" -S .; npm install; npm test -- tests/authSupabase.test.mjs tests/accountDelete.test.mjs; date +%F.
- Security: server auth now verifies Supabase JWTs; account deletion uses Supabase admin auth delete; CSP removed Clerk/Turnstile domains.
- Follow-ups: configure Supabase OAuth providers + redirect URLs; note that existing Clerk user IDs are not migrated (fresh login required).

## 2026-01-11
- Purpose: gather Vercel 404 context and verify local configuration surfaces (Vercel linking, headers, auth routes).
- Files: docs/activity.md, README.md, vercel.json, .vercel/project.json, scripts/.vercel/README.txt, scripts/.vercel/project.json, app.js, index.html, sign-in.html, sign-up.html.
- Commands: cat docs/activity.md; rg --files -g ".vercel/**"; rg --files --hidden -g ".vercel/**"; ls -la; ls -la scripts/.vercel; cat scripts/.vercel/README.txt; cat scripts/.vercel/project.json; ls -la .vercel; cat .vercel/project.json; cat vercel.json; cat README.md; rg -n "sign-in" app.js *.html; date +%F.
- Security: none (read-only inspection).
- Follow-ups: confirm exact Vercel command, working directory, and failing URL to pinpoint the 404 source.

## 2026-01-11
- Purpose: reproduce Vercel dev behavior from repo root and verify local routing for /, /index.html, and /api/config.
- Files: docs/activity.md, vercel.json, package.json.
- Commands: sed -n '1,60p' docs/activity.md; vercel dev --debug --listen 3000; curl -D - http://localhost:3000/; curl -D - http://localhost:3000/index.html; curl -D - http://localhost:3000/api/config; rg -n "package.json|vercel.json|Locating files|Ready!" <vercel log>.
- Security: none (local dev server only).
- Follow-ups: run vercel dev from repo root (not scripts/) and retest if 404 persists.

## 2026-01-11
- Purpose: split studio pipeline data out of supabase/schema.sql and add a generation/chunking flow to avoid SQL editor size limits.
- Files: supabase/schema.sql, supabase/studio_pipeline.sql, scripts/build_studio_pipeline.py, README.md, .gitignore, docs/activity.md.
- Commands: rg --files; sed -n '1,160p' docs/activity.md; sed -n '1,260p' supabase/schema.sql; rg -n "STUDIO_PIPELINE|BEGIN|DATA" supabase/schema.sql; rg -n "schema.sql|studio_pipeline|build_studio_pipeline" -S .; ls -la scripts; wc -l supabase/schema.sql; python3 - <<'PY' ...; sed -n '920,1015p' supabase/schema.sql; sed -n '1,40p' supabase/studio_pipeline.sql; wc -l supabase/schema.sql supabase/studio_pipeline.sql; tail -n 40 docs/activity.md; apply_patch (scripts/build_studio_pipeline.py); apply_patch (README.md); apply_patch (.gitignore); date +%F.
- Security: no runtime changes; database setup now requires applying schema.sql plus studio_pipeline.sql.
- Follow-ups: run python3 scripts/build_studio_pipeline.py --chunk-size 200 before pasting into SQL Editor if needed; verify pipeline load in Supabase.

## 2026-01-12
- Purpose: harden Supabase auth UX on sign-in/up pages (safe redirects, session auto-redirect, error mapping, minimal validation) and document auth setup/checklist.
- Files: auth.js, tests/authClient.test.mjs, docs/auth-flow-checklist.md, README.md, docs/activity.md.
- Commands: apply_patch (auth.js, README.md); cat <<'EOF' > tests/authClient.test.mjs; cat <<'EOF' > docs/auth-flow-checklist.md; npm test -- tests/authClient.test.mjs; date +%F.
- Security: blocks auth-page redirect loops, limits unsafe redirects to same-origin, adds friendlier error mapping without leaking secrets.
- Follow-ups: run the auth flow checklist manually with real Supabase credentials.

## 2026-01-12
- Purpose: verify apex biologistudio.dk DNS/TLS and identify stale nameservers serving a self-signed certificate.
- Files: docs/activity.md.
- Commands: dig +short biologistudio.dk A; dig +short biologistudio.dk AAAA; dig +short biologistudio.dk CNAME; dig @1.1.1.1 +short biologistudio.dk A; dig @8.8.8.8 +short biologistudio.dk A; getent hosts biologistudio.dk || nslookup biologistudio.dk; curl -I https://biologistudio.dk; openssl s_client -connect biologistudio.dk:443 -servername biologistudio.dk -brief </dev/null; for ip in 142.132.143.218 216.198.79.1 64.29.17.1 64.29.17.65; do ...; done; dig +short biologistudio.dk NS; dig +trace biologistudio.dk A; dig @ns1.vercel-dns.com +short biologistudio.dk A; dig @ns2.vercel-dns.com +short biologistudio.dk A; dig @ns1.nordicway.dk +short biologistudio.dk A; dig @ns2.nordicway.dk +short biologistudio.dk A; dig @ns3.nordicway.dk +short biologistudio.dk A; dig @ns4.nordicway.dk +short biologistudio.dk A.
- Security: stale Nordicway NS return 142.132.143.218 with a self-signed cert; clients hitting that IP fail HSTS/TLS while Vercel A records serve valid certs.
- Follow-ups: remove or align the legacy Nordicway A record to the Vercel A records and re-check DNS/TLS.

## 2026-01-12
- Purpose: diagnose TLS/HSTS error for biologistudio.dk by inspecting DNS resolution and certificate chain from multiple resolvers.
- Files: docs/activity.md.
- Commands: dig +short biologistudio.dk A biologistudio.dk AAAA; openssl s_client -connect biologistudio.dk:443 -servername biologistudio.dk -brief </dev/null; getent hosts biologistudio.dk || nslookup biologistudio.dk; curl -I https://biologistudio.dk; dig @1.1.1.1 +short biologistudio.dk A; dig @8.8.8.8 +short biologistudio.dk A; for ip in 64.29.17.1 64.29.17.65 216.198.79.1 216.198.79.65 142.132.143.218; do ...; done.
- Security: found a self-signed certificate on one A record, which triggers HSTS blocking.
- Follow-ups: update DNS to remove the self-signed host and point apex to the correct provider (e.g., Vercel).

## 2026-01-12
- Purpose: diagnose TLS/DNS failure for biologistudio.dk.kristenson.dk and confirm authoritative records/cert chain.
- Files: README.md, vercel.json, docs/activity.md.
- Commands: rg -n "biologistudio|kristenson|domain|vercel" README.md vercel.json docs -S; sed -n '1,200p' README.md; cat vercel.json; dig +short biologistudio.dk.kristenson.dk A; dig +short biologistudio.dk.kristenson.dk AAAA; dig +short biologistudio.dk.kristenson.dk CNAME; dig @1.1.1.1 +short biologistudio.dk.kristenson.dk A; dig @8.8.8.8 +short biologistudio.dk.kristenson.dk A; getent hosts biologistudio.dk.kristenson.dk || nslookup biologistudio.dk.kristenson.dk; curl -I https://biologistudio.dk.kristenson.dk; openssl s_client -connect biologistudio.dk.kristenson.dk:443 -servername biologistudio.dk.kristenson.dk -brief </dev/null; for ip in 142.132.143.218 216.198.79.1 216.198.79.65 64.29.17.65; do ...; done; dig +trace biologistudio.dk.kristenson.dk A; date +%F.
- Security: authoritative A records do not present a trusted TLS chain; some IPs terminate TLS or present a self-signed cert, so browsers will block access.
- Follow-ups: update DNS so the subdomain points only to the intended host with a valid certificate (e.g., Vercel CNAME), then recheck TLS.

## 2026-01-12
- Purpose: investigate Google OAuth login failure by reviewing auth flow, config surfaces, and CSP.
- Files: agents.md, docs/activity.md, auth.js, sign-in.html, sign-up.html, api/config.js, vercel.json, README.md, docs/auth-flow-checklist.md, tests/authSupabase.test.mjs, app.js.
- Commands: ls; cat agents.md; cat docs/activity.md; sed -n '1,240p' auth.js; sed -n '240,520p' auth.js; sed -n '1,240p' sign-in.html; sed -n '1,240p' sign-up.html; sed -n '1,200p' api/config.js; rg -n "supabase|OAuth|google|signInWithOAuth" app.js auth.js api -S; rg -n "Supabase|OAuth|Google" README.md docs -S; sed -n '1,140p' README.md; sed -n '1,220p' docs/auth-flow-checklist.md; sed -n '1,240p' tests/authSupabase.test.mjs; cat vercel.json; rg -n "signInWithProvider|auth-google-btn|AUTH_PROVIDERS" app.js; sed -n '4600,4805p' app.js; rg -n "initSupabaseClient|loadRuntimeConfig|init\\(|initialize" app.js; sed -n '15680,15960p' app.js; rg -n "handleReturnParams" -n app.js; sed -n '5540,5695p' app.js; rg -n "redirectToAuth|redirect.*sign-in" app.js; sed -n '1540,1725p' app.js; date +%F.
- Security: none (read-only investigation).
- Follow-ups: capture repro details (environment + auth error) and confirm Supabase OAuth provider + redirect URL configuration.

## 2026-01-12
- Purpose: harden Google OAuth initiation in auth UI and add clearer error mapping plus storage guards.
- Files: auth.js, tests/authClient.test.mjs, docs/activity.md.
- Commands: rg -n "auth|Log ind|Fortsæt med Google|auth-google-btn" index.html; rg -n "auth-oauth|auth-status|auth-panel|btn" styles.css; sed -n '4170,4270p' styles.css; sed -n '2020,2145p' styles.css; curl -s -D - https://biologistudio.dk/sign-in.html; curl -s -D - https://biologistudio.dk/auth.js; curl -s -D - https://biologistudio.dk/api/config; curl -s -H "apikey: <supabase_anon>" -H "Authorization: Bearer <supabase_anon>" https://ywvehrbzqdyhxwlwrhkj.supabase.co/auth/v1/settings; rg -n "auth-google-btn" -S .; rg -n "signInWithOAuth" node_modules/@supabase/supabase-js -S; rg -n "_handleProviderSignIn" node_modules/@supabase/supabase-js/dist/umd/supabase.js; curl -s -D - https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2; curl -s -D - "https://ywvehrbzqdyhxwlwrhkj.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://biologistudio.dk/index.html"; curl -s -D - "https://ywvehrbzqdyhxwlwrhkj.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://biologistudio.dk/index.html&skip_http_redirect=true"; apply_patch (auth.js, tests/authClient.test.mjs); npm test -- tests/authClient.test.mjs; date +%F.
- Security: OAuth redirect now uses an explicit URL from Supabase and storage access is guarded against blocked localStorage; no secrets introduced.
- Follow-ups: verify Google OAuth redirect starts on production and confirm any console errors if it still fails.

## 2026-01-12
- Purpose: add a reusable API-based studio pipeline importer with retry/dedupe safeguards, document DB vs local data flow, and import pipeline data into Supabase.
- Files: scripts/import_studio_pipeline.js, README.md, docs/activity.md.
- Commands: node scripts/import_studio_pipeline.js --chunk-size 200 --verify; date +%F.
- Security: importer uses Supabase service role from env with idempotent upserts, does not log secrets, and keeps data server-side only.
- Follow-ups: consider reviewing asset_annotations source_key duplicates if you expect the full 150 entries.

## 2026-01-12
- Purpose: add OAuth fallback redirect and keep auth controls usable if initialization fails; extend auth client tests.
- Files: auth.js, tests/authClient.test.mjs, docs/activity.md.
- Commands: tail -n 40 docs/activity.md; rg -n "FKGrotesk|Grotesk" styles.css; curl -s https://biologistudio.dk/auth.js | rg -n "skipBrowserRedirect|safeStorage"; curl -s https://biologistudio.dk/auth.js | head -n 120; sed -n '1,220p' auth.js; rg -n "handleOAuth|initAuth" -n auth.js; sed -n '360,470p' auth.js; apply_patch (auth.js, tests/authClient.test.mjs); npm test -- tests/authClient.test.mjs; date +%F.
- Security: OAuth fallback builds authorize URL from Supabase public config only; controls remain enabled for retries without exposing secrets.
- Follow-ups: deploy and verify Google OAuth on production; capture console errors if the click still does nothing.

## 2026-01-12
- Purpose: prevent auth script redeclare errors by isolating globals and guarding init re-entry.
- Files: auth.js, docs/activity.md.
- Commands: apply_patch (auth.js); npm test -- tests/authClient.test.mjs; date +%F.
- Security: no change in auth semantics; reduces risk of duplicate handlers on repeated script loads.
- Follow-ups: deploy and confirm the console no longer reports "supabase already declared" and OAuth redirect starts.

## 2026-01-12
- Purpose: verify Supabase pipeline import row counts via service role read-only queries.
- Files: docs/activity.md.
- Commands: node - <<'NODE' ...; date +%F.
- Security: read-only counts using service role, no secrets logged.
- Follow-ups: investigate asset_annotations count if 150 rows are expected.

## 2026-01-12
- Purpose: fix consent page redeclare error and add inline OAuth icons for sign-in/up buttons.
- Files: consent.js, sign-in.html, sign-up.html, styles.css, tests/consentScript.test.mjs, docs/activity.md.
- Commands: tail -n 80 docs/activity.md; sed -n '1,260p' consent.js; sed -n '1,220p' consent.html; rg -n "auth-oauth|oauth" styles.css; sed -n '2050,2115p' styles.css; rg -n "auth-google-btn|auth-apple-btn" -n sign-in.html sign-up.html; apply_patch (consent.js, sign-in.html, sign-up.html, styles.css); cat <<'EOF' > tests/consentScript.test.mjs; npm test -- tests/authClient.test.mjs tests/consentScript.test.mjs; date +%F.
- Security: consent script now isolates globals and guards init to avoid redeclare errors; OAuth icons are inline SVG with no external dependencies.
- Follow-ups: deploy and verify consent accept flow and OAuth button visuals on production.

## 2026-01-12
- Purpose: align docs with current runtime and remove unused artifacts (book exam relevance data, local dev server stub, empty src dir).
- Files: README.md, docs/security-contracts.md, data/book_exam_relevance.json (deleted), scripts/dev_server.py (deleted), src/ (removed), docs/activity.md.
- Commands: rg --files; sed -n '1,240p' README.md; sed -n '1,240p' index.html; rg -n "<script" index.html; rg -n "/api/" -S .; sed -n '1,260p' auth.js; sed -n '1,260p' consent.js; sed -n '1,240p' docs/studio-engine.md; sed -n '1,240p' docs/security-contracts.md; sed -n '1,240p' docs/scoring-contracts.md; sed -n '1,240p' docs/auth-flow-checklist.md; sed -n '1,200p' scripts/convert_rawdata.py; head -n 40 data/book_exam_relevance.json; head -n 40 data/book_captions.json; rg -n "sygdomslaere.html" -S .; rm data/book_exam_relevance.json; rm scripts/dev_server.py; rmdir src; date +%F.
- Security: documented /api/rubric-score in security contracts; removed unused dev server script (no runtime change).
- Follow-ups: confirm whether to prune unreferenced image assets under `billeder/` or keep for future imports.

## 2026-01-12
- Purpose: remove unused top-level dependencies after confirming they are not referenced in code/scripts.
- Files: package.json, package-lock.json, docs/activity.md.
- Commands: rg -n "dotenv" -S .; rg -n "esbuild" -S .; npm remove @vercel/speed-insights esbuild; cat package.json; rg -n "speed-insights|esbuild" -S package-lock.json; sed -n '1700,1755p' package-lock.json; rg -n "speed-insights" package-lock.json; date +%F.
- Security: removed unused `@vercel/speed-insights` (reduces supply-chain surface); `esbuild` remains as a transitive dependency via vitest/vite.
- Follow-ups: none.

## 2026-01-12
- Purpose: add file-scoped, contextual data-testid attributes to every div across HTML pages for reliable inspection/automation.
- Files: index.html, consent.html, sign-in.html, sign-up.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, handelsbetingelser.html, docs/activity.md.
- Commands: rg --files -g "*.html"; python3 - <<'PY' ...; python3 - <<'PY' ...; rg -n "brand-block" index.html; rg -n "consent__" consent.html; date +%F.
- Security: no change; UI-only selector attributes added.
- Follow-ups: none.

## 2026-01-12
- Purpose: block round start unless the user has Pro access or an own API key, and add a shared access policy helper with tests.
- Files: access-policy.js, index.html, app.js, tests/accessPolicy.test.mjs, docs/activity.md.
- Commands: apply_patch (access-policy.js, index.html, app.js, tests/accessPolicy.test.mjs); npm test -- tests/accessPolicy.test.mjs; date +%F.
- Security: prevents starting full rounds without verified access (subscription or own key); no secrets added or logged.
- Follow-ups: verify in the browser that start is disabled without access and enabled for Pro or own-key users.

## 2026-01-12
- Purpose: switch local Stripe env values to live keys, align base URL/price ID across env files, and leave webhook secret pending.
- Files: .env, scripts/.env.local, docs/activity.md.
- Commands: python3 - <<'PY' ...; apply_patch (.env); apply_patch (scripts/.env.local); date +%F.
- Security: live Stripe keys now live in local env files (gitignored); webhook secret left empty until configured; avoid sharing keys and rotate if exposed.
- Follow-ups: set STRIPE_WEBHOOK_SECRET from the live webhook endpoint; mirror live values in Vercel Environment Variables; consider removing live keys from local env when production-only.

## 2026-01-12
- Purpose: add Stripe webhook idempotency tracking, user-aware rate limiting, and secret-rotation support; add tests.
- Files: api/stripe/webhook.js, supabase/schema.sql, docs/security-contracts.md, tests/stripeWebhook.test.mjs, docs/activity.md.
- Commands: rg --files; cat docs/activity.md; cat agents.md; sed -n '1,260p' api/stripe/webhook.js; sed -n '1,240p' api/_lib/audit.js; sed -n '140,220p' supabase/schema.sql; rg -n "stripe|webhook" docs/security-contracts.md; apply_patch (api/stripe/webhook.js, supabase/schema.sql, docs/security-contracts.md, tests/stripeWebhook.test.mjs); npm test -- tests/stripeWebhook.test.mjs; date +%F.
- Security: webhook signatures now support secret rotation; event IDs are recorded server-side to prevent duplicate processing; user-based rate limiting is applied when a user ID is available.
- Follow-ups: apply supabase/schema.sql to create stripe_webhook_events in Supabase.

## 2026-01-13
- Purpose: avoid false "already Pro" gating on upgrade by checking paid plan explicitly; add access-policy helper + test.
- Files: access-policy.js, app.js, tests/accessPolicy.test.mjs, docs/activity.md.
- Commands: npm test -- tests/accessPolicy.test.mjs; date +%F.
- Security: upgrade gating now relies on the profile plan; server-side subscription checks still prevent duplicate subscriptions.
- Follow-ups: verify in UI that free accounts can start checkout; if backend still reports an active subscription, inspect Stripe/Supabase subscription records.

## 2026-01-13
- Purpose: switch Pro checkout UI and copy to lifetime (one-time) access, tighten Stripe checkout guards, and add coverage for lifetime payment intents.
- Files: app.js, api/stripe/create-checkout-session.js, index.html, handelsbetingelser.html, vilkaar.html, persondatapolitik.html, README.md, docs/security-contracts.md, tests/accessPolicy.test.mjs, tests/aiAccess.test.mjs, tests/stripeWebhook.test.mjs, tests/stripeCreateSubscription.test.mjs, docs/activity.md.
- Commands: ls; cat docs/activity.md; rg -n "updateBillingUI|renderBillingTimeline|createSubscriptionIntent|openHostedCheckout|hasPaidPlan" app.js; sed -n '3120,3685p' app.js; sed -n '3685,4345p' app.js; sed -n '4970,5385p' app.js; rg -n "abonnement|pris|måned|pro|betaling|stripe|checkout" index.html; sed -n '260,340p' index.html; sed -n '1240,1530p' index.html; sed -n '1530,1710p' index.html; sed -n '1,200p' handelsbetingelser.html; sed -n '70,130p' vilkaar.html; sed -n '60,90p' persondatapolitik.html; rg -n "subscription|Stripe|checkout" README.md; rg -n "create-subscription|checkout|stripe" docs/security-contracts.md; npm test -- tests/accessPolicy.test.mjs tests/aiAccess.test.mjs tests/stripeWebhook.test.mjs tests/stripeCreateSubscription.test.mjs; date +%F.
- Security: server now blocks duplicate paid checkout attempts; lifetime plan is treated as paid access without adding new secrets.
- Follow-ups: verify the live Stripe price is a non-recurring DKK 1.500 product and run a real checkout; review legal copy updates before production publishing.
