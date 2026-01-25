# Activity Log

## 2026-01-25
- Purpose: tune page-index background colors, fix menu-grid column overlap, and restore original blue for Human Biologi chips.
- Files: styles.css, docs/activity.md.
- Commands: sed -n '1,200p' docs/activity.md; rg -n "page-index" -S .; rg -n "menu-grid|menu-column" styles.css index.html; sed -n '1520,1625p' styles.css; sed -n '4180,4305p' styles.css; sed -n '430,560p' index.html; sed -n '940,1090p' index.html; sed -n '1,220p' styles.css; rg -n "\\.chip" styles.css; sed -n '2060,2145p' styles.css; sed -n '2660,2745p' styles.css; rg -n "data-course" styles.css; rg -n "data-theme|theme" app.js; rg -n "data-course|data-studio|course" index.html; rg -n "dataset\\.course|data-course|dataCourse|course" app.js | rg -n "dataset|body|course"; rg -n "DEFAULT_COURSE" app.js | head -n 20; rg -n "glow" styles.css; sed -n '200,270p' styles.css; git status -sb; git log -1 -- styles.css; git show HEAD~1:styles.css | rg -n -- "--accent"; git show HEAD~1:styles.css | rg -n -- "--bg"; git show HEAD~1:styles.css | sed -n '1,130p'; apply_patch (styles.css); date +%F; npm test.
- Security: no security or access-control changes.
- Follow-ups: verify the index background colors, chip active color in Human Biologi, and menu-grid layout at desktop widths.

- Purpose: prevent admin dataset rendering from re-entering `updateAdminUI`, which allows the logout course theme reset test to run without overflowing the stack.
- Files: app.js, docs/activity.md.
- Commands: apply_patch (app.js); npm test -- tests/courseSwitchLock.test.mjs; date +%F.
- Security: no auth/data surface changes; edit is client-side rendering logic.
- Follow-ups: none.

- Purpose: move the admin datasets panel into the admin dashboard so it is not visible in the public menu.
- Files: index.html, docs/activity.md.
- Commands: ls; cat docs/activity.md; rg -n "admin-datasets" -n; sed -n '820,1100p' index.html; rg -n "admin-dataset" app.js; rg -n "is_admin" app.js; sed -n '4080,4380p' app.js; rg -n "const elements" app.js; sed -n '1150,1380p' app.js; rg -n "setElementVisible" app.js; sed -n '5920,5975p' app.js; rg -n "function updateAdminUI" app.js; sed -n '3750,3880p' app.js; rg -n "admin-screen" index.html; sed -n '1380,1640p' index.html; sed -n '1640,2200p' index.html; sed -n '1100,1500p' index.html; nl -ba index.html | sed -n '900,1250p'; rg -n "admin-detail-danger-section" index.html; sed -n '1760,1980p' index.html; nl -ba index.html | sed -n '1600,1950p'; sed -n '880,980p' index.html; rg -n "admin-datasets-panel" index.html; sed -n '780,900p' index.html; rg -n "admin-side-column" index.html; sed -n '1730,1820p' index.html; rg -n "menu-summary-panel" index.html; sed -n '820,900p' index.html; rg -n "id=\\"admin-screen\\"" index.html; rg -n "move the admin datasets panel" docs/activity.md; apply_patch (index.html); apply_patch (docs/activity.md); date +%F.
- Security: admin datasets UI no longer renders on the public menu; backend admin auth requirements unchanged.
- Follow-ups: verify the datasets panel appears in the admin dashboard and is absent from non-admin menus.

## 2026-01-24
- Purpose: fix admin import supabase access reference and prepare SQL to normalize human category labels across snapshots/items.
- Files: api/_lib/importer.js, supabase/fix_human_categories.sql, docs/activity.md.
- Commands: ls; sed -n '1,200p' docs/activity.md; git status -sb; rg -n "dataset_versions|dataset_items|dataset_version_events|published_version_id" supabase/schema.sql; sed -n '300,520p' supabase/schema.sql; rg -n "HUMAN_CATEGORY_LABELS|normalizeHumanCategory" api/_lib/rawdataParser.js; sed -n '1,260p' api/_lib/importer.js; sed -n '1,240p' api/_lib/importFormatter.js; sed -n '1,240p' api/admin/datasets/versions.js; sed -n '1,240p' api/admin/datasets/items.js; sed -n '1,260p' api/admin/datasets/item.js; sed -n '1,240p' api/admin/datasets/bulk.js; sed -n '1,240p' api/admin/datasets/publish.js; sed -n '1,200p' api/admin/datasets/qa.js; sed -n '1,200p' supabase/fix_human_categories.sql; rg -n "adminDataset|datasets" app.js; sed -n '4280,5200p' app.js; rg -n "Datasæt|admin-dataset" index.html; sed -n '820,980p' index.html; date +%F.
- Security: no access control changes; SQL only normalizes category labels in stored datasets.
- Follow-ups: run `supabase/fix_human_categories.sql` in Supabase; confirm category chips collapse to canonical labels; optionally run targeted tests (e.g., `npm test -- tests/adminDatasets.test.mjs`).
- Purpose: allow dataset item payloads/bulk patches through validation and verify admin dataset tests.
- Files: api/admin/datasets/items.js, api/admin/datasets/item.js, api/admin/datasets/bulk.js, docs/activity.md.
- Commands: sed -n '1,200p' api/_lib/body.js; sed -n '1,240p' api/_lib/validate.js; npm test -- tests/adminDatasets.test.mjs; date +%F.
- Security: maintains admin auth and rate limits; validation still rejects unknown top-level payload fields and only allows supported bulk patch keys.
- Follow-ups: none.
- Purpose: move the datasets panel into the admin screen and improve dataset UX (summary, selection, QA details, type-aware filters).
- Files: index.html, styles.css, app.js, docs/activity.md.
- Commands: sed -n '1,200p' docs/activity.md; rg -n "admin-screen|admin-datasets-panel" index.html; sed -n '1380,1700p' index.html; sed -n '1700,2100p' index.html; rg -n "admin-dataset" styles.css; sed -n '5630,5790p' styles.css; sed -n '820,1020p' index.html; rg -n "admin-users-panel" index.html; sed -n '1320,1800p' index.html; rg -n "admin-human-categories" index.html; sed -n '1410,1475p' app.js; rg -n "renderAdminDatasetItems" app.js; sed -n '4525,4595p' app.js; sed -n '4595,4665p' app.js; sed -n '5040,5145p' app.js; sed -n '5145,5255p' app.js; sed -n '5255,5355p' app.js; sed -n '18370,18480p' app.js; sed -n '18480,18580p' app.js; sed -n '18580,18670p' app.js; sed -n '18670,18760p' app.js; apply_patch (index.html, styles.css, app.js); date +%F.
- Security: no auth or data-access changes; UI-only improvements.
- Follow-ups: verify dataset panel layout in admin screen on desktop/mobile; confirm filters and bulk actions behave as expected per dataset type.

## 2026-01-13
- Purpose: finalize admin dashboard backend for full user management (create/update/ban/delete/subscriptions) and align routes/tests.
- Files: api/admin/user/create.js, api/admin/user/update.js, api/admin/user/action.js, api/admin/subscription.js, tests/adminUsers.test.mjs, docs/activity.md.
- Commands: ls; rg --files -g 'api/admin/*.js'; sed -n '1,260p' api/admin/users.js; sed -n '1,260p' api/admin/user/create.js; rg -n "admin-" index.html; rg -n "api/admin" app.js; mkdir -p api/admin/user; mv api/admin/user-create.js api/admin/user/create.js; mv api/admin/user-update.js api/admin/user/update.js; mv api/admin/user-action.js api/admin/user/action.js; npm test -- tests/adminUsers.test.mjs; date +%F.
- Security: new admin endpoints are auth-gated, rate-limited, schema-validated with unknown-field rejection, and audit-logged; hard deletes cancel Stripe subs when configured and return warnings if auth deletion fails.
- Follow-ups: verify admin user edit/ban/delete + subscription flows in the UI and confirm Stripe secret is set where hard deletes should cancel billing.
- Purpose: add AI-based formatting before admin imports, expose progress feedback in the admin UI, and document the faster import model option.
- Files: api/_lib/importFormatter.js, api/_lib/importer.js, api/admin/import.js, app.js, index.html, styles.css, README.md, tests/importFormatter.test.mjs, docs/activity.md.
- Commands: ls; rg -n "admin-import|openai|model" -S index.html app.js api scripts docs; sed -n '1,240p' api/admin/import.js; sed -n '1,240p' api/_lib/importer.js; sed -n '1,240p' api/_lib/rawdataParser.js; sed -n '720,820p' api/_lib/rawdataParser.js; sed -n '1688,1755p' index.html; sed -n '5220,5325p' styles.css; sed -n '3320,3385p' app.js; sed -n '4605,4705p' app.js; wc -c rawdata-mc rawdata-kortsvar rawdata-sygdomslaere.txt; apply_patch (multiple files); npm test -- tests/importFormatter.test.mjs; date +%F.
- Security: admin imports now require server-side AI formatting with strict schema validation; no new endpoints added.
- Follow-ups: set `OPENAI_IMPORT_MODEL` in env if you want a different fast model; verify admin import flow in the UI with a messy input sample.
- Purpose: add clean slugs via Vercel redirects/rewrites and update in-app links; make AI health checks treat active subscriptions as paid and surface clearer error states; add /api/health tests.
- Files: vercel.json, app.js, auth.js, consent.js, index.html, sign-in.html, sign-up.html, consent.html, sygdomslaere.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, handelsbetingelser.html, api/health.js, tests/health.test.mjs, docs/activity.md.
- Commands: sed -n '1,120p' docs/activity.md; cat vercel.json; rg --pcre2 -n "<script(?!\\s+src)" *.html; rg -n "\\.html" app.js auth.js consent.js; sed -n '1,40p' sygdomslaere.html; sed -n '40,110p' index.html; sed -n '30,90p' sign-in.html; apply_patch (vercel.json, app.js, consent.js, auth.js, api/health.js, app.js, tests/health.test.mjs); python3 - <<'PY' ...; npm test -- tests/health.test.mjs; date +%F.
- Security: /api/health remains auth-gated and rate-limited; now also checks active subscriptions for paid access; clean slugs add redirects/rewrites without relaxing CSP.
- Follow-ups: verify clean URLs and consent CSP in the browser; if ai-status-pill still shows "Hjælp er ikke klar lige nu.", capture `/api/health` response status/body to pinpoint the remaining cause.

## 2026-01-13
- Purpose: treat "pro" plan values as paid for AI access and billing gating; extend paid-plan tests.
- Files: api/_lib/aiAccess.js, access-policy.js, app.js, api/stripe/create-checkout-session.js, api/stripe/create-subscription.js, tests/aiAccess.test.mjs, tests/accessPolicy.test.mjs, docs/activity.md.
- Commands: rg --files; sed -n '1,200p' docs/activity.md; rg -n "ai-status-pill|Hjælp er ikke klar" -S app.js index.html styles.css api; sed -n '15760,15940p' app.js; sed -n '1,240p' api/health.js; sed -n '1,220p' api/_lib/aiAccess.js; sed -n '3970,4080p' app.js; sed -n '6615,6675p' app.js; sed -n '1,240p' access-policy.js; sed -n '1,220p' tests/aiAccess.test.mjs; sed -n '1,220p' tests/accessPolicy.test.mjs; apply_patch (multiple files); npm test -- tests/aiAccess.test.mjs tests/accessPolicy.test.mjs; date +%F.
- Security: paid-plan alias only; no new endpoints or data exposure.
- Follow-ups: consider normalizing any legacy "pro" profiles to "paid" before applying strict plan constraints.

## 2026-01-13
- Purpose: fix /api/me integration test by stubbing `userOpenAiKey` in routing/auth integration tests.
- Files: tests/routingAuth.integration.test.mjs, docs/activity.md.
- Commands: sed -n '1,200p' tests/routingAuth.integration.test.mjs; sed -n '1,200p' api/me.js; sed -n '1,200p' api/_lib/userOpenAiKey.js; apply_patch (tests/routingAuth.integration.test.mjs); npm test -- tests/routingAuth.integration.test.mjs.
- Security: test-only change; no runtime access control changes.
- Follow-ups: none.
## 2026-01-13
- Purpose: move admin access to `profiles.is_admin`, add admin header entry + profile lookup + analytics, switch import to Supabase-backed datasets with JS parsers, add authenticated data endpoints, and update favicon to `logo.png`.
- Files: api/_lib/admin.js, api/_lib/auth.js, api/_lib/rawdataParser.js, api/_lib/importer.js, api/_lib/datasets.js, api/admin/status.js, api/admin/metrics.js, api/admin/import.js, api/admin/lookup.js, api/data/questions.js, api/data/kortsvar.js, api/data/sygdomslaere.js, api/demo-quiz.js, app.js, index.html, styles.css, supabase/schema.sql, README.md, imports/README.md, consent.html, sign-in.html, sign-up.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, handelsbetingelser.html, logo.png, tests/adminLookup.test.mjs, tests/rawdataParser.test.mjs, docs/activity.md.
- Commands: ls; ls docs; cat docs/activity.md; rg -n "admin" index.html app.js styles.css api scripts; rg -n "menu-header|menu-right|skift-studio" index.html styles.css app.js; sed -n '1180,1560p' index.html; sed -n '1,260p' api/admin/metrics.js; sed -n '1,260p' api/admin/import.js; sed -n '1,260p' api/_lib/importer.js; sed -n '1,220p' scripts/import_rawdata.py; rg -n "Logo.png" *.html; python3 - <<'PY' ...; mv Logo.png logo_tmp.png; mv logo_tmp.png logo.png; rm Logo.png; git show HEAD:Logo.png > logo.png; git mv -f Logo.png logo-case-temp.png; git mv -f logo-case-temp.png logo.png; npm test -- tests/adminEndpoints.test.mjs tests/adminLookup.test.mjs tests/rawdataParser.test.mjs; npm test -- tests/adminEndpoints.test.mjs; date +%F.
- Security: admin access is now enforced via server-side `profiles.is_admin` checks; admin lookup endpoint is auth-gated, validated, rate-limited and audit-logged; dataset snapshots are stored server-side with RLS deny; new data endpoints require auth + rate limits; imports no longer write to the repo filesystem.
- Follow-ups: apply `supabase/schema.sql` (adds `profiles.is_admin` + `dataset_snapshots`), set `profiles.is_admin` for your user, and run an admin import to seed Supabase datasets; verify Vercel analytics env vars are set in deployment and confirm admin panels in the browser.
## 2026-01-13
- Purpose: remove the visible focus outline on the main content container to avoid distracting highlight on click.
- Files: styles.css, docs/activity.md.
- Commands: rg -n "focus|outline|box-shadow|ring" styles.css app.js index.html sygdomslaere.css sygdomslaere.html; rg -n "focus-within|:focus" styles.css; sed -n '1,140p' styles.css; sed -n '1910,2025p' styles.css; apply_patch (styles.css); date +%F.
- Security: none.
- Follow-ups: verify the highlight no longer appears when clicking the page or using the hint shortcut.

- Purpose: add append/replace import pipeline with import files + CLI, plus admin dashboard for metrics/import.
- Files: imports/README.md, imports/rawdata-mc.txt, imports/rawdata-kortsvar.txt, imports/rawdata-sygdomslaere.txt, scripts/import_rawdata.py, api/_lib/admin.js, api/_lib/importer.js, api/admin/status.js, api/admin/metrics.js, api/admin/import.js, index.html, styles.css, app.js, tests/adminEndpoints.test.mjs, README.md, .env, scripts/.env.local, docs/activity.md.
- Commands: ls; sed -n '1,200p' docs/activity.md; sed -n '1,260p' scripts/convert_kortsvar.py; sed -n '1,260p' scripts/convert_rawdata.py; sed -n '1,260p' scripts/convert_sygdomslaere.py; rg -n "openai|OpenAI|llm|gpt" -S scripts api data app.js; rg -n "import" scripts app.js api data docs; rg -n "admin" -S .; rg -n "questions.json|kortsvar.json|sygdomslaere.json|rawdata" app.js scripts data; mkdir -p imports; cat <<'EOF' > imports/README.md; apply_patch (multiple files); npm test -- tests/adminEndpoints.test.mjs; date +%F.
- Security: admin endpoints are auth-gated, rate-limited, and payload-validated; admin import is env-gated and returns aggregated metrics only.
- Follow-ups: run `npm test`; verify admin panel and import flow in the browser; set `ADMIN_EMAILS`/`ADMIN_IMPORT_ENABLED` in deployment env and ensure `python3` is available for admin import.

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

## 2026-01-13
- Purpose: keep the general CSP headers for every route while using a Vercel-allowed source pattern so `vercel dev` can start locally without the invalid pattern error.
- Files: vercel.json, docs/activity.md.
- Commands: `vercel dev` (errored with “invalid route source pattern” before this fix).
- Security: no runtime change; CSP headers still applied per environment.
- Follow-ups: rerun `vercel dev` once the new config is deployed to ensure the CLI starts cleanly.

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

## 2026-01-13
- Formål: Integrere banner/logo i centrale hero- og headerområder, samt gøre brand-elementer klikbare til tilbage-navigation.
- Berørte filer: index.html, styles.css, app.js, sign-in.html, sign-up.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, handelsbetingelser.html, docs/activity.md.
- Kommandoer: rg -n "logo|banner|brand" index.html sign-in.html sign-up.html vilkaar.html; sed -n '1,220p' index.html; apply_patch (styles.css, index.html, app.js, sign-in.html, sign-up.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, handelsbetingelser.html); date +%F.
- Sikkerhedsimplikationer: Ingen; kun UI/layout og klientnavigation.
- Opfølgning: Visuel verifikation i browser på auth/landing/menu/quiz/result og de juridiske sider.

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

## 2026-01-13
- Formål: forenkle landingpage-branding, fjerne redundant login-panel og stramme hero-oplevelsen.
- Berørte filer: index.html, styles.css, docs/activity.md.
- Kommandoer: ls; sed -n '1,200p' docs/activity.md; rg -n "auth-start|global-header|auth-hero" -S index.html styles.css sign-in.html sign-up.html auth.js; sed -n '52,130p' index.html; rg -n "auth-start" -S .; rg -n "auth-status" -S app.js auth.js index.html; rg -n "authStatus" -S app.js; sed -n '1120,1205p' app.js; rg -n "data-brand-back" -S .; sed -n '1200,1285p' styles.css; sed -n '4040,4105p' styles.css; apply_patch (index.html, styles.css, docs/activity.md); date +%F.
- Sikkerhedsimplikationer: Ingen; kun UI/layout og landingpage-copy.
- Opfølgning: Visuel gennemgang af auth-landing i desktop + mobil.

## 2026-01-13
- Formål: samle auth-hero kicker til én linje og stramme hero-teksten uden at fjerne eksisterende selectors.
- Berørte filer: index.html, styles.css, docs/activity.md.
- Kommandoer: sed -n '52,140p' index.html; sed -n '520,640p' styles.css; sed -n '1240,1345p' styles.css; file Logo.png Banner.png; apply_patch (index.html, styles.css, docs/activity.md); date +%F.
- Sikkerhedsimplikationer: Ingen; kun UI/kopi og layout.
- Opfølgning: Visuel gennemgang af auth-hero på smalle skærme for korrekt wrap af kicker-linje.

## 2026-01-13
- Formål: opdatere vilkår, handelsbetingelser, privatlivspolitik og persondatapolitik til juridisk udfyldende niveau samt gøre dokumenterne tilgængelige på forsiden.
- Berørte filer: vilkaar.html, handelsbetingelser.html, privatlivspolitik.html, persondatapolitik.html, index.html, docs/activity.md.
- Kommandoer: rg --files; sed -n '1,200p' docs/activity.md; sed -n '1,260p' vilkaar.html; sed -n '1,260p' handelsbetingelser.html; sed -n '1,260p' privatlivspolitik.html; sed -n '1,260p' persondatapolitik.html; sed -n '1,260p' consent.html; sed -n '1,260p' index.html; rg -n "vilkår|privatliv|persondata|handelsbetingelser|jurid" index.html; rg -n "footer|legal" index.html; sed -n '1180,1420p' index.html; rg -n "auth-screen|landing-shell" index.html; sed -n '260,380p' index.html; rg -n "legal-links|legal-link|legal-" styles.css; sed -n '5070,5180p' styles.css; sed -n '1,200p' README.md; sed -n '1,200p' agents.md; sed -n '1,220p' api/stripe/create-subscription.js; sed -n '1,220p' api/stripe/create-checkout-session.js; rg -n "subscription|abonnement|monthly|recurring" app.js index.html styles.css; sed -n '1,240p' api/stripe/update-subscription.js; sed -n '1,220p' api/stripe/create-portal-session.js; sed -n '1,220p' api/stripe/billing-overview.js; sed -n '220,440p' api/stripe/billing-overview.js; rg -n "plausible|analytics|tracking" -S *.html app.js; date +%Y-%m-%d; cat <<'EOF' > vilkaar.html; cat <<'EOF' > handelsbetingelser.html; cat <<'EOF' > privatlivspolitik.html; cat <<'EOF' > persondatapolitik.html; sed -n '240,320p' index.html; sed -n '300,360p' index.html; apply_patch (index.html, handelsbetingelser.html).
- Sikkerhedsimplikationer: opdaterede juridiske disclosure-tekster og tydeliggjorde databehandlere, tredjelandsoverførsler og AI-træning; ingen ændringer i runtime-adgangskontrol.
- Opfølgning: afklar om pris/checkout UI og Stripe-flow skal opdateres til abonnementsmodel, så kommunikation og funktionalitet matcher hinanden.

## 2026-01-13
- Formål: præcisere, at OpenAI kan være selvstændig dataansvarlig for modeltræning i privatlivs- og persondatapolitik.
- Berørte filer: privatlivspolitik.html, persondatapolitik.html, docs/activity.md.
- Kommandoer: apply_patch (privatlivspolitik.html, persondatapolitik.html).
- Sikkerhedsimplikationer: tydeliggjorde tredjepartsansvar for AI-træning; ingen ændring i databehandling eller adgangskontrol.
- Opfølgning: Ingen.

## 2026-01-13
- Formål: løfte WCAG 2.2 AA-tilgængelighed på hele sitet med bedre tastaturadgang, fokusmarkeringer, status-announce og modal-fokus.
- Berørte filer: index.html, styles.css, app.js, sign-in.html, sign-up.html, consent.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, handelsbetingelser.html, docs/accessibility-checklist.md, docs/activity.md.
- Kommandoer: ls; cat docs/activity.md; rg --files -g "*.html"; sed -n '1,220p' index.html; sed -n '1,240p' sign-in.html; sed -n '1,240p' sign-up.html; sed -n '1,260p' consent.html; sed -n '1,200p' vilkaar.html; sed -n '1,120p' privatlivspolitik.html; sed -n '1,80p' persondatapolitik.html; sed -n '1,80p' handelsbetingelser.html; rg -n "aria-|role=\"" index.html; rg -n "focus|outline|option-btn|chip-btn|sketch-text-box" styles.css; rg -n "modal|figure" app.js; python3 - <<'PY' ...; date +%F; cat <<'EOF' > docs/accessibility-checklist.md; apply_patch (index.html, styles.css, app.js, sign-in.html, sign-up.html, consent.html, vilkaar.html, privatlivspolitik.html, persondatapolitik.html, handelsbetingelser.html, docs/activity.md).
- Sikkerhedsimplikationer: Ingen; tilgængeligheds- og UI-justeringer uden ændring af dataadgang.
- Opfølgning: Manuel WCAG 2.2 AA-gennemgang med tastatur og skærmlæser, især modaler, quiz og auth-flow.

## 2026-01-13
- Formål: låse studioskift under aktive runder, så Human Biologi og Sygdomslære ikke blandes, samt rette mørk/lys-tema for Sygdomslære.
- Berørte filer: app.js, styles.css, tests/courseSwitchLock.test.mjs, docs/activity.md.
- Kommandoer: rg -n "dark|light|theme|mode|toggle" sygdomslaere.html index.html styles.css app.js; sed -n '880,1040p' index.html; sed -n '1,260p' styles.css; sed -n '1680,2105p' app.js; apply_patch (app.js, styles.css, tests/courseSwitchLock.test.mjs); npm test -- tests/courseSwitchLock.test.mjs; date +%F.
- Sikkerhedsimplikationer: Ingen; UI/tilstandsgating og tema-justeringer uden ændring af dataadgang.
- Opfølgning: Manuelt tjek at studioskift er blokeret under pauset runde, og at Sygdomslære dark mode ikke falder tilbage til lys palette.

## 2026-01-13
- Formål: tillade `lifetime` i plan-check constraint, så engangsbetaling kan opdatere plan uden DB-fejl.
- Berørte filer: supabase/schema.sql, docs/activity.md.
- Kommandoer: ls; cat docs/activity.md; rg -n "checkout|stripe|subscription|lifetime|engangs" app.js; sed -n '3200,5745p' app.js; sed -n '1,240p' api/stripe/create-subscription.js; sed -n '1,240p' api/stripe/create-checkout-session.js; sed -n '1,240p' api/stripe/billing-overview.js; rg -n "^STRIPE_LIFETIME_PRICE_ID" .env scripts/.env.local; rg -n "^STRIPE_PRICE_ID" .env scripts/.env.local; rg -n "plan in" supabase/schema.sql; apply_patch (supabase/schema.sql); date +%F.
- Sikkerhedsimplikationer: plan-check tillader nu `lifetime`, så webhooks ikke fejler ved plan-opdatering; ingen nye secrets.
- Opfølgning: kør opdateret `supabase/schema.sql` i Supabase for at opdatere check constraint.

## 2026-01-13
- Purpose: add API CORS allowlist + preflight handling, set HSTS for production headers, and document CORS config.
- Files: api/_lib/cors.js, api/_lib/response.js, vercel.json, docs/security-contracts.md, README.md, tests/cors.test.mjs, docs/activity.md.
- Commands: rg -n "Stripe|stripe" app.js index.html consent.js auth.js sign-in.html sign-up.html; rg -n "Method not allowed" api/stripe/*.js; apply_patch (multiple files); date +%F.
- Security: API now enforces a strict origin allowlist with explicit preflight responses; HSTS enabled for API responses and static headers.
- Follow-ups: set CORS_ALLOW_ORIGINS if additional production origins are required; verify Stripe flows after deploy.

## 2026-01-13
- Purpose: run CORS regression test.
- Files: tests/cors.test.mjs, docs/activity.md.
- Commands: npm test -- tests/cors.test.mjs; date +%F.
- Security: validates CORS allowlist and preflight handling behavior.
- Follow-ups: none.

## 2026-01-13
- Formål: fjerne ikke-anvendte databehandlere (Cloudflare R2) fra juridiske tekster efter bekræftelse.
- Berørte filer: persondatapolitik.html, privatlivspolitik.html, vilkaar.html, docs/activity.md.
- Kommandoer: rg -n "Cloudflare R2|R2|Resend|Plausible|analytics|tracking" *.html docs; apply_patch (persondatapolitik.html, privatlivspolitik.html, vilkaar.html); date +%F.
- Sikkerhedsimplikationer: ingen kodeændringer; juridiske tekster matcher aktuelle leverandører.
- Opfølgning: opdater igen hvis nye databehandlere tilføjes.

## 2026-01-13
- Formål: rette landingpage-markup så tema-switch ikke wrapper hele appen og scroll/layout fungerer korrekt på tværs af screens.
- Berørte filer: index.html, docs/activity.md.
- Kommandoer: ls; cat docs/activity.md; rg -n "overflow|scroll|no-scroll|noscroll|fixed|height: 100vh|100dvh|svh|vw|vh|position: fixed" styles.css; sed -n '1,140p' styles.css; sed -n '140,220p' styles.css; rg -n "ambient" styles.css; sed -n '220,320p' styles.css; rg -n "landing|auth|shell|page|root|screen|wrapper|hero" styles.css; sed -n '320,520p' styles.css; rg -n "theme-switch" *.html; sed -n '1,200p' index.html; sed -n '1,120p' sign-in.html; sed -n '1,80p' sign-up.html; sed -n '1,80p' consent.html; sed -n '1,80p' privatlivspolitik.html; rg -n "</main>" index.html; tail -n 40 index.html; apply_patch (index.html); date +%F.
- Sikkerhedsimplikationer: Ingen; markup/layout-fix uden ændring af dataadgang.
- Opfølgning: Visuel test i browser at landing, auth og legal sider kan scrolle som forventet.

## 2026-01-13
- Formål: fjerne redundant banner-logo i header-blokke og centrere logo-crop for et mere roligt udtryk.
- Berørte filer: styles.css, docs/activity.md.
- Kommandoer: rg --files; cat docs/activity.md; rg -n "logo|brand" index.html styles.css sygdomslaere.html; sed -n '1240,1465p' styles.css; sed -n '40,140p' index.html; sed -n '360,520p' index.html; rg -n "menu-logo|brand-banner|brand-logo|quiz-logo|result-logo" tests index.html styles.css; rg -n "brand-mark" *.html; sed -n '20,80p' sign-in.html; file Logo.png Banner.png; rg -n "brand-|logo|banner" sygdomslaere.html; sed -n '1,180p' sygdomslaere.html; rg -n "menuLogo|brand-banner|banner" app.js; sed -n '1300,1405p' app.js; rg -n "menuLogo|quizLogo|resultLogo" app.js; sed -n '2020,2105p' app.js; sed -n '340,430p' styles.css; cat agents.md; apply_patch (styles.css); date +%F.
- Sikkerhedsimplikationer: Ingen; kun UI/styling.
- Opfølgning: Visuel verifikation i browser på landing, menu samt auth/legal headers.

## 2026-01-13
- Formål: gøre Apple OAuth-knappen usynlig på sign-in/sign-up indtil loginflowet er klar.
- Berørte filer: sign-in.html, sign-up.html, docs/activity.md.
- Kommandoer: ls; cat docs/activity.md; cat AGENTS.md; rg -n "auth-apple-btn" -S .; sed -n '80,140p' sign-in.html; sed -n '80,140p' sign-up.html; rg -n "oauth\\s+apple|auth-apple-btn|apple" styles.css; sed -n '2200,2255p' styles.css; rg -n "appleBtn|auth-apple-btn" auth.js app.js; sed -n '1,140p' auth.js; sed -n '130,190p' auth.js; sed -n '480,540p' auth.js; sed -n '1120,1185p' app.js; rg -n "auth-apple-btn" tests; rg -n "auth-apple-btn" index.html consent.html; date +%F; tail -n 40 docs/activity.md; apply_patch (sign-in.html, sign-up.html, docs/activity.md).
- Sikkerhedsimplikationer: Ingen; UI-only skjulning uden ændring af auth-flow.
- Opfølgning: Fjern `hidden` når Apple OAuth er klar.

## 2026-01-13
- Formål: aktivere MobilePay for livstidsbetaling i Stripe Checkout (hosted) via samme allowlist som embedded betaling.
- Berørte filer: api/stripe/create-checkout-session.js, tests/stripeCreateCheckoutSession.test.mjs, docs/activity.md.
- Kommandoer: apply_patch (api/stripe/create-checkout-session.js); apply_patch (tests/stripeCreateCheckoutSession.test.mjs); npm test -- tests/stripeCreateCheckoutSession.test.mjs; date +%F.
- Sikkerhedsimplikationer: payment_method_types styres fortsat af server-side allowlist; ingen nye secrets eller endpoints.
- Opfølgning: ingen.

## 2026-01-13
- Formål: nulstille kursustema ved logout og tillade studioskift når en runde er pauset uden at blande sessionen.
- Berørte filer: app.js, tests/courseSwitchLock.test.mjs, docs/activity.md.
- Kommandoer: ls; cat docs/activity.md; cat AGENTS.md; rg -n "theme|sygdom|disease|studio|course" app.js; rg -n "logout|log out|sign out|signOut|sign-out|signOut" app.js auth.js consent.js; sed -n '6520,6705p' app.js; rg -n "data-course|sygdomslaere" styles.css; sed -n '120,240p' styles.css; rg -n "function updateAuthUI|updateAuthUI\\(" app.js; sed -n '4300,4560p' app.js; rg -n "STORAGE_KEYS|lastStudio|course" app.js; sed -n '1,220p' app.js; sed -n '2120,2190p' app.js; rg -n "activeCourse" app.js; rg -n "updateCourseUI\\(|setActiveCourse\\(|applyTheme\\(|init|bootstrap|loadState|initialize" app.js; sed -n '16680,16880p' app.js; rg -n "studioResolved" app.js; sed -n '5280,5355p' app.js; sed -n '5355,5455p' app.js; rg -n "maybeResolveStudioPreference" app.js; sed -n '2680,2825p' app.js; rg -n "data-course|data-theme|theme-toggle" index.html; rg -n "dataset\\.course|data-course" app.js; sed -n '1,160p' index.html; rg -n "data-authenticated" styles.css; sed -n '1,200p' consent.js; rg -n "auth-demo-btn|demo" app.js; sed -n '5060,5165p' app.js; rg -n "buildDemoQuestions" -n app.js; sed -n '4720,4795p' app.js; rg -n "paused-round-note|switch-studio-btn|course switch|courseSwitch|updateCourseSwitchLock" app.js styles.css index.html; sed -n '1870,2005p' app.js; rg -n "pausedRoundNote|paused-round-note" app.js; sed -n '14960,15080p' app.js; rg -n "getSessionCourse|sessionCourse" app.js; sed -n '1780,1865p' app.js; rg -n "start" app.js | rg -n "disabled|sessionActive|sessionPaused|paused"; rg -n "startButtons|start-btn|start round|start-game|startGame" app.js; sed -n '14680,14790p' app.js; rg -n "paused-session|paused" index.html; sed -n '780,840p' index.html; rg -n "active_session|activeSession" app.js; sed -n '2280,2425p' app.js; sed -n '1,240p' api/user-state.js; rg -n "sessionActive = false" app.js; sed -n '13880,14030p' app.js; sed -n '15090,15180p' app.js; sed -n '2560,2655p' app.js; sed -n '2655,2745p' app.js; sed -n '1,240p' tests/courseSwitchLock.test.mjs; sed -n '1,200p' tests/authClient.test.mjs; apply_patch (app.js); apply_patch (tests/courseSwitchLock.test.mjs); npm test -- tests/courseSwitchLock.test.mjs; date +%F.
- Sikkerhedsimplikationer: Ingen; UI-tilstand og klient-side tema-/studioskift justeret uden ændring i dataadgang.
- Opfølgning: afklar om parallelle, persistente pauser pr. studio ønskes (kræver udvidelse af user_state-modellen).

## 2026-01-13
- Formål: justere auth-hero brand-banner kanter ved at fjerne ramme/skygge og reducere border-radius.
- Berørte filer: styles.css, docs/activity.md.
- Kommandoer: rg -n "auth-hero|brand-banner|auth-hero-copy|index__auth-hero-copy" index.html styles.css; sed -n '1380,1505p' styles.css; sed -n '4235,4325p' styles.css; sed -n '40,120p' index.html; view_image Banner.png; apply_patch (styles.css); date +%F.
- Sikkerhedsimplikationer: Ingen; kun UI/styling.
- Opfølgning: Visuel tjek af auth-hero banner i desktop og mobil.

## 2026-01-13
- Purpose: persist user-supplied OpenAI keys server-side (encrypted) to grant Pro access without re-entering, wire AI access checks to stored keys, and update UI copy + tests.
- Files: supabase/schema.sql, api/_lib/userOpenAiKey.js, api/own-key.js, api/_lib/aiGate.js, api/health.js, api/me.js, api/profile.js, api/account/delete.js, access-policy.js, app.js, index.html, tests/accessPolicy.test.mjs, tests/ownKey.test.mjs, README.md, .env, docs/activity.md.
- Commands: ls; ls docs; cat docs/activity.md; rg -n "openai|api key|api_key|openai_key|own key|personal key|key" -S app.js api access-policy.js auth.js index.html; rg -n "own_key|openai|api_key" supabase/schema.sql api app.js; sed -n '1,220p' app.js; sed -n '3600,4300p' app.js; sed -n '5100,6800p' app.js; sed -n '1,220p' api/_lib/aiGate.js; sed -n '1,220p' api/profile.js; sed -n '1,220p' api/me.js; sed -n '1,220p' api/health.js; sed -n '1,220p' supabase/schema.sql; cat .env; apply_patch (multiple files); cat <<'EOF' > api/_lib/userOpenAiKey.js; cat <<'EOF' > api/own-key.js; cat <<'EOF' > tests/ownKey.test.mjs; npm test -- tests/accessPolicy.test.mjs tests/ownKey.test.mjs; git status -s; date +%F.
- Security: user OpenAI keys are encrypted with a server-side secret and stored in a non-client-accessible table; AI access checks now use stored keys without returning them to clients; added rate-limited endpoint for saving/clearing keys.
- Follow-ups: apply `supabase/schema.sql` in Supabase; set `OPENAI_KEY_ENCRYPTION_SECRET` in all environments (Vercel + local) before enabling key storage.

## 2026-01-13
- Purpose: stop the auth hero banner from cropping the logo by letting the brand image scale with its native aspect ratio while keeping a size cap.
- Files: styles.css, docs/activity.md.
- Commands: rg -n "brand-banner.hero" styles.css; sed -n '1400,1455p' styles.css; sed -n '4240,4305p' styles.css; apply_patch (styles.css); tail -n 40 docs/activity.md; date +%F.
- Security: none; styling-only change.
- Follow-ups: visually confirm the hero logo now shows the full artwork on desktop and narrower breakpoints.

## 2026-01-13
- Purpose: let the grade endpoint accept the `sources` array that the studio already includes so auto-bedømmelse stops returning 400s.
- Files: api/grade.js, api/_lib/limits.js, tests/apiValidation.test.mjs, docs/activity.md.
- Commands: npm test -- tests/apiValidation.test.mjs; date +%F.
- Security: validation still rejects unknown fields while now explicitly permitting short reference strings, so payload correctness improves without broadening the surface.
- Follow-ups: monitor grade-related errors in production to catch any additional rejected fields.

## 2026-01-14
- Purpose: make the raw MCQ/kortsvar converters tolerate year headers like `2026 Ordinær` even when contributors forget the dash, so the imported session metadata stays in sync and the year filters do not split a single exam range into two chips.
- Files: scripts/convert_rawdata.py, scripts/convert_kortsvar.py, tests/test_convert_headers.py, README.md, docs/activity.md.
- Commands: python3 -m unittest tests/test_convert_headers.py; date +%F.
- Security: parser docs/tests only; no runtime surface changes.
- Follow-ups: keep using the new header form when adding datasets and rerun the unittest after editing the raw files.

## 2026-01-14
- Purpose: deduplicate default-year chips so `2026` merges with `2026 Ordinær` whenever the same year already has ordinær data, preventing blank-session imports from showing twice.
- Files: app.js, README.md, docs/activity.md.
- Commands: rg -n "buildCounts" app.js; date +%F.
- Security: UI filter change only with no new surface area.
- Follow-ups: re-run the import pipeline/QA to verify the updated counts show under a single ordinær chip; update the docs if other filters need similar dedup logic.

## 2026-01-14
- Purpose: make the account status message and docs explicitly explain how to configure `OPENAI_KEY_ENCRYPTION_SECRET` when key storage reports it is unavailable.
- Files: app.js, README.md, docs/activity.md.
- Commands: apply_patch (app.js, README.md); date +%F.
- Security: message/documentation now call out the required encryption-secret environment variable without exposing any secret values.
- Follow-ups: none.

## 2026-01-21
- Purpose: add Stripe access sync fallback after checkout, show Pro welcome modal + admin test button, and add sync endpoint tests.
- Files: api/stripe/sync-access.js, app.js, index.html, styles.css, tests/stripeSyncAccess.test.mjs, docs/activity.md.
- Commands: rg -n "stripe" api app.js index.html tests; sed -n '1,240p' api/stripe/webhook.js; sed -n '1,260p' api/stripe/create-subscription.js; sed -n '1,260p' api/stripe/create-checkout-session.js; sed -n '6400,7800p' app.js; sed -n '1300,1760p' index.html; sed -n '2070,2245p' index.html; cat vercel.json; rg -n "modal|dialog" app.js index.html styles.css; npm test -- tests/stripeSyncAccess.test.mjs (failed: vitest missing); npm install; npm test -- tests/stripeSyncAccess.test.mjs; date +%F.
- Security: sync endpoint validates IDs, enforces auth + dual rate limits, verifies Stripe customer/metadata before updates; UI modal/admin button are client-only.
- Follow-ups: update Stripe webhook endpoint in the Dashboard to https://biologistudio.dk/api/stripe/webhook and set STRIPE_WEBHOOK_SECRET; verify live checkout upgrade shows the Pro welcome dialog.

## 2026-01-23
- Purpose: add Stripe webhook status endpoint and ops docs so mis-pointed webhook URLs can be re-enabled safely.
- Files: api/stripe/webhook-status.js, tests/stripeWebhookStatus.test.mjs, README.md, docs/security-contracts.md, docs/activity.md.
- Commands: cat docs/activity.md; sed -n '1,260p' api/stripe/webhook.js; cat vercel.json; sed -n '1,260p' api/stripe/create-checkout-session.js; npm test -- tests/stripeWebhookStatus.test.mjs tests/stripeWebhook.test.mjs; date +%F.
- Security: new public status endpoint is rate-limited, avoids secrets, and only reports readiness + expected URL; webhook signature verification stays unchanged.
- Follow-ups: set the Stripe Dashboard webhook URL to https://biologistudio.dk/api/stripe/webhook with the live `STRIPE_WEBHOOK_SECRET`, re-enable deliveries, and fire a test event once enabled.

## 2026-01-24
- Purpose: normalize human biology category aliases across import parsers and UI, and add SQL to fix existing Supabase category labels.
- Files: app.js, api/_lib/rawdataParser.js, scripts/human_categories.py, scripts/convert_rawdata.py, scripts/convert_kortsvar.py, scripts/build_studio_pipeline.py, tests/rawdataParser.test.mjs, supabase/fix_human_categories.sql, docs/activity.md.
- Commands: rg -n "category|categories|emner|topic|subject|chip" -S scripts api app.js data supabase docs studio-engine.js; sed -n '1,240p' scripts/import_rawdata.py; sed -n '1,260p' scripts/convert_sygdomslaere.py; sed -n '1,240p' api/_lib/rawdataParser.js; sed -n '540,880p' api/_lib/rawdataParser.js; sed -n '1,240p' scripts/build_studio_pipeline.py; sed -n '300,480p' scripts/build_studio_pipeline.py; sed -n '1,200p' api/data/questions.js; sed -n '7800,8400p' app.js; sed -n '320,700p' app.js; sed -n '1,200p' tests/rawdataParser.test.mjs; npm test -- tests/rawdataParser.test.mjs; date +%F.
- Security: import parsing now enforces canonical categories to prevent unvetted topics from entering datasets; no secrets added or exposed.
- Follow-ups: run `supabase/fix_human_categories.sql` in Supabase to normalize existing dataset snapshots and study items, then verify category chips in the UI.

## 2026-01-24
- Purpose: refactor UI/UX per uiux.csv with new tokens/variants, reduced card styling, clearer microcopy, and stronger a11y/error handling without changing flows.
- Files: styles.css, index.html, app.js, auth.js, consent.js, sign-in.html, sign-up.html, tests/authClient.test.mjs, docs/activity.md.
- Commands: rg --files; sed -n (styles.css/index.html/app.js/auth.js/consent.js); python3 - <<'PY' (uiux.csv parse); rg -n (uiux.csv/strings/selectors); npm test (failed in tests/authClient.test.mjs + consentScript focus); npm test (pass); date +%F.
- Security: no endpoint or auth logic changes; improved aria-live/aria-describedby focus handling and clearer error guidance.
- Follow-ups: visually QA landing/auth/menu/admin/billing screens for spacing/contrast; confirm focus behavior on errors and mobile tap targets.
