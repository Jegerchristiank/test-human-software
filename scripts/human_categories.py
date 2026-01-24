from __future__ import annotations

import re

CANONICAL_CATEGORIES = [
    "Cellebiologi",
    "Metabolisme (energiomsætning og temperaturregulering)",
    "Nervesystemet og sanserne",
    "Endokrinologi",
    "Bevægeapparatet",
    "Blodet og immunsystemet",
    "Lunger",
    "Mave-tarm og lever-galde",
    "Reproduktion",
    "Hjerte-kredsløb",
    "Nyrer",
]

CANONICAL_LOOKUP = {label.lower(): label for label in CANONICAL_CATEGORIES}

ALIASES = {
    "anatomi": "Bevægeapparatet",
    "bevægeapparatet": "Bevægeapparatet",
    "skelettet": "Bevægeapparatet",
    "skeletmuskulatur": "Bevægeapparatet",
    "mekaniske egenskaber af tværstribet muskulatur (skeletmuskulatur)":
        "Bevægeapparatet",
    "cellebiologi": "Cellebiologi",
    "cellens byggesten": "Cellebiologi",
    "cellulære transportmekanismer": "Cellebiologi",
    "histologi": "Cellebiologi",
    "histologi / anatomi": "Cellebiologi",
    "metabolisme": "Metabolisme (energiomsætning og temperaturregulering)",
    "den kemiske basis for liv": "Metabolisme (energiomsætning og temperaturregulering)",
    "mitokondriet": "Metabolisme (energiomsætning og temperaturregulering)",
    "cellebiologi – mitochondriet": "Metabolisme (energiomsætning og temperaturregulering)",
    "nedbrydning af glukose": "Metabolisme (energiomsætning og temperaturregulering)",
    "grundlæggende kemi og fysik – proteiner": "Metabolisme (energiomsætning og temperaturregulering)",
    "termoregulering": "Metabolisme (energiomsætning og temperaturregulering)",
    "temperaturregulering": "Metabolisme (energiomsætning og temperaturregulering)",
    "kroppens temperaturregulering": "Metabolisme (energiomsætning og temperaturregulering)",
    "negativ feedback og temperaturregulering": "Metabolisme (energiomsætning og temperaturregulering)",
    "nervesystemet": "Nervesystemet og sanserne",
    "sanserne": "Nervesystemet og sanserne",
    "lugtesansen": "Nervesystemet og sanserne",
    "smerte": "Nervesystemet og sanserne",
    "endokrinologi": "Endokrinologi",
    "hormoner": "Endokrinologi",
    "hormoner – hypofysen": "Endokrinologi",
    "binyren": "Endokrinologi",
    "blodet": "Blodet og immunsystemet",
    "blod og immunsystem": "Blodet og immunsystemet",
    "blod og immunsystemet": "Blodet og immunsystemet",
    "blodet og immunsystemet": "Blodet og immunsystemet",
    "immunsystemet": "Blodet og immunsystemet",
    "lymfesystemet": "Blodet og immunsystemet",
    "respiration": "Lunger",
    "lunger": "Lunger",
    "lungefysiologi": "Lunger",
    "respirationsfysiologi": "Lunger",
    "respirationssystemet": "Lunger",
    "det respiratoriske system": "Lunger",
    "åndedrættet": "Lunger",
    "ventilation": "Lunger",
    "respirationsorganerne": "Lunger",
    "respirationsorganerne – lungevolumen": "Lunger",
    "lungefysiologi – alveolen og den respiratoriske membran": "Lunger",
    "fordøjelse": "Mave-tarm og lever-galde",
    "fordøjelseskanalen": "Mave-tarm og lever-galde",
    "fordøjelsessystemet": "Mave-tarm og lever-galde",
    "fordøjelsessystemet – leveren": "Mave-tarm og lever-galde",
    "mave-tarmkanalen": "Mave-tarm og lever-galde",
    "mave-tarmkanalen – tyndtarmen": "Mave-tarm og lever-galde",
    "tyndtarmen": "Mave-tarm og lever-galde",
    "leverens portåresystem": "Mave-tarm og lever-galde",
    "lever og kredsløb": "Mave-tarm og lever-galde",
    "reproduktion": "Reproduktion",
    "reproduktion (forplantning)": "Reproduktion",
    "positiv feedback og generering af veer": "Reproduktion",
    "mælkeproduktion": "Reproduktion",
    "kredsløb": "Hjerte-kredsløb",
    "kredsløbet": "Hjerte-kredsløb",
    "kredsløb/respiration": "Hjerte-kredsløb",
    "hjertekredsløb": "Hjerte-kredsløb",
    "hjerte og kredsløb": "Hjerte-kredsløb",
    "hjertet": "Hjerte-kredsløb",
    "hjertet og lungerne": "Hjerte-kredsløb",
    "blodkar": "Hjerte-kredsløb",
    "blodtryksregulering": "Hjerte-kredsløb",
    "nyrer": "Nyrer",
    "nyren": "Nyrer",
    "nyrer og urinveje": "Nyrer",
    "syre-base": "Nyrer",
    "syre-base-regulering": "Nyrer",
}


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def normalize_human_category(value: str) -> str:
    cleaned = clean_text(value)
    if not cleaned:
        raise ValueError("Missing category value")
    lowered = cleaned.lower()
    if lowered in ALIASES:
        return ALIASES[lowered]
    canonical = CANONICAL_LOOKUP.get(lowered)
    if canonical:
        return canonical
    raise ValueError(f"Unknown category: {cleaned}")
