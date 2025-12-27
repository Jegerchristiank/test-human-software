# Human Biologi Studio

En designfokuseret webapp til at øve både multiple choice og kortsvar fra tidligere eksamener i sundhed og informatik (Københavns Universitet).

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

## Kom i gang
1. Start en server i projektmappen:
   - Uden AI: `python3 -m http.server 8000`
   - Med AI: `env -u OPENAI_API_KEY -u OPENAI_MODEL python3 scripts/dev_server.py`
2. Åbn http://localhost:8000 i din browser og tryk “Byg runde” eller “Hurtig start”.

## Data
- MCQ rådata ligger i `rawdata`.
- Kortsvar rådata ligger i `rawdata-kortsvar`.
- Kør `python3 scripts/convert_rawdata.py` for at regenerere `data/questions.json`.
- Kør `python3 scripts/convert_kortsvar.py` for at regenerere `data/kortsvar.json`.
- `data/figure_captions.json` er en valgfri cache af AI-figurbeskrivelser.
- Billeder til kortsvar ligger i `billeder/opgaver` og navngives som `YYYY[-syg]-OO-L[variant].*` (fx `2025-06-a.jpg`).

## AI-bedømmelse
- Opret `.env` i projektroden og udfyld:
  - `OPENAI_API_KEY=...`
  - `OPENAI_MODEL=gpt-5.2` (kan ændres)
  - `OPENAI_TTS_MODEL=tts-1` (valgfri, styrer oplæsning)
  - `OPENAI_VISION_MODEL=gpt-4.1-mini` (valgfri, bruges til figurbeskrivelser/skitse-analyse)
- Start derefter `python3 scripts/dev_server.py` for at få `/api/grade` og `/api/explain`.
- Fejlsøgning: En 401-fejl betyder typisk forkert eller inaktiv API-nøgle.

## Figur-audit (valgfri)
- Kør `python3 scripts/audit_figures.py` for at generere:
  - `data/figure_captions.json` (beskrivelser pr. billede)
  - `data/figure_audit.json` (rapport over potentielle mismatch)
