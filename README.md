# Human Biologi Studio

En designfokuseret webapp til at øve både multiple choice og kortsvar fra tidligere eksamener i sundhed og informatik.

## Funktioner
- MCQ + kortsvar i samme session med 50/50 vægtning.
- 7-trinsskala beregnet ud fra samlet procent.
- Pointsystem for MCQ: **+3** korrekt, **-1** forkert, **0** spring over.
- Kortsvar med manuel point, valgfri AI-bedømmelse og facit.
- AI-figurbeskrivelser som facit, når svaret kun henviser til en figur (valgfrit).
- Skitse-analyse: upload din tegning og få en kort AI-vurdering (valgfrit).
- AI-forklaringer for forkerte svar på resultatskærmen (hentes på klik).
- Uendelig mode: fortsæt med nye spørgsmål indtil du afslutter.
- Øjeblikkelig feedback, gennemgang af dine svar og gemt bedste score lokalt.

## Sygdomslære Studio
- Kør `sygdomslaere.html` (redirecter til `index.html?studio=sygdomslaere`) for sygdomslære-oplevelsen.
- Byg kortsvars-sessioner ud fra pensum, prioritet, sektioner og tyngde.

## Kom i gang (lokalt)
1. Installer afhængigheder: `npm install`
2. Start appen:
   - Kun frontend: `python3 -m http.server 8000`
   - Frontend + API: `vercel dev` (kræver Vercel CLI)
3. Åbn:
   - http://localhost:8000 for statisk frontend
   - http://localhost:3000 for Vercel dev
4. Demo: Hvis backend ikke kører, kan du fortsætte i demo mode uden login (AI og betaling er deaktiveret).

## Login
- Auth håndteres via Supabase Auth (email/password + Google/Apple OAuth).
- Konfigurér OAuth providers og redirect URLs i Supabase Dashboard.

## Auth Setup
- Miljøvariabler (server): `SUPABASE_URL` + `SUPABASE_ANON_KEY` (eller `SUPABASE_PUBLISHABLE_KEY`).
- Supabase Dashboard → Auth → URL Configuration:
  - Site URL: produktionens origin (fx `https://app.example`).
  - Additional Redirect URLs (lokal dev/preview):
    - `http://localhost:8000/index.html`
    - `http://localhost:3000/index.html`
    - tilføj øvrige index-paths som bruges via `redirect`-parametre.
- OAuth providers (Google/Apple): aktivér i Supabase Auth og brug callback/redirect URL fra Supabase.

## Online setup (Supabase + Stripe + Vercel)
1. Supabase:
   - Run SQL from `supabase/schema.sql` in the Supabase SQL Editor (schema + policies).
   - Generate pipeline inserts with `python3 scripts/build_studio_pipeline.py` (writes `supabase/studio_pipeline.sql`).
   - Apply `supabase/studio_pipeline.sql` (Supabase CLI or SQL Editor chunks).
   - Alternativ: kør `node scripts/import_studio_pipeline.js --chunk-size 200` for API-import (kræver `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` i `.env`).
   - If SQL Editor limits apply, run `python3 scripts/build_studio_pipeline.py --chunk-size 200` and paste chunk files from `supabase/studio_pipeline_chunks/` in order.
   - If you already ran the old schema file, rerun `supabase/schema.sql` to ensure `user_state` and `rate_limits` exist.
2. Stripe:
   - Opret et produkt og en subscription price (179 kr/md).
   - Opret et produkt og en engangs price (1.500 kr).
   - Tilføj webhook til `/api/stripe/webhook`.
3. Vercel:
   - Tilføj miljøvariabler fra `.env` i Vercel Dashboard.
   - Deploy projektet via GitHub.

## Fejlfinding
- Hvis du ser "Backend offline" i produktion, åbn `https://<din-app>/api/config` og læs fejlbeskeden.
- Sørg for at Vercel har `SUPABASE_URL` + `SUPABASE_ANON_KEY`/`SUPABASE_PUBLISHABLE_KEY` sat i Environment Variables (Production + Preview).
- Tjek at Vercel "Output Directory" er tom eller `.` så `/api/*` deployes.

## Miljøvariabler
Minimum for online drift:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (eller `SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `STRIPE_LIFETIME_PRICE_ID`
- `OPENAI_API_KEY`
- `STRIPE_BASE_URL` (påkrævet hvis Stripe er aktiveret)
- `STRIPE_PORTAL_CONFIGURATION_ID` (valgfri)
- `TRUST_PROXY` (valgfri, brug `true` hvis din platform sætter sikre forwarded headers)
- `TRUST_PROXY_HEADERS` (valgfri, kommasepareret liste, default `x-forwarded-for`)
- `CORS_ALLOW_ORIGINS` (valgfri, kommasepareret liste over fulde origins til API CORS allowlist)
- `ADMIN_EMAILS` (komma-separeret liste over admin-e-mails)
- `ADMIN_IMPORT_ENABLED` (sæt til `true` for at aktivere admin-import i API)
- `PYTHON_BIN` (valgfri, sti til python hvis `python3` ikke er tilgængelig)

Stripe nøgler:
- `STRIPE_PRICE_ID` findes i Stripe Dashboard → Products → Price (starter med `price_`) og skal være recurring (abonnement).
- `STRIPE_LIFETIME_PRICE_ID` findes i Stripe Dashboard → Products → Price (starter med `price_`) og skal være engangsbetaling.
- `STRIPE_WEBHOOK_SECRET` findes i Stripe Dashboard → Developers → Webhooks (starter med `whsec_`).
- `STRIPE_BASE_URL` er påkrævet og skal være din app-URL (bruges til success/cancel).
- `STRIPE_PORTAL_CONFIGURATION_ID` er valgfri og bruges til Stripe Customer Portal.

## Sync af settings + historik
- Appen synkroniserer settings, historik, fejl og performance til `user_state` tabellen i Supabase.
- Synkronisering sker i baggrunden efter login og ved ændringer i lokal data.

## Rate limiting
- API-kald til AI, konto og betaling rate-limites via `rate_limits` tabellen i Supabase.

Tip: I testmode skal du bruge `sk_test_` / `pk_test_` nøgler fra Stripe.

## Tests
- Kør `npm test` for unit tests.

## Data
- MCQ rådata ligger i `rawdata-mc` (legacy fallback: `rawdata`).
- Kortsvar rådata ligger i `rawdata-kortsvar`.
- Kør `python3 scripts/convert_rawdata.py` for at regenerere `data/questions.json`.
- Kør `python3 scripts/convert_kortsvar.py` for at regenerere `data/kortsvar.json`.
- Sygdomslære pensum ligger i `rawdata-sygdomslaere.txt` (bruges af Sygdomslære Studio).
- Kør `python3 scripts/convert_sygdomslaere.py` for at regenerere `data/sygdomslaere.json`.
- Importfiler ligger i `imports/` (én pr. dataset) og bruges af append/replace flowet.
- Kør `python3 scripts/import_rawdata.py --type <mcq|kortsvar|sygdomslaere> --mode <append|replace>` for at importere et nyt udsnit og regenerere `data/*.json`.
- Duplicater bevares med vilje (gentagne eksamensspørgsmål skal fremgå).
- Ved sygdomslære ignoreres header-rækken under append; ved replace tilføjes header automatisk hvis den mangler.
- Appen loader som standard studiemateriale fra `data/*.json`, så DB-pipeline er valgfri for normal drift.
- `data/figure_captions.json` er en valgfri cache af AI-figurbeskrivelser.
- Billeder til kortsvar ligger i `billeder/opgaver` og navngives som `YYYY[-syg]-OO-L[variant].*` (fx `2025-06-a.jpg`).

## AI-bedømmelse
- AI-kald går gennem `/api/*` serverless endpoints (Vercel).
- Opret `.env` i projektroden og udfyld:
  - `OPENAI_API_KEY=...`
  - `OPENAI_MODEL=gpt-5.2` (kan ændres)
  - `OPENAI_TTS_MODEL=tts-1` (valgfri, styrer oplæsning)
  - `OPENAI_VISION_MODEL=gpt-4.1-mini` (valgfri, bruges til figurbeskrivelser/skitse-analyse)

## Figur-audit (valgfri)
- Kør `python3 scripts/audit_figures.py` for at generere:
  - `data/figure_captions.json` (beskrivelser pr. billede)
  - `data/figure_audit.json` (rapport over potentielle mismatch)
