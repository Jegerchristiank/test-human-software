from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from human_categories import normalize_human_category

ROOT_PATH = Path(__file__).resolve().parent.parent
RAW_PATH = ROOT_PATH / "rawdata-mc"
LEGACY_RAW_PATH = ROOT_PATH / "rawdata"
OUTPUT_PATH = ROOT_PATH / "data" / "questions.json"


@dataclass
class Option:
    label: str
    text: str
    is_correct: bool


@dataclass
class Question:
    year: int
    number: int
    session: Optional[str]
    category: str
    text: str
    options: List[Option]

    @property
    def correct_label(self) -> str:
        for option in self.options:
            if option.is_correct:
                return option.label
        raise ValueError(f"No correct option found for question {self.number} ({self.category})")


QUESTION_HEADER_RE = re.compile(r"^Spørgsmål\s+(\d+)\s+[-–]\s+(.*)$", re.IGNORECASE)
YEAR_HEADER_RE = re.compile(r"^(\d{4})(?:\s*(?:[-–]\s*|\s+)(.*\S.*))?\s*$")
CORRECT_RE = re.compile(r"\(korrekt\)", re.IGNORECASE)


def parse_raw_data(raw_text: str) -> List[Question]:
    lines = [line.rstrip("\n") for line in raw_text.splitlines()]
    questions: List[Question] = []
    current_year: Optional[int] = None
    current_session: Optional[str] = None
    i = 0

    def normalize_session(label: str) -> Optional[str]:
        cleaned = label.strip().lower()
        if not cleaned:
            return None
        if "syge" in cleaned:
            return "sygeeksamen"
        if "ordin" in cleaned:
            return "ordinær"
        return cleaned

    while i < len(lines):
        line = lines[i].strip()

        if not line:
            i += 1
            continue

        year_match = YEAR_HEADER_RE.match(line)
        if year_match:
            current_year = int(year_match.group(1))
            current_session = normalize_session(year_match.group(2) or "")
            i += 1
            continue

        header_match = QUESTION_HEADER_RE.match(line)
        if header_match:
            if current_year is None:
                raise ValueError("Encountered a question header before a year header")

            number = int(header_match.group(1))
            raw_category = header_match.group(2).strip()
            try:
                category = normalize_human_category(raw_category)
            except ValueError as exc:
                raise ValueError(
                    f"Unknown category '{raw_category}' for question {number}"
                ) from exc
            i += 1

            question_lines: List[str] = []
            while i < len(lines):
                possible_option = lines[i]
                if re.match(r"^\s*[A-D]\.", possible_option):
                    break
                if possible_option.strip():
                    question_lines.append(possible_option.strip())
                i += 1

            if not question_lines:
                raise ValueError(f"Missing question text for question {number} ({category})")

            options: List[Option] = []
            correct_found = False
            for expected_label in ["A", "B", "C", "D"]:
                if i >= len(lines):
                    raise ValueError(f"Missing option {expected_label} for question {number} ({category})")
                option_line = lines[i].strip()
                option_match = re.match(rf"^{expected_label}\.\s*(.*)$", option_line)
                if not option_match:
                    raise ValueError(f"Unexpected option format near question {number}: '{option_line}'")

                option_text = option_match.group(1).strip()
                is_correct = bool(CORRECT_RE.search(option_text))
                option_text = CORRECT_RE.sub("", option_text).strip()
                options.append(Option(label=expected_label, text=option_text, is_correct=is_correct))
                correct_found = correct_found or is_correct
                i += 1

            if not correct_found:
                raise ValueError(f"No correct option flagged for question {number} ({category})")

            questions.append(
                Question(
                    year=current_year,
                    number=number,
                    session=current_session,
                    category=category,
                    text=" ".join(question_lines),
                    options=options,
                )
            )
            continue

        i += 1

    return questions


def write_questions(questions: List[Question], output_path: Path) -> None:
    serializable = [
        {
            "year": question.year,
            "number": question.number,
            "session": question.session,
            "category": question.category,
            "text": question.text,
            "options": [
                {"label": option.label, "text": option.text, "isCorrect": option.is_correct}
                for option in question.options
            ],
            "correctLabel": question.correct_label,
        }
        for question in questions
    ]
    output_path.write_text(json.dumps(serializable, ensure_ascii=False, indent=2), encoding="utf-8")


def resolve_input_path(candidate: Optional[Path]) -> Path:
    if candidate:
        return candidate
    if RAW_PATH.exists():
        return RAW_PATH
    if LEGACY_RAW_PATH.exists():
        return LEGACY_RAW_PATH
    return RAW_PATH


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert raw MCQ data to JSON.")
    parser.add_argument("--input", type=Path, help="Path to raw MCQ file.")
    parser.add_argument("--output", type=Path, help="Destination for questions.json.")
    args = parser.parse_args()

    input_path = resolve_input_path(args.input)
    output_path = args.output or OUTPUT_PATH
    if not input_path.exists():
        raise FileNotFoundError(f"Raw data not found: {input_path}")

    raw_text = input_path.read_text(encoding="utf-8")
    questions = parse_raw_data(raw_text)
    write_questions(questions, output_path)
    unique_years = sorted({q.year for q in questions})
    print(
        f"Parsed {len(questions)} questions across {len(unique_years)} years: "
        f"{', '.join(str(year) for year in unique_years)}"
    )
    print(f"Saved structured data to {output_path}")


if __name__ == "__main__":
    main()
