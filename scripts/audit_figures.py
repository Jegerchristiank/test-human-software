#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import time
from pathlib import Path
from typing import Any, Dict, List
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT_PATH = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT_PATH / "data" / "kortsvar.json"
CAPTIONS_PATH = ROOT_PATH / "data" / "figure_captions.json"
AUDIT_PATH = ROOT_PATH / "data" / "figure_audit.json"

DEFAULT_MODEL = "gpt-5.2"
DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions"
MAX_IMAGE_BYTES = 5 * 1024 * 1024
PROMPT_VERSION = "v1"


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


def load_image_as_data_url(raw_path: str) -> str:
    candidate = (ROOT_PATH / raw_path).resolve()
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


def build_question_text(item: Dict[str, Any]) -> str:
    parts = []
    intro = str(item.get("opgaveIntro", "")).strip()
    prompt = str(item.get("prompt", "")).strip()
    if intro:
        parts.append(intro)
    if prompt:
        parts.append(prompt)
    return "\n".join(parts).strip()


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


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit figures with OpenAI vision.")
    parser.add_argument("--max", type=int, default=0, help="Limit number of figures to process.")
    parser.add_argument("--delay", type=float, default=0.2, help="Delay between requests (seconds).")
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("Missing OPENAI_API_KEY")

    model = os.environ.get("OPENAI_VISION_MODEL") or os.environ.get("OPENAI_MODEL") or DEFAULT_MODEL
    endpoint = os.environ.get("OPENAI_API_BASE") or DEFAULT_ENDPOINT

    items = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    captions = load_existing_captions()
    audit: List[Dict[str, Any]] = []
    processed = 0

    for item in items:
        images = item.get("images") or []
        if not images:
            continue
        question_text = build_question_text(item)
        for index, image_path in enumerate(images):
            image_url = load_image_as_data_url(image_path)
            system_prompt = (
                "You are a strict content auditor for exam material. "
                "Describe the image and judge whether it matches the question."
            )
            user_prompt = (
                "Language: da\n"
                f"Question: {question_text}\n"
                "Return JSON only with fields: description (string), match (true/false), "
                "confidence (number 0-1), issues (string)."
            )
            result = call_openai_vision(api_key, endpoint, model, system_prompt, user_prompt, image_url)
            description = str(result.get("description", "")).strip()
            if description and image_path not in captions:
                captions[image_path] = description
            audit.append(
                {
                    "key": item.get("key") or f"{item.get('year')}-{item.get('opgave')}{item.get('label')}",
                    "image": image_path,
                    "image_index": index,
                    "question": question_text,
                    "match": bool(result.get("match", False)),
                    "confidence": float(result.get("confidence", 0) or 0),
                    "issues": str(result.get("issues", "")).strip(),
                    "description": description,
                    "model": model,
                    "prompt_version": PROMPT_VERSION,
                }
            )
            processed += 1
            if args.max and processed >= args.max:
                break
            time.sleep(max(args.delay, 0))
        if args.max and processed >= args.max:
            break

    CAPTIONS_PATH.write_text(json.dumps(captions, ensure_ascii=False, indent=2), encoding="utf-8")
    AUDIT_PATH.write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(captions)} captions to {CAPTIONS_PATH}")
    print(f"Saved {len(audit)} audit rows to {AUDIT_PATH}")


if __name__ == "__main__":
    main()
