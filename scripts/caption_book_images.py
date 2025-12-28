#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT_PATH = Path(__file__).resolve().parent.parent
IMAGES_PATH = ROOT_PATH / "billeder" / "bog"
CAPTIONS_PATH = ROOT_PATH / "data" / "book_captions.json"

DEFAULT_MODEL = "gpt-5.2"
DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions"
MAX_IMAGE_BYTES = 5 * 1024 * 1024
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"}


def load_env() -> None:
    env_path = ROOT_PATH / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def parse_openai_error(error: HTTPError) -> str:
    detail = f"OpenAI error: {error.code}"
    try:
        raw = error.read().decode("utf-8")
        data = json.loads(raw)
        message = data.get("error", {}).get("message")
        if message:
            detail = f"OpenAI error {error.code}: {message}"
    except Exception:
        pass
    return detail


def parse_ai_response(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


def load_image_as_data_url(path: Path) -> str:
    candidate = path.resolve()
    if ROOT_PATH != candidate and ROOT_PATH not in candidate.parents:
        raise RuntimeError("Image path not allowed")
    if not candidate.exists():
        raise RuntimeError("Image not found")
    data = candidate.read_bytes()
    if len(data) > MAX_IMAGE_BYTES:
        raise RuntimeError("Image too large")
    mime, _ = mimetypes.guess_type(str(candidate))
    if not mime or not mime.startswith("image/"):
        raise RuntimeError("Unsupported image type")
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def call_openai_vision(
    api_key: str,
    endpoint: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    image_url: str,
) -> Dict[str, Any]:
    request_payload = {
        "model": model,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            },
        ],
    }

    request = Request(
        endpoint,
        data=json.dumps(request_payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=45) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as error:
        raise RuntimeError(parse_openai_error(error)) from error
    except URLError as error:
        raise RuntimeError("Could not reach OpenAI") from error

    try:
        data = json.loads(raw)
        content = data["choices"][0]["message"]["content"]
        return parse_ai_response(content)
    except Exception as error:
        raise RuntimeError("Could not parse AI response") from error


def iter_image_files(root: Path) -> Iterable[Path]:
    if not root.exists():
        return []
    candidates = sorted(root.rglob("*"))
    for path in candidates:
        if not path.is_file():
            continue
        if path.name.startswith("."):
            continue
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        yield path


def load_existing_captions() -> Dict[str, Any]:
    if not CAPTIONS_PATH.exists():
        return {}
    try:
        data = json.loads(CAPTIONS_PATH.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}


def normalize_result(result: Dict[str, Any]) -> Dict[str, Any]:
    summary = str(result.get("summary", "")).strip()
    keywords_raw = result.get("keywords", [])
    if not isinstance(keywords_raw, list):
        keywords_raw = []
    keywords = [str(item).strip() for item in keywords_raw if str(item).strip()]
    image_type = str(result.get("image_type", "")).strip().lower()
    focus = str(result.get("focus", "")).strip()
    return {
        "summary": summary,
        "keywords": keywords,
        "image_type": image_type,
        "focus": focus,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate searchable captions for images in billeder/bog."
    )
    parser.add_argument("--max", type=int, default=0, help="Limit number of images to process.")
    parser.add_argument("--delay", type=float, default=0.2, help="Delay between requests (seconds).")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Recreate captions even if they already exist.",
    )
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("Missing OPENAI_API_KEY")

    model = os.environ.get("OPENAI_VISION_MODEL") or os.environ.get("OPENAI_MODEL") or DEFAULT_MODEL
    endpoint = os.environ.get("OPENAI_API_BASE") or DEFAULT_ENDPOINT

    captions = load_existing_captions()
    images = list(iter_image_files(IMAGES_PATH))
    processed = 0
    skipped = 0
    failures: List[str] = []

    system_prompt = (
        "You are building a searchable medical study image library. "
        "Describe only what is visible and prioritize details that help search and matching. "
        "Return JSON only."
    )
    user_prompt = (
        "Language: da\n"
        "Goal: a high-signal description to help match explanations to the right image.\n"
        "Return JSON only with fields:\n"
        "- summary: 1-2 short sentences describing what is visible.\n"
        "- keywords: 5-12 short phrases with key structures, processes, and any labels.\n"
        "- image_type: one of diagram, illustration, foto, mikroskopi, graf, tabel, skitse, andet.\n"
        "- focus: short phrase for the main topic/system.\n"
    )

    for path in images:
        rel_path = str(path.relative_to(ROOT_PATH))
        if not args.force and rel_path in captions:
            skipped += 1
            continue

        try:
            image_url = load_image_as_data_url(path)
            result = call_openai_vision(
                api_key, endpoint, model, system_prompt, user_prompt, image_url
            )
            captions[rel_path] = normalize_result(result)
            processed += 1
            if args.max and processed >= args.max:
                break
            time.sleep(max(args.delay, 0))
        except Exception as error:
            failures.append(f"{rel_path}: {error}")

    CAPTIONS_PATH.write_text(
        json.dumps(captions, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Saved {len(captions)} captions to {CAPTIONS_PATH}")
    if skipped:
        print(f"Skipped {skipped} existing captions")
    if failures:
        print(f"Failures: {len(failures)}")
        for item in failures[:20]:
            print(f"- {item}")
        if len(failures) > 20:
            print(f"... and {len(failures) - 20} more")


if __name__ == "__main__":
    main()
