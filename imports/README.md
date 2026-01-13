# Import files

This folder holds the three import files used for local, incremental exam ingestion.
In production, the admin import flow writes directly to Supabase `dataset_snapshots` instead.

- `imports/rawdata-mc.txt` -> MCQ raw data (same format as `rawdata-mc`).
- `imports/rawdata-kortsvar.txt` -> short answer raw data (same format as `rawdata-kortsvar`).
- `imports/rawdata-sygdomslaere.txt` -> sygdomslaere TSV (same columns as `rawdata-sygdomslaere.txt`).

Workflow (append or replace) for local CLI:
1. Paste a new exam chunk into the relevant import file.
2. Run `python3 scripts/import_rawdata.py --type <mcq|kortsvar|sygdomslaere> --mode <append|replace>`.
3. The script updates the rawdata file and regenerates the matching `data/*.json`.

Notes:
- Duplicates are kept (some exams intentionally repeat questions).
- For sygdomslaere: if you include the header row, it will be ignored on append.
- Clear the import file manually after a successful import if you want to avoid reusing it.
