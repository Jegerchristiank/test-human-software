from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List


ROOT_PATH = Path(__file__).resolve().parent.parent
RAW_PATH = ROOT_PATH / "rawdata-sygdomslaere.txt"
OUTPUT_PATH = ROOT_PATH / "data" / "sygdomslaere.json"

RESERVED_COLUMNS = {"sygdom", "tyngde", "emne", "prioritet"}
SECTION_ORDER = [
    "Nøglepunkter",
    "Definition",
    "Forekomst",
    "Patogenese",
    "Ætiologi",
    "Symptomer og fund",
    "Diagnostik",
    "Følgetilstande",
    "Behandling",
    "Forebyggelse",
    "Prognose",
]

PRIORITY_ALIASES = {
    "høj": "high",
    "hoej": "high",
    "high": "high",
    "mellem": "medium",
    "middel": "medium",
    "medium": "medium",
    "lav": "low",
    "low": "low",
    "ikke pensum": "excluded",
    "ikke-pensum": "excluded",
    "udgået": "excluded",
}
PRIORITY_LABELS = {
  "high": "Høj",
  "medium": "Mellem",
  "low": "Lav",
  "excluded": "Ikke pensum",
}

CATEGORY_ALIASES = {
    "bevæge": "Bevægelsesapparatet sygdomme",
    "bevægeapparatets sygdomme": "Bevægelsesapparatet sygdomme",
    "bevægelsesapparatet sygdomme": "Bevægelsesapparatet sygdomme",
    "gynækologi og obstetrik": "Gynækologiske sygdomme og obstetrik",
    "nyre- og urinsvejssygdomme": "Nyre og urinvejssygdomme",
}


@dataclass
class Section:
    title: str
    content: str


@dataclass
class Disease:
    name: str
    category: str
    weight: str
    priority: str
    sections: List[Section]


def clean_text(value: str) -> str:
    value = value.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()


def slugify(text: str) -> str:
    lowered = text.strip().lower()
    lowered = re.sub(r"[^a-z0-9æøå\s-]", "", lowered)
    lowered = re.sub(r"\s+", "-", lowered).strip("-")
    return lowered


def normalize_priority(value: str) -> str:
    cleaned = clean_text(value).lower()
    if not cleaned:
        return "medium"
    return PRIORITY_ALIASES.get(cleaned, "medium")


def normalize_category(value: str) -> str:
    cleaned = clean_text(value)
    if not cleaned:
        return "Ukendt"
    alias = CATEGORY_ALIASES.get(cleaned.lower())
    return alias or cleaned


def normalize_header(header: str) -> str:
    return clean_text(header).lower()


def read_tsv(path: Path) -> List[List[str]]:
    with path.open("r", encoding="utf-8") as handle:
        reader = csv.reader(handle, delimiter="\t")
        rows = [row for row in reader if any(cell.strip() for cell in row)]
    return rows


def align_row(row: List[str], header_len: int) -> List[str]:
    if len(row) == header_len:
        return row
    if len(row) < header_len:
        return row + [""] * (header_len - len(row))
    merged = row[: header_len - 1] + [" ".join(row[header_len - 1 :])]
    return merged


def parse_rows(rows: List[List[str]]) -> tuple[List[str], List[Dict[str, str]]]:
    if not rows:
        return [], []
    header = [normalize_header(cell) for cell in rows[0]]
    mapped_rows: List[Dict[str, str]] = []
    for raw_row in rows[1:]:
        aligned = align_row(raw_row, len(header))
        entry = {
            header[idx]: clean_text(cell) for idx, cell in enumerate(aligned) if idx < len(header)
        }
        mapped_rows.append(entry)
    return header, mapped_rows


def extract_sections(entry: Dict[str, str], header: List[str]) -> List[Section]:
    sections = []
    for column in header:
        if column in RESERVED_COLUMNS or not column:
            continue
        title = column.capitalize()
        if column == "symptomer og fund":
            title = "Symptomer og fund"
        elif column == "følgetilstande":
            title = "Følgetilstande"
        elif column == "ætiologi":
            title = "Ætiologi"
        content = entry.get(column, "")
        if content:
            sections.append(Section(title=title, content=content))
    return sections


def sort_sections(sections: List[Section]) -> List[Section]:
    order = {label: index for index, label in enumerate(SECTION_ORDER)}
    return sorted(
        sections,
        key=lambda section: (order.get(section.title, 999), section.title.lower()),
    )


def build_payload(rows: List[Dict[str, str]], header: List[str]) -> Dict[str, object]:
    diseases: List[Dict[str, object]] = []
    weights: Dict[str, int] = {}
    categories: Dict[str, int] = {}

    for entry in rows:
        name = entry.get("sygdom", "")
        if not name:
            continue
        category = normalize_category(entry.get("emne", ""))
        weight = entry.get("tyngde", "")
        priority_raw = entry.get("prioritet", "")
        priority = normalize_priority(priority_raw)
        sections = extract_sections(entry, header)
        sections = sort_sections(sections)

        if category:
            categories[category] = categories.get(category, 0) + 1
        if weight:
            weights[weight] = weights.get(weight, 0) + 1

        diseases.append(
            {
                "id": slugify(name),
                "name": name,
                "category": category,
                "weight": weight,
                "priority": priority,
                "priorityLabel": PRIORITY_LABELS.get(priority, "Mellem"),
                "sections": [
                    {"title": section.title, "content": section.content}
                    for section in sections
                ],
            }
        )

    payload = {
        "meta": {
            "source": RAW_PATH.name,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "sectionOrder": SECTION_ORDER,
            "priorities": list(PRIORITY_LABELS.keys()),
            "weights": sorted(weights.keys(), key=str.lower),
            "categories": sorted(categories.keys(), key=str.lower),
        },
        "diseases": diseases,
    }
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert sygdomslære TSV to JSON.")
    parser.add_argument("--input", type=Path, help="Path to raw sygdomslære txt file.")
    parser.add_argument("--output", type=Path, help="Destination for sygdomslære.json.")
    args = parser.parse_args()

    input_path = args.input or RAW_PATH
    output_path = args.output or OUTPUT_PATH
    if not input_path.exists():
        raise FileNotFoundError(f"Raw data not found: {input_path}")

    rows = read_tsv(input_path)
    header, mapped = parse_rows(rows)
    payload = build_payload(mapped, header)
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Parsed {len(payload['diseases'])} diseases.")
    print(f"Saved structured data to {output_path}")


if __name__ == "__main__":
    main()
