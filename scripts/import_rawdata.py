from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

ROOT_PATH = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_PATH / "scripts"))

import convert_rawdata  # type: ignore
import convert_kortsvar  # type: ignore
import convert_sygdomslaere  # type: ignore

IMPORT_PATHS = {
    "mcq": ROOT_PATH / "imports" / "rawdata-mc.txt",
    "kortsvar": ROOT_PATH / "imports" / "rawdata-kortsvar.txt",
    "sygdomslaere": ROOT_PATH / "imports" / "rawdata-sygdomslaere.txt",
}
RAW_PATHS = {
    "mcq": ROOT_PATH / "rawdata-mc",
    "kortsvar": ROOT_PATH / "rawdata-kortsvar",
    "sygdomslaere": ROOT_PATH / "rawdata-sygdomslaere.txt",
}


def normalize_newlines(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def strip_bom(text: str) -> str:
    return text.lstrip("\ufeff")


def read_text(path: Path, allow_empty: bool = False) -> Optional[str]:
    if not path.exists():
        raise FileNotFoundError(f"Import file not found: {path}")
    text = normalize_newlines(strip_bom(path.read_text(encoding="utf-8")))
    if not text.strip():
        if allow_empty:
            return None
        raise ValueError(f"Import file is empty: {path}")
    return text


def ensure_trailing_newline(text: str) -> str:
    return text if text.endswith("\n") else f"{text}\n"


def first_nonempty_line(text: str) -> Optional[str]:
    for line in text.splitlines():
        if line.strip():
            return line
    return None


def is_sygdom_header(line: str) -> bool:
    lowered = line.strip().lower()
    if not lowered:
        return False
    required = ("sygdom", "tyngde", "emne")
    return all(token in lowered for token in required)


def strip_sygdom_header(text: str) -> str:
    lines = text.splitlines()
    index = 0
    while index < len(lines) and not lines[index].strip():
        index += 1
    if index >= len(lines):
        return text
    if is_sygdom_header(lines[index]):
        index += 1
        while index < len(lines) and not lines[index].strip():
            index += 1
        remaining = "\n".join(lines[index:])
        return ensure_trailing_newline(remaining) if remaining else ""
    return text


def ensure_sygdom_header(text: str, raw_path: Path) -> str:
    first_line = first_nonempty_line(text)
    if first_line and is_sygdom_header(first_line):
        return text
    if not raw_path.exists():
        raise ValueError("Missing header for sygdomslaere import and rawdata file not found")
    header = first_nonempty_line(raw_path.read_text(encoding="utf-8"))
    if not header:
        raise ValueError("Missing header for sygdomslaere import")
    trimmed = text.lstrip("\n")
    return ensure_trailing_newline(f"{header}\n{trimmed}")


def merge_append(existing: str, new_text: str, gap_lines: int) -> str:
    existing_clean = normalize_newlines(existing).rstrip("\n")
    new_clean = normalize_newlines(new_text).lstrip("\n")
    if not existing_clean:
        return ensure_trailing_newline(new_clean)
    gap = "\n" * max(gap_lines, 1)
    return ensure_trailing_newline(f"{existing_clean}{gap}{new_clean}")


def update_rawdata(dataset: str, mode: str, import_text: str) -> None:
    raw_path = RAW_PATHS[dataset]
    existing = raw_path.read_text(encoding="utf-8") if raw_path.exists() else ""

    if dataset == "sygdomslaere":
        if mode == "append":
            import_text = strip_sygdom_header(import_text)
            if not import_text.strip():
                raise ValueError("Sygdomslaere import contains only a header row")
        else:
            import_text = ensure_sygdom_header(import_text, raw_path)

    import_text = ensure_trailing_newline(import_text)

    if mode == "append":
        gap = 1 if dataset == "sygdomslaere" else 2
        merged = merge_append(existing, import_text, gap)
    else:
        merged = ensure_trailing_newline(import_text)

    raw_path.write_text(merged, encoding="utf-8")


def run_converter(dataset: str) -> None:
    if dataset == "mcq":
        raw_text = RAW_PATHS[dataset].read_text(encoding="utf-8")
        questions = convert_rawdata.parse_raw_data(raw_text)
        convert_rawdata.write_questions(questions, convert_rawdata.OUTPUT_PATH)
        print(f"Converted MCQ: {len(questions)} questions -> {convert_rawdata.OUTPUT_PATH}")
        return

    if dataset == "kortsvar":
        if not convert_kortsvar.IMAGES_PATH.exists():
            raise FileNotFoundError(f"Images folder not found: {convert_kortsvar.IMAGES_PATH}")
        raw_text = RAW_PATHS[dataset].read_text(encoding="utf-8")
        questions = convert_kortsvar.parse_raw_data(raw_text)
        convert_kortsvar.fill_missing_answers(questions)
        missing, unmatched = convert_kortsvar.assign_images(questions)
        convert_kortsvar.write_output(questions, convert_kortsvar.OUTPUT_PATH)
        print(f"Converted kortsvar: {len(questions)} questions -> {convert_kortsvar.OUTPUT_PATH}")
        if missing:
            print(f"Warnings: {len(missing)} kortsvar items reference missing figures")
        if unmatched:
            print(f"Warnings: {len(unmatched)} images are unmatched")
        return

    if dataset == "sygdomslaere":
        rows = convert_sygdomslaere.read_tsv(RAW_PATHS[dataset])
        header, mapped = convert_sygdomslaere.parse_rows(rows)
        payload = convert_sygdomslaere.build_payload(mapped, header)
        convert_sygdomslaere.OUTPUT_PATH.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(
            f"Converted sygdomslaere: {len(payload.get('diseases', []))} diseases -> {convert_sygdomslaere.OUTPUT_PATH}"
        )
        return

    raise ValueError(f"Unknown dataset: {dataset}")


def import_dataset(dataset: str, mode: str, allow_empty: bool) -> None:
    import_path = IMPORT_PATHS[dataset]
    import_text = read_text(import_path, allow_empty=allow_empty)
    if import_text is None:
        print(f"Skip {dataset}: import file empty")
        return
    update_rawdata(dataset, mode, import_text)
    run_converter(dataset)


def main() -> None:
    parser = argparse.ArgumentParser(description="Import exam rawdata in append or replace mode.")
    parser.add_argument(
        "--type",
        choices=["mcq", "kortsvar", "sygdomslaere", "all"],
        required=True,
        help="Dataset to import.",
    )
    parser.add_argument(
        "--mode",
        choices=["append", "replace"],
        required=True,
        help="Import mode.",
    )
    args = parser.parse_args()

    datasets = ["mcq", "kortsvar", "sygdomslaere"] if args.type == "all" else [args.type]
    allow_empty = args.type == "all"

    for dataset in datasets:
        import_dataset(dataset, args.mode, allow_empty=allow_empty)


if __name__ == "__main__":
    main()
