# KU MCQ Game Lab

En simpel, men designfokuseret webapp til at øve multiple choice-spørgsmål fra tidligere KU-eksamener i sundhed og informatik.

## Funktioner
- 231 spørgsmål på tværs af flere årgange og emner.
- 24 tilfældige spørgsmål per runde.
- Pointsystem: **+3** for korrekt, **-1** for forkert, **0** for at springe over.
- Øjeblikkelig farve-feedback, gennemgang af dine svar og gemt bedste score i browseren.

## Kom i gang
1. Start en simpel server i projektmappen:
   ```bash
   python -m http.server 8000
   ```
2. Åbn http://localhost:8000 i din browser og tryk “Start spil”.

## Data
- Rå spørgsmål ligger i `rawdata`.
- Kør `python scripts/convert_rawdata.py` for at regenerere `data/questions.json`.
