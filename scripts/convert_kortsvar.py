from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

from human_categories import normalize_human_category
ROOT_PATH = Path(__file__).resolve().parent.parent
RAW_PATH = ROOT_PATH / "rawdata-kortsvar"
OUTPUT_PATH = ROOT_PATH / "data" / "kortsvar.json"
IMAGES_PATH = ROOT_PATH / "billeder" / "opgaver"

YEAR_RE = re.compile(
    r"^(?P<year>\d{4})(?:\s*(?:[-–]\s*|\s+)(?P<session>.*\S.*))?\s*$",
    re.IGNORECASE,
)
OPGAVE_RE = re.compile(r"^Opgave\s+(?P<number>\d+)\.?\s*(?P<title>.*)$", re.IGNORECASE)
HOVEDEMN_RE = re.compile(r"^Hovedemne\s+(?P<number>\d+)\s*[:–-]\s*(?P<title>.*)$", re.IGNORECASE)
SUBQ_RE = re.compile(r"^(?P<label>[A-Za-z])\)\s*(?P<text>.*)$")
UNDERSPOERG_RE = re.compile(
    r"^Underspørgsmål\s+(?P<number>\d+)\s*[-–]\s*(?:(?P<label>[A-Za-z])\)\s*)?(?P<text>.*)$",
    re.IGNORECASE,
)
HOVEDEMN_TITLE_RE = re.compile(r"^Hovedemne\s+\d+\s*[:–-]\s*", re.IGNORECASE)

FIGURE_CUE_RE = re.compile(r"\b(figur|figurer|skitse|tegning|diagram|illustration)\b", re.IGNORECASE)
REFERENCE_RE = re.compile(r"^(Pensum:|\(?P\.|\(?Fig\.|Fig\.|Figurer|Figur|p\.|P\.)", re.IGNORECASE)
IMAGE_NAME_RE = re.compile(
    r"^(?P<year>\d{4})(?P<session>syg)?-(?P<opgave>\d{2})-(?P<label>[a-zA-Z])(?P<variant>\d+)?$",
    re.IGNORECASE,
)


@dataclass
class ShortQuestion:
    year: int
    session: Optional[str]
    opgave: int
    opgave_title: str
    opgave_intro: Optional[str]
    label: Optional[str]
    prompt: str
    answer: str
    sources: List[str] = field(default_factory=list)
    images: List[str] = field(default_factory=list)


def normalize_session(label: str) -> Optional[str]:
    cleaned = label.strip().lower()
    if not cleaned:
        return None
    if "syge" in cleaned:
        return "sygeeksamen"
    if "ordin" in cleaned:
        return "ordinær"
    return cleaned


def parse_image_filename(path: Path) -> Optional[tuple[int, Optional[str], int, str]]:
    match = IMAGE_NAME_RE.match(path.stem)
    if not match:
        return None
    year = int(match.group("year"))
    session = "sygeeksamen" if match.group("session") else None
    opgave = int(match.group("opgave"))
    label = match.group("label").lower()
    return year, session, opgave, label


def is_heading_line(line: str) -> bool:
    if not line:
        return False
    lowered = line.lower()
    if lowered.startswith(("opgave", "svar", "pensum", "underspørgsmål", "hovedemne")):
        return False
    if extract_reference(line):
        return False
    if line.startswith("(") and line.endswith(")"):
        return False
    if SUBQ_RE.match(line):
        return False
    if line.endswith(":") or line.endswith(".") or line.endswith("?"):
        return False
    return True


def extract_reference(line: str) -> Optional[str]:
    if not line:
        return None
    stripped = line.strip()
    if stripped.lower().startswith("kilde:"):
        return stripped.split(":", 1)[1].strip()
    if stripped.lower().startswith("pensum:"):
        return stripped
    if REFERENCE_RE.match(stripped):
        return stripped
    if stripped.startswith("(") and stripped.endswith(")"):
        lowered = stripped.lower()
        if "p." in lowered or "side" in lowered or "fig" in lowered:
            return stripped
    return None


def is_answer_line(raw_line: str, stripped_line: str) -> bool:
    if raw_line.startswith(" ") or raw_line.startswith("\t"):
        return True
    return stripped_line.lower().startswith("svar:")


def normalize_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def parse_raw_data(raw_text: str) -> List[ShortQuestion]:
    lines = raw_text.splitlines()

    questions: List[ShortQuestion] = []
    current_year: Optional[int] = None
    current_session: Optional[str] = None
    opgave_number: Optional[int] = None
    opgave_title: Optional[str] = None
    opgave_intro_lines: List[str] = []
    auto_opgave_number = 0

    current_label: Optional[str] = None
    prompt_lines: List[str] = []
    answer_lines: List[str] = []
    sources: List[str] = []
    answer_started = False

    def finalize_question() -> None:
        nonlocal current_label, prompt_lines, answer_lines, sources, answer_started
        nonlocal opgave_number, opgave_title, opgave_intro_lines

        if not prompt_lines and not answer_lines:
            current_label = None
            answer_started = False
            sources = []
            return

        if current_year is None:
            raise ValueError("Encountered a question before a year header")
        if opgave_number is None or opgave_title is None:
            raise ValueError(f"Question missing opgave header near year {current_year}.")

        prompt = normalize_spaces(" ".join(prompt_lines))
        answer = "\n".join([line.rstrip() for line in answer_lines]).strip()
        intro = normalize_spaces(" ".join(opgave_intro_lines)) if opgave_intro_lines else None

        if not prompt:
            current_label = None
            answer_started = False
            sources = []
            prompt_lines = []
            answer_lines = []
            return

        questions.append(
            ShortQuestion(
                year=current_year,
                session=current_session,
                opgave=opgave_number,
                opgave_title=opgave_title,
                opgave_intro=intro,
                label=current_label.lower() if current_label else None,
                prompt=prompt,
                answer=answer,
                sources=sources[:],
                images=[],
            )
        )

        current_label = None
        prompt_lines = []
        answer_lines = []
        sources = []
        answer_started = False

    i = 0
    previous_blank = False
    while i < len(lines):
        raw_line = lines[i]
        line = raw_line.strip()

        if not line:
            if answer_started and answer_lines:
                answer_lines.append("")
            previous_blank = True
            i += 1
            continue

        year_match = YEAR_RE.match(line)
        if year_match:
            finalize_question()
            current_year = int(year_match.group("year"))
            current_session = normalize_session(year_match.group("session") or "")
            opgave_number = None
            opgave_title = None
            opgave_intro_lines = []
            auto_opgave_number = 0
            i += 1
            continue

        opgave_match = OPGAVE_RE.match(line)
        if opgave_match:
            finalize_question()
            opgave_number = int(opgave_match.group("number"))
            auto_opgave_number = max(auto_opgave_number, opgave_number)
            opgave_title = opgave_match.group("title").strip() or f"Opgave {opgave_number}"
            opgave_intro_lines = []
            i += 1
            continue

        hovedemne_match = HOVEDEMN_RE.match(line)
        if hovedemne_match:
            finalize_question()
            opgave_number = int(hovedemne_match.group("number"))
            auto_opgave_number = max(auto_opgave_number, opgave_number)
            opgave_title = hovedemne_match.group("title").strip() or f"Hovedemne {opgave_number}"
            opgave_intro_lines = []
            i += 1
            continue

        if is_heading_line(line):
            # Treat as implicit opgave title when no explicit header is used
            finalize_question()
            auto_opgave_number += 1
            opgave_number = auto_opgave_number
            opgave_title = line
            opgave_intro_lines = []
            i += 1
            continue

        undersp_match = UNDERSPOERG_RE.match(line)
        if undersp_match:
            label = undersp_match.group("label")
            text = undersp_match.group("text").strip()

            if label:
                finalize_question()
                if opgave_number is None:
                    opgave_number = int(undersp_match.group("number"))
                    auto_opgave_number = max(auto_opgave_number, opgave_number)
                    if opgave_title is None:
                        opgave_title = f"Opgave {opgave_number}"
                current_label = label
                prompt_lines = [text] if text else [""]
                answer_lines = []
                sources = []
                answer_started = False
                i += 1
                continue

            next_nonempty = None
            for j in range(i + 1, len(lines)):
                if lines[j].strip():
                    next_nonempty = lines[j].strip()
                    break
            if next_nonempty and SUBQ_RE.match(next_nonempty):
                opgave_intro_lines.append(line.rstrip(":"))
                i += 1
                continue

            finalize_question()
            if opgave_number is None:
                opgave_number = int(undersp_match.group("number"))
                auto_opgave_number = max(auto_opgave_number, opgave_number)
                if opgave_title is None:
                    opgave_title = f"Opgave {opgave_number}"
            current_label = None
            prompt_lines = [text] if text else [""]
            answer_lines = []
            sources = []
            answer_started = False
            i += 1
            continue

        subq_match = SUBQ_RE.match(line)
        if subq_match:
            finalize_question()
            current_label = subq_match.group("label")
            prompt_lines = [subq_match.group("text").strip()]
            answer_lines = []
            sources = []
            answer_started = False
            i += 1
            continue

        # Reference-only lines
        ref = extract_reference(line)
        if ref is not None and (prompt_lines or answer_started):
            if ref:
                sources.append(ref)
            i += 1
            continue

        # Start a question if none exists in this opgave yet
        if not prompt_lines and not answer_started:
            next_nonempty = None
            for j in range(i + 1, len(lines)):
                if lines[j].strip():
                    next_nonempty = lines[j].strip()
                    break
            if next_nonempty and SUBQ_RE.match(next_nonempty):
                opgave_intro_lines.append(line.rstrip(":"))
                i += 1
                continue

            current_label = None
            prompt_lines = [line]
            answer_lines = []
            sources = []
            answer_started = False
            i += 1
            continue

        # Decide if this line belongs to the answer
        if is_answer_line(raw_line, line) or answer_started or (previous_blank and prompt_lines):
            answer_started = True
            content = line
            if content.lower().startswith("svar:"):
                content = content.split(":", 1)[1].strip()
            if content:
                answer_lines.append(content)
            i += 1
            previous_blank = False
            continue

        # Otherwise, still in prompt
        prompt_lines.append(line)
        i += 1
        previous_blank = False

    finalize_question()
    return questions


def fill_missing_answers(questions: List[ShortQuestion]) -> None:
    grouped = {}
    for question in questions:
        key = (question.year, question.session, question.opgave, question.opgave_title)
        grouped.setdefault(key, []).append(question)

    for group in grouped.values():
        non_empty = [q for q in group if q.answer.strip()]
        if len(non_empty) != 1:
            continue
        fallback = non_empty[0]
        for question in group:
            if not question.answer.strip():
                question.answer = fallback.answer
                if not question.sources and fallback.sources:
                    question.sources = fallback.sources[:]


def assign_images(
    questions: List[ShortQuestion],
    images_path: Path = IMAGES_PATH,
) -> tuple[List[str], List[str]]:
    by_key = {}
    by_group = {}
    for question in questions:
        group_key = (question.year, question.session, question.opgave)
        by_group.setdefault(group_key, []).append(question)
        if question.label:
            by_key[(question.year, question.session, question.opgave, question.label.lower())] = question

    images_by_key = {}
    images_by_group = {}
    image_files = sorted(
        [p for p in images_path.iterdir() if p.is_file() and p.name != ".DS_Store"]
    )
    for image in image_files:
        parsed = parse_image_filename(image)
        if not parsed:
            continue
        year, session, opgave, label = parsed
        images_by_key.setdefault((year, session, opgave, label), []).append(image)
        images_by_group.setdefault((year, session, opgave), []).append(image)

    used_images = set()

    def lookup_images(year: int, session: Optional[str], opgave: int, label: Optional[str]) -> List[Path]:
        candidates: List[Path] = []
        if label:
            candidates = images_by_key.get((year, session, opgave, label), [])
            if not candidates and session == "ordinær":
                candidates = images_by_key.get((year, None, opgave, label), [])
            if not candidates and session is None:
                candidates = images_by_key.get((year, "ordinær", opgave, label), [])
        else:
            candidates = images_by_group.get((year, session, opgave), [])
            if not candidates and session == "ordinær":
                candidates = images_by_group.get((year, None, opgave), [])
            if not candidates and session is None:
                candidates = images_by_group.get((year, "ordinær", opgave), [])
        return candidates

    for question in questions:
        images: List[Path] = []
        if question.label:
            images = lookup_images(question.year, question.session, question.opgave, question.label.lower())
            if not images and question.label.lower() == "a":
                group = by_group.get((question.year, question.session, question.opgave), [])
                unlabeled = [q for q in group if not q.label]
                if len(unlabeled) == 1:
                    images = lookup_images(question.year, question.session, question.opgave, None)
        else:
            images = lookup_images(question.year, question.session, question.opgave, None)

        if not images and (
            FIGURE_CUE_RE.search(question.prompt) or FIGURE_CUE_RE.search(question.answer)
        ):
            images = lookup_images(question.year, question.session, question.opgave, None)

        if images:
            for image in images:
                used_images.add(image.name)
                rel_path = str(image.relative_to(ROOT_PATH))
                if rel_path not in question.images:
                    question.images.append(rel_path)

    missing_images = []
    for question in questions:
        if question.images:
            continue
        if FIGURE_CUE_RE.search(question.prompt) or FIGURE_CUE_RE.search(question.answer):
            missing_images.append(f"{question.year} {question.opgave}{question.label or ''}: {question.prompt}")

    unmatched_images = [img.name for img in image_files if img.name not in used_images]

    return missing_images, unmatched_images


def write_output(questions: List[ShortQuestion], output_path: Path) -> None:
    def normalize_category(question: ShortQuestion) -> str:
        cleaned = HOVEDEMN_TITLE_RE.sub("", question.opgave_title or "").strip()
        cleaned = cleaned or (question.opgave_title or "")
        try:
            return normalize_human_category(cleaned)
        except ValueError as exc:
            raise ValueError(
                f"Unknown category '{cleaned}' for opgave {question.opgave} ({question.year})"
            ) from exc

    serializable = [
        {
            "type": "short",
            "year": question.year,
            "session": question.session,
            "category": normalize_category(question),
            "opgave": question.opgave,
            "opgaveTitle": question.opgave_title,
            "opgaveIntro": question.opgave_intro,
            "label": question.label,
            "prompt": question.prompt,
            "answer": question.answer,
            "sources": question.sources,
            "images": question.images,
        }
        for question in questions
    ]
    output_path.write_text(json.dumps(serializable, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert raw short answer data to JSON.")
    parser.add_argument("--input", type=Path, help="Path to raw kortsvar file.")
    parser.add_argument("--output", type=Path, help="Destination for kortsvar.json.")
    parser.add_argument("--images", type=Path, help="Folder with figure images.")
    args = parser.parse_args()

    input_path = args.input or RAW_PATH
    output_path = args.output or OUTPUT_PATH
    images_path = args.images or IMAGES_PATH
    if not input_path.exists():
        raise FileNotFoundError(f"Raw data not found: {input_path}")
    if not images_path.exists():
        raise FileNotFoundError(f"Images folder not found: {images_path}")

    raw_text = input_path.read_text(encoding="utf-8")
    questions = parse_raw_data(raw_text)
    fill_missing_answers(questions)
    missing_for_questions, unmatched_images = assign_images(questions, images_path=images_path)
    write_output(questions, output_path)
    years = sorted({q.year for q in questions})
    print(
        f"Parsed {len(questions)} kortsvar-spørgsmål across {len(years)} years: "
        f"{', '.join(str(year) for year in years)}"
    )
    print(f"Saved structured data to {output_path}")

    if missing_for_questions:
        print("Questions referencing figures without matched images:")
        for item in missing_for_questions[:20]:
            print(f"- {item}")
        if len(missing_for_questions) > 20:
            print(f"... and {len(missing_for_questions) - 20} more")

    if unmatched_images:
        print("Images without matching question:")
        for item in unmatched_images[:20]:
            print(f"- {item}")
        if len(unmatched_images) > 20:
            print(f"... and {len(unmatched_images) - 20} more")


if __name__ == "__main__":
    main()
