# Studio Engine Contracts

## Adfaerds-spec (Sygdomslaere Studio)
- TaskType: Alle sygdomslaere-delsporgsmaal og grupper er `case_structured`.
- Domæner: Fast domæneliste bruges til struktur (Definition, Forekomst, Patogenese, Ætiologi, Symptomer og fund, Diagnostik, Følgetilstande, Behandling, Forebyggelse, Prognose).
- Hint-niveauer:
  - 0: Ingen hints vises.
  - 1: Nøgleord udtrækkes fra modelbesvarelsen.
  - 2: Forklarende hint med domæne-retning + nøgleord.
  - 3: Mini-modelsvar (kort uddrag).
- Adaptiv progression: Hint-niveau sættes ud fra de seneste 3 sessioner for Sygdomslaere (shortPercent/overallPercent). Niveau falder i takt med højere historisk score.
- Capabilities: MCQ og drawing/skitse er deaktiveret for Sygdomslaere.

## Komponenter og logik
- `studio-engine.js`: Kontrakter, domænelister, progression og struktureret hint-generator.
- `studio-policy.js`: Compatibility wrapper som eksponerer `window.studioPolicy` og videresender til Studio Engine kontrakten.
- `app.js`: Bruger kontrakten via `window.studioPolicy`, tilfoejer `taskType`/`domain` til sygdomslaere-spoergsmaal, og anvender `sessionProfile` til hint-niveau.
- `index.html`: Loader `studio-policy.js` og `studio-engine.js` før `app.js`.
- `data/sygdomslaere.json`: Sektionstitler matcher domænerne og bruges som prompt/label.
- Local state: Session-historik i `ku_mcq_history` bruges til progression; `sessionProfile` gemmer aktivt hint-niveau.

## Kontrakter og afhaengigheder
### StudioPolicy (runtime)
`window.studioPolicy.getStudioPolicy(courseId)` returnerer:
- `studioType`, `taskType`, `domains`, `hints`, `progression`
- `scoringPolicy` (id, label, allowTypes, weights, shortFailRatio)
- `capabilities` (allowMcq, allowShort, allowSketch, allowShuffleOptions, allowAutoFigureCaptions, hintMode)

### Afhaengigheder
- `studio-engine.js` (kontrakt og helper-funktioner)
- `studio-policy.js` (runtime wrapper og test-eksport)
- `index.html` (script-order for Studio Engine kontrakter)
- `app.js` (integration, UI-gating, hint-flow)
- `data/sygdomslaere.json` (domæne/sektion-tekst)
- LocalStorage: `ku_mcq_history` (session-historik)

## Acceptance criteria
- Sygdomslaere Studio viser kun kortsvar; MCQ-toggles og MCQ-score er skjult/disabled.
- Skitse/drawing UI er ikke tilgaengelig for Sygdomslaere (ingen sketch-panel eller modal aktivering).
- Sygdomslaere-sporgsmaal har `taskType: case_structured` og domænelabel pr. sektion.
- Hint-niveauer 0-3 fungerer som beskrevet og bruger kun lokal, struktureret logik (ingen AI-kald).
- Hint-niveau tilpasses ud fra de seneste 3 Sygdomslaere-sessioner.
