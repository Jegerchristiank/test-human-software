#!/usr/bin/env python3
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = ROOT / "index.html"
DATA_FILES = [ROOT / "data" / "questions.json"]

REQUIRED_IDS = [
    "menu-screen",
    "start-btn",
    "quiz-screen",
    "options-container",
    "short-answer-text",
    "next-btn",
    "result-screen",
    "review-list",
]


class IdParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if key == "id" and value:
                self.ids.add(value)


def main() -> int:
    if not HTML_PATH.exists():
        print(f"Missing {HTML_PATH}", file=sys.stderr)
        return 1

    parser = IdParser()
    parser.feed(HTML_PATH.read_text(encoding="utf-8"))

    missing_ids = [value for value in REQUIRED_IDS if value not in parser.ids]
    missing_files = [path for path in DATA_FILES if not path.exists()]

    if missing_ids or missing_files:
        if missing_ids:
            print("Missing required IDs:", file=sys.stderr)
            for value in missing_ids:
                print(f"- {value}", file=sys.stderr)
        if missing_files:
            print("Missing required data files:", file=sys.stderr)
            for path in missing_files:
                print(f"- {path}", file=sys.stderr)
        return 1

    print("Smoke check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
