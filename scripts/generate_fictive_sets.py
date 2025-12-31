from __future__ import annotations

import argparse
import json
import math
import os
import random
import re
import time
from collections import deque
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT_PATH = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_PATH / "data"

QUESTIONS_PATH = DATA_DIR / "questions.json"
SHORT_PATH = DATA_DIR / "kortsvar.json"
BOOK_CAPTIONS_PATH = DATA_DIR / "book_captions.json"
RELEVANCE_PATH = DATA_DIR / "book_exam_relevance.json"

TARGET_YEAR = 2030
TOP_PERCENT_DEFAULT = 30
SEED_POOL_MULTIPLIER = 3
SEED_RETRY_LIMIT = 1
SET_DEFINITIONS = [
    {
        "session": "Genereret - nemt",
        "difficulty": "nemt",
        "mcq": 24,
        "short": 12,
    },
    {
        "session": "Genereret - middelsvært",
        "difficulty": "middelsvært",
        "mcq": 24,
        "short": 12,
    },
    {
        "session": "Genereret - svært",
        "difficulty": "svært",
        "mcq": 24,
        "short": 12,
    },
    {
        "session": "Genereret - ekstra svær",
        "difficulty": "ekstra svær",
        "mcq": 24,
        "short": 12,
    },
]

CATEGORY_POOL = [
    "Cellebiologi",
    "Metabolisme",
    "Nervesystemet",
    "Endokrinologi",
    "Bevægeapparatet",
    "Blodet",
    "Respirationsorganerne",
    "Fordøjelsessystemet",
    "Reproduktion",
    "Kredsløbet",
    "Nyrer og urinveje",
]

MCQ_BATCH_SIZE = 12
SHORT_BATCH_SIZE = 6

BOOK_STOPWORDS = {
    "og",
    "i",
    "på",
    "af",
    "for",
    "til",
    "med",
    "som",
    "det",
    "den",
    "der",
    "de",
    "en",
    "et",
    "at",
    "er",
    "har",
    "hvor",
    "hvad",
    "hvordan",
    "hvilke",
    "hvilken",
    "hvorfor",
    "hvem",
    "når",
    "fra",
    "over",
    "under",
    "bliver",
    "viser",
    "vis",
    "vises",
    "samt",
    "eller",
    "mellem",
    "via",
    "kun",
    "også",
    "ofte",
    "kan",
    "skal",
    "være",
    "deres",
    "din",
    "dit",
    "dine",
    "spørgsmål",
    "opgave",
    "svar",
    "figur",
    "figuren",
    "diagram",
    "illustration",
    "billede",
    "billedet",
}
BOOK_SHORT_TOKENS = {"na", "k", "ca", "cl"}

EASY_PROMPT_CUES = {"nævn", "angiv", "hvad", "hvilke", "hvilken"}
HARD_PROMPT_CUES = {"redegør", "forklar", "diskuter", "analyser", "vurder"}
MCQ_HARD_CUES = {
    "hvis",
    "konsekvens",
    "medfører",
    "fører",
    "påvirker",
    "mekanisme",
    "regulering",
    "stimulering",
    "hæmning",
    "stigning",
    "fald",
    "øges",
    "nedsættes",
}

BANNED_PROMPT_FRAGMENTS = {
    "se figur",
    "i figuren",
    "nedenstående figur",
    "vist i figuren",
    "angivet i figuren",
}

MCQ_LENGTH_BOUNDS = {
    "nemt": (30, 140),
    "middelsvært": (40, 170),
    "svært": (50, 210),
    "ekstra svær": (60, 260),
}

SHORT_SENTENCE_BOUNDS = {
    "nemt": (1, 2),
    "middelsvært": (2, 3),
    "svært": (3, 4),
    "ekstra svær": (4, 6),
}


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


def parse_ai_response(text: Any) -> Dict[str, Any]:
    if isinstance(text, list):
        parts = []
        for item in text:
            if isinstance(item, dict):
                if "text" in item:
                    parts.append(str(item["text"]))
                elif "content" in item:
                    parts.append(str(item["content"]))
            elif isinstance(item, str):
                parts.append(item)
        text = "".join(parts)
    if text is None:
        text = ""
    raw = str(text)
    if not raw.strip():
        return {"items": []}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


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


def call_openai_json(
    api_key: str,
    endpoint: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: Optional[float] = 0.4,
    max_tokens: int = 2000,
    retries: int = 3,
) -> Dict[str, Any]:
    temperature_value = temperature
    use_response_format = True
    force_plain_json = False
    last_error: Optional[Exception] = None
    for attempt in range(retries):
        effective_system = system_prompt
        if force_plain_json:
            effective_system = (
                f"{system_prompt}\n"
                "Return ONLY a JSON object. If you cannot comply, return {\"items\": []}."
            )
        payload = {
            "model": model,
            "max_completion_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": effective_system},
                {"role": "user", "content": user_prompt},
            ],
        }
        if use_response_format:
            payload["response_format"] = {"type": "json_object"}
        if temperature_value is not None:
            payload["temperature"] = temperature_value

        request = Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=60) as response:
                raw = response.read().decode("utf-8")
            data = json.loads(raw)
            choices = data.get("choices") or []
            if not choices:
                last_error = RuntimeError("OpenAI response missing choices")
                force_plain_json = True
                use_response_format = False
                continue
            message = choices[0].get("message") or {}
            content = message.get("content")
            if content is None:
                last_error = RuntimeError("OpenAI response missing content")
                force_plain_json = True
                use_response_format = False
                continue
            if isinstance(content, list):
                if not content:
                    last_error = RuntimeError("OpenAI response empty content")
                    force_plain_json = True
                    use_response_format = False
                    continue
            elif isinstance(content, str):
                if not content.strip():
                    last_error = RuntimeError("OpenAI response empty content")
                    force_plain_json = True
                    use_response_format = False
                    continue
            return parse_ai_response(content)
        except HTTPError as error:
            message = parse_openai_error(error)
            last_error = RuntimeError(message)
            if (
                temperature_value is not None
                and "temperature" in message.lower()
                and ("default (1)" in message.lower() or "only the default" in message.lower())
            ):
                temperature_value = None
                continue
            if "response_format" in message.lower():
                use_response_format = False
                continue
        except URLError as error:
            last_error = RuntimeError("Could not reach OpenAI")
        except Exception as error:
            last_error = error
            force_plain_json = True
        if attempt < retries - 1:
            time.sleep(1.5 * (attempt + 1))
    if last_error:
        raise last_error
    raise RuntimeError("OpenAI request failed")


def model_requires_default_temperature(model: str) -> bool:
    return "gpt-5" in model.lower()


def is_empty_response_error(error: Exception) -> bool:
    message = str(error).lower()
    return (
        "empty content" in message
        or "missing content" in message
        or "missing choices" in message
    )


def estimate_mcq_max_tokens(count: int) -> int:
    return min(6000, max(2400, count * 200))


def estimate_short_max_tokens(count: int) -> int:
    return min(4000, max(2000, count * 160))


class OpenAIClient:
    def __init__(self, api_key: str, model: str, endpoint: str) -> None:
        self.api_key = api_key
        self.model = model
        self.endpoint = endpoint

    def request_json(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.4,
        max_tokens: int = 2000,
    ) -> Dict[str, Any]:
        resolved_temperature: Optional[float] = temperature
        if model_requires_default_temperature(self.model):
            resolved_temperature = None
        return call_openai_json(
            self.api_key,
            self.endpoint,
            self.model,
            system_prompt,
            user_prompt,
            temperature=resolved_temperature,
            max_tokens=max_tokens,
        )


def log(message: str) -> None:
    print(message, flush=True)


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def normalize_search_text(value: str) -> str:
    cleaned = value.lower().replace("-", " ").replace("+", " ")
    cleaned = re.sub(r"[^a-z0-9æøå ]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def tokenize_search_text(value: str) -> List[str]:
    normalized = normalize_search_text(value or "")
    if not normalized:
        return []
    tokens = []
    for token in normalized.split(" "):
        if not token or token in BOOK_STOPWORDS:
            continue
        if len(token) > 2 or token in BOOK_SHORT_TOKENS or re.search(r"\d", token):
            tokens.append(token)
    return tokens


def sentence_count(text: str) -> int:
    if not text:
        return 0
    sentences = re.findall(r"[.!?]+", text)
    return max(1, len(sentences))


def normalize_signature_text(text: str) -> str:
    return normalize_search_text(text)


def mcq_signature(text: str) -> str:
    return normalize_signature_text(text)


def normalize_generated_category(value: str) -> str:
    trimmed = str(value or "").strip()
    if not trimmed:
        return ""
    if trimmed in CATEGORY_POOL:
        return trimmed
    lowered = trimmed.lower()
    for category in CATEGORY_POOL:
        if category.lower() == lowered:
            return category
    return ""


def short_signature(prompt: str) -> str:
    return normalize_signature_text(prompt)


def build_exam_token_weights(
    mcq: List[Dict[str, Any]], short: List[Dict[str, Any]]
) -> Dict[str, float]:
    freq: Dict[str, int] = {}
    for question in mcq:
        parts = [question.get("text", ""), question.get("category", "")]
        options = question.get("options", []) or []
        parts.extend([opt.get("text", "") for opt in options if opt.get("text")])
        tokens = set(tokenize_search_text(" ".join(parts)))
        for token in tokens:
            freq[token] = freq.get(token, 0) + 1
    for question in short:
        parts = [
            question.get("prompt", ""),
            question.get("answer", ""),
            question.get("category", ""),
            question.get("opgaveTitle", ""),
        ]
        tokens = set(tokenize_search_text(" ".join(filter(None, parts))))
        for token in tokens:
            freq[token] = freq.get(token, 0) + 1
    return {token: math.log(1 + count) for token, count in freq.items()}


def build_book_entries(book_captions: Dict[str, Any]) -> List[Dict[str, Any]]:
    entries = []
    for path, entry in book_captions.items():
        if isinstance(entry, str):
            summary = entry
            keywords: List[str] = []
            focus = ""
            image_type = ""
        else:
            summary = str(entry.get("summary", "") or "")
            keywords = entry.get("keywords", []) or []
            focus = str(entry.get("focus", "") or "")
            image_type = str(entry.get("image_type", "") or "")
        summary_tokens = set(tokenize_search_text(summary))
        keyword_tokens = set(tokenize_search_text(" ".join(keywords)))
        focus_tokens = set(tokenize_search_text(focus))
        tokens = summary_tokens | keyword_tokens | focus_tokens
        entries.append(
            {
                "path": path,
                "summary": summary,
                "keywords": keywords,
                "focus": focus,
                "image_type": image_type,
                "summary_tokens": summary_tokens,
                "keyword_tokens": keyword_tokens,
                "focus_tokens": focus_tokens,
                "tokens": tokens,
            }
        )
    return entries


def score_book_entry(entry: Dict[str, Any], weights: Dict[str, float]) -> Dict[str, Any]:
    score = 0.0
    hits = 0
    signal_hits = 0
    for token in entry["tokens"]:
        weight = weights.get(token)
        if not weight:
            continue
        hits += 1
        if token in entry["keyword_tokens"]:
            signal_hits += 1
            score += weight * 2.4
        elif token in entry["focus_tokens"]:
            signal_hits += 1
            score += weight * 2.1
        elif token in entry["summary_tokens"]:
            score += weight * 1.2
    return {"score": score, "hits": hits, "signal_hits": signal_hits}


def compute_relevance(
    book_entries: List[Dict[str, Any]], weights: Dict[str, float]
) -> Tuple[List[Dict[str, Any]], float]:
    scored = []
    max_score = 0.0
    for entry in book_entries:
        meta = score_book_entry(entry, weights)
        score = meta["score"]
        if score > max_score:
            max_score = score
        scored.append({**entry, **meta})
    if max_score <= 0:
        max_score = 1.0
    for entry in scored:
        entry["norm_score"] = entry["score"] / max_score
    scores = sorted(entry["norm_score"] for entry in scored)
    if scores:
        index = max(0, int(len(scores) * 0.7) - 1)
        p70 = scores[index]
    else:
        p70 = 0.0
    threshold = max(0.35, p70)
    return scored, threshold


def select_top_entries(
    scored_entries: List[Dict[str, Any]],
    top_percent: float,
) -> Tuple[List[Dict[str, Any]], float]:
    sorted_entries = sorted(scored_entries, key=lambda e: e["norm_score"], reverse=True)
    total = len(sorted_entries)
    if total == 0:
        return [], 0.0
    safe_percent = max(1.0, min(100.0, top_percent))
    top_count = max(1, int(round(total * safe_percent / 100)))
    top_entries = sorted_entries[:top_count]
    cutoff = top_entries[-1]["norm_score"]
    return top_entries, cutoff


def enrich_book_captions(
    book_captions: Dict[str, Any],
    scored_entries: List[Dict[str, Any]],
    top_percent: float,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    sorted_entries = sorted(scored_entries, key=lambda e: e["norm_score"], reverse=True)
    total = len(sorted_entries)
    top_entries, cutoff = select_top_entries(scored_entries, top_percent)
    top_paths = {entry["path"] for entry in top_entries}
    by_path = {}
    for rank, entry in enumerate(sorted_entries, start=1):
        percentile = round(100.0 * (1.0 - (rank - 1) / max(total, 1)), 2)
        by_path[entry["path"]] = {
            "score": round(entry["norm_score"], 4),
            "rank": rank,
            "percentile": percentile,
            "is_top": entry["path"] in top_paths,
        }
    updated = {}
    for path, entry in book_captions.items():
        meta = by_path.get(path, {"score": 0.0, "rank": 0, "percentile": 0.0, "is_top": False})
        if isinstance(entry, str):
            updated[path] = {
                "summary": entry,
                "exam_relevance": meta,
            }
        else:
            payload = dict(entry)
            payload["exam_relevance"] = meta
            updated[path] = payload
    summary = {
        "topPercent": top_percent,
        "cutoffScore": round(cutoff, 4),
        "total": total,
        "topCount": len(top_entries),
    }
    return updated, summary


def add_weighted_tokens(weights: Dict[str, float], text: str, weight: float) -> None:
    for token in tokenize_search_text(text or ""):
        current = weights.get(token, 0.0)
        if weight > current:
            weights[token] = weight


def build_query_weights(
    question: Dict[str, Any],
    include_category: bool = False,
    include_title: bool = False,
) -> Dict[str, float]:
    weights: Dict[str, float] = {}
    add_weighted_tokens(weights, question.get("prompt", "") or question.get("text", ""), 1.2)
    add_weighted_tokens(weights, question.get("answer", ""), 1.6)
    if include_category:
        add_weighted_tokens(weights, question.get("category", ""), 0.6)
    if include_title:
        add_weighted_tokens(weights, question.get("opgaveTitle", ""), 0.5)
    return weights


def build_prompt_answer_tokens(question: Dict[str, Any]) -> set:
    tokens = set(tokenize_search_text(question.get("prompt", "")))
    tokens.update(tokenize_search_text(question.get("answer", "")))
    return tokens


def count_prompt_hits(prompt_tokens: Iterable[str], entry: Dict[str, Any]) -> Tuple[int, int]:
    prompt_set = set(prompt_tokens)
    if not prompt_set:
        return 0, 0
    signal_tokens = entry["keyword_tokens"] | entry["focus_tokens"]
    total_hits = len(prompt_set & entry["tokens"])
    signal_hits = len(prompt_set & signal_tokens)
    return total_hits, signal_hits


def score_book_match(query_weights: Dict[str, float], entry: Dict[str, Any]) -> Dict[str, Any]:
    score = 0.0
    hits = 0
    signal_hits = 0
    total_weight = 0.0
    for token, weight in query_weights.items():
        total_weight += weight
        if token in entry["keyword_tokens"]:
            hits += 1
            signal_hits += 1
            score += weight * 2.4
        elif token in entry["focus_tokens"]:
            hits += 1
            signal_hits += 1
            score += weight * 2.1
        elif token in entry["summary_tokens"]:
            hits += 1
            score += weight * 1.2
    max_score = total_weight * 2.4 if total_weight else 0.0
    ratio = score / max_score if max_score else 0.0
    return {"score": score, "hits": hits, "signal_hits": signal_hits, "ratio": ratio}


def score_token_overlap(tokens: Iterable[str], entry: Dict[str, Any]) -> Dict[str, Any]:
    score = 0.0
    hits = 0
    signal_hits = 0
    for token in tokens:
        if token in entry["keyword_tokens"]:
            hits += 1
            signal_hits += 1
            score += 2.4
        elif token in entry["focus_tokens"]:
            hits += 1
            signal_hits += 1
            score += 2.1
        elif token in entry["summary_tokens"]:
            hits += 1
            score += 1.2
    return {"score": score, "hits": hits, "signal_hits": signal_hits}


def find_best_book_image_fallback(
    question: Dict[str, Any],
    entries: List[Dict[str, Any]],
) -> Optional[str]:
    tokens = set(
        tokenize_search_text(
            " ".join([question.get("prompt", ""), question.get("category", "")])
        )
    )
    if not tokens:
        return None
    best = None
    best_meta = None
    best_score = 0.0
    for entry in entries:
        meta = score_token_overlap(tokens, entry)
        if meta["score"] > best_score:
            best_score = meta["score"]
            best_meta = meta
            best = entry
    if not best or not best_meta:
        return None
    if best_meta["hits"] < 2:
        return None
    if best_meta["signal_hits"] < 1:
        return None
    return best["path"]


def find_best_book_image(
    question: Dict[str, Any],
    entries: List[Dict[str, Any]],
) -> Optional[str]:
    query_weights = build_query_weights(question, include_category=False, include_title=False)
    if not query_weights:
        return None
    prompt_tokens = build_prompt_answer_tokens(question)
    if not prompt_tokens:
        return None
    best = None
    best_meta = None
    best_score = 0.0
    second_score = 0.0
    for entry in entries:
        meta = score_book_match(query_weights, entry)
        if meta["score"] > best_score:
            second_score = best_score
            best_score = meta["score"]
            best_meta = meta
            best = entry
        elif meta["score"] > second_score:
            second_score = meta["score"]
    if not best or not best_meta:
        return None
    token_count = len(prompt_tokens)
    min_prompt_hits = 2 if token_count <= 8 else 3 if token_count <= 14 else 4
    min_prompt_signal = 1 if token_count <= 8 else 2
    min_ratio = 0.6 if token_count <= 10 else 0.65
    min_gap = 1.6
    prompt_hits, prompt_signal = count_prompt_hits(prompt_tokens, best)
    if prompt_hits < min_prompt_hits:
        return None
    if prompt_signal < min_prompt_signal:
        return None
    if best_meta["signal_hits"] < 2:
        return None
    if best_meta["ratio"] < min_ratio:
        return None
    if second_score > 0 and (best_score / second_score) < min_gap:
        return None
    return best["path"]


def distribute_counts(total: int, categories: List[str], seed: int) -> Dict[str, int]:
    base = total // len(categories)
    remainder = total % len(categories)
    rng = random.Random(seed)
    order = categories[:]
    rng.shuffle(order)
    counts = {cat: base for cat in categories}
    for index in range(remainder):
        counts[order[index]] += 1
    return counts


def should_reject_prompt(prompt: str) -> bool:
    lowered = normalize_search_text(prompt)
    return any(fragment in lowered for fragment in BANNED_PROMPT_FRAGMENTS)


def validate_short_difficulty(prompt: str, difficulty: str) -> bool:
    lowered = normalize_search_text(prompt)
    if difficulty == "nemt":
        if any(token in lowered.split(" ") for token in HARD_PROMPT_CUES):
            return False
    if difficulty in {"svært", "ekstra svær"}:
        if not any(token in lowered.split(" ") for token in HARD_PROMPT_CUES):
            return False
    return True


def validate_mcq_length(text: str, difficulty: str, relaxed: bool = False) -> bool:
    length = len(text or "")
    bounds = MCQ_LENGTH_BOUNDS.get(difficulty)
    if not bounds:
        return True
    if relaxed:
        lower = max(1, int(bounds[0] * 0.8))
        upper = int(bounds[1] * 1.25)
        return lower <= length <= upper
    return bounds[0] <= length <= bounds[1]


def has_cue(text: str, cues: Iterable[str]) -> bool:
    tokens = normalize_search_text(text).split(" ")
    return any(token in cues for token in tokens if token)


def validate_mcq_difficulty(text: str, difficulty: str, relaxed: bool = False) -> bool:
    lowered = normalize_search_text(text)
    if difficulty == "nemt":
        if any(char.isdigit() for char in lowered):
            return False
        if has_cue(lowered, MCQ_HARD_CUES):
            return False
    if difficulty in {"svært", "ekstra svær"}:
        if not (has_cue(lowered, MCQ_HARD_CUES) or ("," in text) or (" hvis " in f" {lowered} ")):
            return relaxed
    return True


def validate_short_answer_length(answer: str, difficulty: str) -> bool:
    count = sentence_count(answer)
    bounds = SHORT_SENTENCE_BOUNDS.get(difficulty)
    if not bounds:
        return True
    return bounds[0] <= count <= bounds[1]


def normalize_mcq_options(raw_options: List[Any]) -> List[Dict[str, Any]]:
    options: List[Dict[str, Any]] = []
    labels = ["A", "B", "C", "D"]
    for idx, raw in enumerate(raw_options[:4]):
        if isinstance(raw, str):
            text = raw
        elif isinstance(raw, dict):
            text = str(raw.get("text", "")).strip()
        else:
            text = ""
        label = labels[idx]
        options.append({"label": label, "text": text.strip(), "isCorrect": False})
    return options


def sanitize_mcq_item(
    item: Dict[str, Any],
    category: str,
    difficulty: str,
    relaxed: bool = False,
) -> Optional[Dict[str, Any]]:
    if not isinstance(item, dict):
        return None
    item_category = str(item.get("category", "")).strip()
    if item_category and item_category != category and not relaxed:
        return None
    text = str(item.get("text", "")).strip()
    if not text or should_reject_prompt(text):
        return None
    if not validate_mcq_length(text, difficulty, relaxed=relaxed):
        return None
    if not validate_mcq_difficulty(text, difficulty, relaxed=relaxed):
        return None
    raw_options = item.get("options") or []
    if not isinstance(raw_options, list) or len(raw_options) < 4:
        return None
    options = normalize_mcq_options(raw_options)
    if any(not opt["text"] for opt in options):
        return None
    option_texts = [opt["text"] for opt in options]
    normalized_texts = [normalize_signature_text(opt) for opt in option_texts]
    if len(set(normalized_texts)) < 4:
        return None
    correct_label = str(item.get("correctLabel", "")).strip().upper()
    if correct_label.isdigit():
        index = int(correct_label)
        if 0 <= index < 4:
            correct_label = ["A", "B", "C", "D"][index]
        elif 1 <= index <= 4:
            correct_label = ["A", "B", "C", "D"][index - 1]
    if correct_label not in {"A", "B", "C", "D"}:
        correct_index = item.get("correctIndex")
        if isinstance(correct_index, int) and 0 <= correct_index < 4:
            correct_label = ["A", "B", "C", "D"][correct_index]
        else:
            flagged = [
                opt for opt in raw_options[:4]
                if isinstance(opt, dict) and opt.get("isCorrect") is True
            ]
            if len(flagged) == 1:
                correct_label = ["A", "B", "C", "D"][raw_options[:4].index(flagged[0])]
    if correct_label not in {"A", "B", "C", "D"}:
        return None
    for opt in options:
        opt["isCorrect"] = opt["label"] == correct_label
    return {
        "category": category,
        "text": text,
        "options": options,
        "correctLabel": correct_label,
    }


def sanitize_short_item(
    item: Dict[str, Any],
    category: str,
    difficulty: str,
    relaxed: bool = False,
) -> Optional[Dict[str, Any]]:
    if not isinstance(item, dict):
        return None
    item_category = str(item.get("category", "")).strip()
    if item_category and item_category != category and not relaxed:
        return None
    prompt = str(item.get("prompt", "")).strip()
    answer = str(item.get("answer", "")).strip()
    if not prompt or not answer:
        return None
    if should_reject_prompt(prompt):
        return None
    if not validate_short_difficulty(prompt, difficulty) and not relaxed:
        return None
    if not validate_short_answer_length(answer, difficulty):
        return None
    return {"category": category, "prompt": prompt, "answer": answer}


def build_mcq_prompt(category: str, difficulty: str, count: int, batch_id: int) -> str:
    length_hint = {
        "nemt": "Stammen er kort (1 sætning), uden negationer.",
        "middelsvært": "Stammen er 1-2 sætninger, evt. let klinisk kontekst.",
        "svært": "Stammen er 2-3 sætninger med fysiologisk ræsonnement.",
        "ekstra svær": "Stammen er 2-4 sætninger med integreret ræsonnement og faldgruber.",
    }[difficulty]
    difficulty_hint = {
        "nemt": "Direkte faktaspørgsmål, tydelige svarmuligheder, ingen trick.",
        "middelsvært": "Kræver forståelse, men stadig enkelt at løse for forberedte studerende.",
        "svært": "Kræver sammenkobling af flere begreber eller mekanismer.",
        "ekstra svær": "Kræver flere led i ræsonnementet og integration på tværs af emner.",
    }[difficulty]
    return (
        f"Generér {count} HELT nye MCQ på dansk i kategorien '{category}'.\n"
        f"Sværhedsgrad: {difficulty}. {difficulty_hint} {length_hint}\n"
        "Krav:\n"
        "- Spørgsmålene skal være originale og ikke genbrug/omformulering af kendte eksamensspørgsmål.\n"
        "- Ingen referencer til figurer/billeder.\n"
        "- 4 svarmuligheder med labels A-D.\n"
        "- Kun ét korrekt svar.\n"
        "- Undgå 'alle ovenstående' og 'ingen af ovenstående'.\n"
        "- Skriv kort og præcist.\n"
        "- Sørg for tydelig variation: hvert spørgsmål skal handle om et forskelligt underemne.\n"
        "- Brug præcis denne kategoritekst i feltet 'category'.\n"
        f"- Batch-id: {batch_id} (brug til variation).\n"
        "\nReturnér JSON som:\n"
        "{\n  \"items\": [\n    {\n      \"category\": \"...\",\n      \"text\": \"...\",\n      \"options\": [\n        {\"label\": \"A\", \"text\": \"...\"},\n        {\"label\": \"B\", \"text\": \"...\"},\n        {\"label\": \"C\", \"text\": \"...\"},\n        {\"label\": \"D\", \"text\": \"...\"}\n      ],\n      \"correctLabel\": \"A\"\n    }\n  ]\n}\n"
    )


def build_short_prompt(category: str, difficulty: str, count: int, batch_id: int) -> str:
    length_hint = {
        "nemt": "Svar 1-2 korte sætninger.",
        "middelsvært": "Svar 2-3 sætninger med forklaring.",
        "svært": "Svar 3-4 sætninger med mekanistisk forklaring.",
        "ekstra svær": "Svar 4-6 sætninger med integreret forklaring.",
    }[difficulty]
    difficulty_hint = {
        "nemt": "Fakta- og begrebsspørgsmål uden omfattende ræsonnement.",
        "middelsvært": "Kræver basal forståelse og enkel årsag-virkning.",
        "svært": "Kræver flere begreber og mekanistisk forklaring.",
        "ekstra svær": "Kræver dyb forståelse og integration på tværs af emner.",
    }[difficulty]
    return (
        f"Generér {count} HELT nye kortsvarsopgaver på dansk i kategorien '{category}'.\n"
        f"Sværhedsgrad: {difficulty}. {difficulty_hint} {length_hint}\n"
        "Krav:\n"
        "- Spørgsmålene skal være originale og ikke genbrug/omformulering af kendte eksamensspørgsmål.\n"
        "- Ingen referencer til figurer/billeder.\n"
        "- Svar i sammenhængende sætninger (ikke punktform).\n"
        "- Sørg for tydelig variation: hver opgave skal handle om et forskelligt underemne.\n"
        "- Brug præcis denne kategoritekst i feltet 'category'.\n"
        f"- Batch-id: {batch_id} (brug til variation).\n"
        "\nReturnér JSON som:\n"
        "{\n  \"items\": [\n    {\n      \"category\": \"...\",\n      \"prompt\": \"...\",\n      \"answer\": \"...\"\n    }\n  ]\n}\n"
    )


def build_caption_seed(entry: Dict[str, Any], seed_id: int) -> Dict[str, Any]:
    return {
        "id": seed_id,
        "path": entry["path"],
        "summary": entry.get("summary", ""),
        "focus": entry.get("focus", ""),
        "keywords": entry.get("keywords", []),
        "image_type": entry.get("image_type", ""),
        "exam_score": entry.get("norm_score", 0.0),
    }


def select_caption_seeds(
    entries: List[Dict[str, Any]],
    count: int,
    seed: int,
) -> List[Dict[str, Any]]:
    rng = random.Random(seed)
    pool = entries[:]
    rng.shuffle(pool)
    seeds: List[Dict[str, Any]] = []
    index = 0
    while len(seeds) < count and pool:
        entry = pool[index % len(pool)]
        seeds.append(build_caption_seed(entry, len(seeds) + 1))
        index += 1
    return seeds


def build_mcq_caption_prompt(
    seeds: List[Dict[str, Any]],
    difficulty: str,
    batch_id: int,
) -> str:
    difficulty_hint = {
        "nemt": "Direkte faktaspørgsmål, tydelige svarmuligheder, ingen trick.",
        "middelsvært": "Kræver forståelse, men stadig enkelt at løse for forberedte studerende.",
        "svært": "Kræver sammenkobling af flere begreber eller mekanismer.",
        "ekstra svær": "Kræver flere led i ræsonnementet og integration på tværs af emner.",
    }[difficulty]
    seed_lines = []
    for seed in seeds:
        keywords = ", ".join(seed.get("keywords") or [])
        seed_lines.append(
            f"- id: {seed['id']} | type: {seed.get('image_type','')} | focus: {seed.get('focus','')} | "
            f"keywords: {keywords} | summary: {seed.get('summary','')}"
        )
    seed_block = "\n".join(seed_lines)
    categories = ", ".join(CATEGORY_POOL)
    return (
        "Du får en liste af billedbeskrivelser fra pensumbogen.\n"
        f"Skriv 1 MCQ pr. seed (samme antal som seeds). Sværhedsgrad: {difficulty}. {difficulty_hint}\n"
        "Regler:\n"
        "- Spørgsmålet skal være tydeligt forankret i beskrivelsen.\n"
        "- Undgå at nævne 'figur', 'billede' eller 'illustration'.\n"
        "- Svarmuligheder A-D, præcis én korrekt.\n"
        "- Vælg kategori fra denne liste: " + categories + ".\n"
        "- Sæt category præcist til en af de tilladte værdier.\n"
        f"- Batch-id: {batch_id}.\n"
        "\nSeeds:\n"
        f"{seed_block}\n"
        "\nReturnér JSON:\n"
        "{\n  \"items\": [\n"
        "    {\n"
        "      \"seedId\": 1,\n"
        "      \"category\": \"...\",\n"
        "      \"text\": \"...\",\n"
        "      \"options\": [\n"
        "        {\"label\": \"A\", \"text\": \"...\"},\n"
        "        {\"label\": \"B\", \"text\": \"...\"},\n"
        "        {\"label\": \"C\", \"text\": \"...\"},\n"
        "        {\"label\": \"D\", \"text\": \"...\"}\n"
        "      ],\n"
        "      \"correctLabel\": \"A\"\n"
        "    }\n"
        "  ]\n"
        "}\n"
    )


def build_short_caption_prompt(
    seeds: List[Dict[str, Any]],
    difficulty: str,
    batch_id: int,
) -> str:
    length_hint = {
        "nemt": "Svar 1-2 korte sætninger.",
        "middelsvært": "Svar 2-3 sætninger med forklaring.",
        "svært": "Svar 3-4 sætninger med mekanistisk forklaring.",
        "ekstra svær": "Svar 4-6 sætninger med integreret forklaring.",
    }[difficulty]
    difficulty_hint = {
        "nemt": "Fakta- og begrebsspørgsmål uden omfattende ræsonnement.",
        "middelsvært": "Kræver basal forståelse og enkel årsag-virkning.",
        "svært": "Kræver flere begreber og mekanistisk forklaring.",
        "ekstra svær": "Kræver dyb forståelse og integration på tværs af emner.",
    }[difficulty]
    seed_lines = []
    for seed in seeds:
        keywords = ", ".join(seed.get("keywords") or [])
        seed_lines.append(
            f"- id: {seed['id']} | type: {seed.get('image_type','')} | focus: {seed.get('focus','')} | "
            f"keywords: {keywords} | summary: {seed.get('summary','')}"
        )
    seed_block = "\n".join(seed_lines)
    categories = ", ".join(CATEGORY_POOL)
    return (
        "Du får en liste af billedbeskrivelser fra pensumbogen.\n"
        f"Skriv 1 kortsvarsopgave pr. seed. Sværhedsgrad: {difficulty}. {difficulty_hint} {length_hint}\n"
        "Regler:\n"
        "- Spørgsmålet skal være tydeligt forankret i beskrivelsen.\n"
        "- Undgå ordet 'figur' og 'billede' i både prompt og svar.\n"
        "- Svar skal være sammenhængende sætninger (ikke punktform).\n"
        "- Vælg kategori fra denne liste: " + categories + ".\n"
        "- Sæt category præcist til en af de tilladte værdier.\n"
        f"- Batch-id: {batch_id}.\n"
        "\nSeeds:\n"
        f"{seed_block}\n"
        "\nReturnér JSON:\n"
        "{\n  \"items\": [\n"
        "    {\n"
        "      \"seedId\": 1,\n"
        "      \"category\": \"...\",\n"
        "      \"prompt\": \"...\",\n"
        "      \"answer\": \"...\"\n"
        "    }\n"
        "  ]\n"
        "}\n"
    )


def generate_mcq_from_captions(
    client: OpenAIClient,
    seeds: List[Dict[str, Any]],
    seed_replacements: List[Dict[str, Any]],
    difficulty: str,
    batch_seed: int,
    batch_size: int,
    seed_retries: int,
) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    seed_map = {seed["id"]: seed for seed in [*seeds, *seed_replacements]}
    queue = deque(seeds)
    replacements = deque(seed_replacements)
    retries: Dict[int, int] = {seed["id"]: 0 for seed in seeds}
    used_seed_ids: set = set()
    target_count = len(seeds)
    max_batches = (len(seeds) + len(seed_replacements)) * (seed_retries + 1)
    batches = 0
    current_batch_size = max(1, batch_size)
    while len(items) < target_count and queue:
        batch = []
        while queue and len(batch) < max(1, current_batch_size):
            batch.append(queue.popleft())
        if not batch:
            break
        batch_ids = [seed["id"] for seed in batch]
        prompt = build_mcq_caption_prompt(batch, difficulty, batch_seed + batches)
        try:
            data = client.request_json(
                "Du er en erfaren eksamensforfatter i medicinsk fysiologi og anatomi. Svar kun med JSON.",
                prompt,
                temperature=0.5,
                max_tokens=estimate_mcq_max_tokens(len(batch)),
            )
        except RuntimeError as exc:
            if is_empty_response_error(exc):
                if len(batch) > 1:
                    split = max(1, len(batch) // 2)
                    left = batch[:split]
                    right = batch[split:]
                    for seed in reversed(right):
                        queue.appendleft(seed)
                    for seed in reversed(left):
                        queue.appendleft(seed)
                    current_batch_size = max(1, current_batch_size // 2)
                    log(
                        "  MCQ tomt svar, prøver med mindre batch "
                        f"({len(left)} + {len(right)})"
                    )
                    batches += 1
                    if batches > max_batches:
                        break
                    continue
                log("  MCQ tomt svar for enkelt seed, springer over")
                data = {"items": []}
            else:
                raise
        raw_items = data.get("items") or []
        if not isinstance(raw_items, list):
            raw_items = []
        accepted = 0
        accepted_ids = set()
        for raw in raw_items:
            if not isinstance(raw, dict):
                continue
            seed_id = raw.get("seedId")
            if seed_id not in seed_map:
                continue
            if seed_id in used_seed_ids:
                continue
            cleaned = sanitize_mcq_item(raw, raw.get("category", ""), difficulty, relaxed=True)
            if not cleaned:
                continue
            normalized_category = normalize_generated_category(cleaned["category"])
            if not normalized_category:
                continue
            cleaned["category"] = normalized_category
            items.append({"item": cleaned, "seed": seed_map[seed_id]})
            accepted += 1
            accepted_ids.add(seed_id)
            used_seed_ids.add(seed_id)
            if len(items) >= target_count:
                break
        rejected = [seed for seed in batch if seed["id"] not in accepted_ids]
        for seed in rejected:
            retries[seed["id"]] = retries.get(seed["id"], 0) + 1
            if retries[seed["id"]] <= seed_retries:
                queue.append(seed)
                continue
            if replacements:
                replacement = replacements.popleft()
                if replacement["id"] not in used_seed_ids:
                    retries.setdefault(replacement["id"], 0)
                    queue.append(replacement)
        label = ",".join(str(seed_id) for seed_id in batch_ids)
        log(f"  MCQ seeds [{label}]: +{accepted} (retry {len(rejected)})")
        batches += 1
        if batches > max_batches:
            break
    if len(items) < target_count:
        raise RuntimeError(f"Kunne ikke generere nok MCQ fra captions: {len(items)}/{target_count}")
    return items


def generate_short_from_captions(
    client: OpenAIClient,
    seeds: List[Dict[str, Any]],
    seed_replacements: List[Dict[str, Any]],
    difficulty: str,
    batch_seed: int,
    batch_size: int,
    seed_retries: int,
) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    seed_map = {seed["id"]: seed for seed in [*seeds, *seed_replacements]}
    queue = deque(seeds)
    replacements = deque(seed_replacements)
    retries: Dict[int, int] = {seed["id"]: 0 for seed in seeds}
    used_seed_ids: set = set()
    target_count = len(seeds)
    max_batches = (len(seeds) + len(seed_replacements)) * (seed_retries + 1)
    batches = 0
    current_batch_size = max(1, batch_size)
    while len(items) < target_count and queue:
        batch = []
        while queue and len(batch) < max(1, current_batch_size):
            batch.append(queue.popleft())
        if not batch:
            break
        batch_ids = [seed["id"] for seed in batch]
        prompt = build_short_caption_prompt(batch, difficulty, batch_seed + batches)
        try:
            data = client.request_json(
                "Du er en erfaren eksamensforfatter i medicinsk fysiologi og anatomi. Svar kun med JSON.",
                prompt,
                temperature=0.5,
                max_tokens=estimate_short_max_tokens(len(batch)),
            )
        except RuntimeError as exc:
            if is_empty_response_error(exc):
                if len(batch) > 1:
                    split = max(1, len(batch) // 2)
                    left = batch[:split]
                    right = batch[split:]
                    for seed in reversed(right):
                        queue.appendleft(seed)
                    for seed in reversed(left):
                        queue.appendleft(seed)
                    current_batch_size = max(1, current_batch_size // 2)
                    log(
                        "  Kortsvar tomt svar, prøver med mindre batch "
                        f"({len(left)} + {len(right)})"
                    )
                    batches += 1
                    if batches > max_batches:
                        break
                    continue
                log("  Kortsvar tomt svar for enkelt seed, springer over")
                data = {"items": []}
            else:
                raise
        raw_items = data.get("items") or []
        if not isinstance(raw_items, list):
            raw_items = []
        accepted = 0
        accepted_ids = set()
        for raw in raw_items:
            if not isinstance(raw, dict):
                continue
            seed_id = raw.get("seedId")
            if seed_id not in seed_map:
                continue
            if seed_id in used_seed_ids:
                continue
            cleaned = sanitize_short_item(raw, raw.get("category", ""), difficulty, relaxed=True)
            if not cleaned:
                continue
            normalized_category = normalize_generated_category(cleaned["category"])
            if not normalized_category:
                continue
            cleaned["category"] = normalized_category
            items.append({"item": cleaned, "seed": seed_map[seed_id]})
            accepted += 1
            accepted_ids.add(seed_id)
            used_seed_ids.add(seed_id)
            if len(items) >= target_count:
                break
        rejected = [seed for seed in batch if seed["id"] not in accepted_ids]
        for seed in rejected:
            retries[seed["id"]] = retries.get(seed["id"], 0) + 1
            if retries[seed["id"]] <= seed_retries:
                queue.append(seed)
                continue
            if replacements:
                replacement = replacements.popleft()
                if replacement["id"] not in used_seed_ids:
                    retries.setdefault(replacement["id"], 0)
                    queue.append(replacement)
        label = ",".join(str(seed_id) for seed_id in batch_ids)
        log(f"  Kortsvar seeds [{label}]: +{accepted} (retry {len(rejected)})")
        batches += 1
        if batches > max_batches:
            break
    if len(items) < target_count:
        raise RuntimeError(f"Kunne ikke generere nok kortsvar fra captions: {len(items)}/{target_count}")
    return items


def generate_mcq_for_category(
    client: OpenAIClient,
    category: str,
    difficulty: str,
    count: int,
    signatures: set,
    batch_seed: int,
    batch_size: int,
    strict_attempts: int,
    max_attempts: int,
) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    attempts = 0
    no_progress = 0
    log(f"  MCQ {category} ({difficulty}): 0/{count}")
    while len(items) < count:
        needed = count - len(items)
        relaxed = attempts >= strict_attempts or no_progress >= 2
        extra = 2 if relaxed else 0
        request_size = min(max(batch_size, 1), needed + extra + 2)
        prompt = build_mcq_prompt(category, difficulty, request_size, batch_seed + attempts)
        start = time.monotonic()
        data = client.request_json(
            "Du er en erfaren eksamensforfatter i medicinsk fysiologi og anatomi. Svar kun med JSON.",
            prompt,
            temperature=0.7 if relaxed else 0.5,
            max_tokens=estimate_mcq_max_tokens(request_size),
        )
        elapsed = time.monotonic() - start
        raw_items = data.get("items") or []
        if not isinstance(raw_items, list):
            raw_items = []
        accepted = 0
        for raw in raw_items:
            cleaned = sanitize_mcq_item(raw, category, difficulty, relaxed=relaxed)
            if not cleaned:
                continue
            sig = mcq_signature(cleaned["text"])
            if sig in signatures:
                continue
            signatures.add(sig)
            items.append(cleaned)
            accepted += 1
            if len(items) >= count:
                break
        attempts += 1
        no_progress = no_progress + 1 if accepted == 0 else 0
        log(f"  MCQ {category} ({difficulty}): {len(items)}/{count} (+{accepted}) {elapsed:.1f}s")
        if attempts > max_attempts:
            break
    if len(items) < count:
        raise RuntimeError(
            f"Kunne ikke generere nok MCQ for {category} ({difficulty}). {len(items)}/{count}"
        )
    return items


def generate_short_for_category(
    client: OpenAIClient,
    category: str,
    difficulty: str,
    count: int,
    signatures: set,
    batch_seed: int,
    batch_size: int,
    strict_attempts: int,
    max_attempts: int,
) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    attempts = 0
    no_progress = 0
    log(f"  Kortsvar {category} ({difficulty}): 0/{count}")
    while len(items) < count:
        needed = count - len(items)
        relaxed = attempts >= strict_attempts or no_progress >= 2
        extra = 1 if relaxed else 0
        request_size = min(max(batch_size, 1), needed + extra + 1)
        prompt = build_short_prompt(category, difficulty, request_size, batch_seed + attempts)
        start = time.monotonic()
        data = client.request_json(
            "Du er en erfaren eksamensforfatter i medicinsk fysiologi og anatomi. Svar kun med JSON.",
            prompt,
            temperature=0.7 if relaxed else 0.5,
            max_tokens=estimate_short_max_tokens(request_size),
        )
        elapsed = time.monotonic() - start
        raw_items = data.get("items") or []
        if not isinstance(raw_items, list):
            raw_items = []
        accepted = 0
        for raw in raw_items:
            cleaned = sanitize_short_item(raw, category, difficulty, relaxed=relaxed)
            if not cleaned:
                continue
            sig = short_signature(cleaned["prompt"])
            if sig in signatures:
                continue
            signatures.add(sig)
            items.append(cleaned)
            accepted += 1
            if len(items) >= count:
                break
        attempts += 1
        no_progress = no_progress + 1 if accepted == 0 else 0
        log(f"  Kortsvar {category} ({difficulty}): {len(items)}/{count} (+{accepted}) {elapsed:.1f}s")
        if attempts > max_attempts:
            break
    if len(items) < count:
        raise RuntimeError(
            f"Kunne ikke generere nok kortsvar for {category} ({difficulty}). {len(items)}/{count}"
        )
    return items


def build_generated_mcq(
    base: Dict[str, Any],
    number: int,
    session: str,
) -> Dict[str, Any]:
    return {
        "year": TARGET_YEAR,
        "number": number,
        "session": session,
        "category": base["category"],
        "text": base["text"],
        "options": base["options"],
        "correctLabel": base["correctLabel"],
    }


def build_generated_short(
    base: Dict[str, Any],
    opgave: int,
    session: str,
    image_path: Optional[str],
) -> Dict[str, Any]:
    return {
        "type": "short",
        "year": TARGET_YEAR,
        "session": session,
        "category": base["category"],
        "opgave": opgave,
        "opgaveTitle": base["category"],
        "opgaveIntro": None,
        "label": "a",
        "prompt": base["prompt"],
        "answer": base["answer"],
        "sources": ["Genereret"],
        "images": [image_path] if image_path else [],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generér nye fiktive MCQ + kortsvar.")
    parser.add_argument("--dry-run", action="store_true", help="Kør uden at skrive filer")
    parser.add_argument(
        "--refresh-images",
        action="store_true",
        help="Genberegn kun bogbilleder for genererede kortsvar (ingen AI-kald).",
    )
    parser.add_argument(
        "--top-percent",
        type=float,
        default=TOP_PERCENT_DEFAULT,
        help="Top procent af mest eksamensrelevante bogbilleder (default 30).",
    )
    parser.add_argument(
        "--seed-retries",
        type=int,
        default=SEED_RETRY_LIMIT,
        help=f"Antal retries pr. seed før den udskiftes (default {SEED_RETRY_LIMIT}).",
    )
    parser.add_argument(
        "--seed-pool-multiplier",
        type=int,
        default=SEED_POOL_MULTIPLIER,
        help=f"Hvor mange ekstra seeds der må bruges til erstatning (default {SEED_POOL_MULTIPLIER}x).",
    )
    parser.add_argument(
        "--legacy-mode",
        action="store_true",
        help="Brug den gamle kategori-baserede generator.",
    )
    parser.add_argument(
        "--batch-mcq",
        type=int,
        default=MCQ_BATCH_SIZE,
        help=f"Antal MCQ per API-kald (default {MCQ_BATCH_SIZE}).",
    )
    parser.add_argument(
        "--batch-short",
        type=int,
        default=SHORT_BATCH_SIZE,
        help=f"Antal kortsvar per API-kald (default {SHORT_BATCH_SIZE}).",
    )
    parser.add_argument(
        "--strict-attempts",
        type=int,
        default=6,
        help="Hvor mange forsøg før relaxed regler (default 6).",
    )
    parser.add_argument(
        "--max-attempts",
        type=int,
        default=18,
        help="Maks forsøg per kategori (default 18).",
    )
    args = parser.parse_args()

    load_env()
    client = None
    if not args.refresh_images:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY mangler i .env")
        model = os.environ.get("OPENAI_MODEL") or "gpt-4.1-mini"
        endpoint = os.environ.get("OPENAI_API_BASE") or "https://api.openai.com/v1/chat/completions"
        client = OpenAIClient(api_key, model, endpoint)
        log(f"Model: {model}")

    log("Indlæser data ...")
    mcq_data = load_json(QUESTIONS_PATH)
    short_data = load_json(SHORT_PATH)
    book_captions = load_json(BOOK_CAPTIONS_PATH)

    session_labels = {entry["session"] for entry in SET_DEFINITIONS}

    mcq_base = [
        q
        for q in mcq_data
        if not (q.get("year") == TARGET_YEAR and q.get("session") in session_labels)
    ]
    short_base = [
        q
        for q in short_data
        if not (q.get("year") == TARGET_YEAR and q.get("session") in session_labels)
    ]

    mcq_signatures = {mcq_signature(q.get("text", "")) for q in mcq_base}
    short_signatures = {short_signature(q.get("prompt", "")) for q in short_base}

    exam_weights = build_exam_token_weights(mcq_base, short_base)
    book_entries = build_book_entries(book_captions)
    scored_entries, threshold = compute_relevance(book_entries, exam_weights)
    top_entries, cutoff = select_top_entries(scored_entries, args.top_percent)
    enriched_captions, caption_summary = enrich_book_captions(
        book_captions, scored_entries, args.top_percent
    )
    relevant_entries = [
        entry
        for entry in top_entries
        if entry["hits"] >= 3 and entry["signal_hits"] >= 1
    ]

    relevance_payload = {
        "threshold": threshold,
        "topPercent": args.top_percent,
        "topCutoff": round(cutoff, 4),
        "imageCount": len(book_entries),
        "relevantCount": len(relevant_entries),
        "topCount": len(top_entries),
        "images": [
            {
                "path": entry["path"],
                "score": round(entry["norm_score"], 4),
                "hits": entry["hits"],
                "signal_hits": entry["signal_hits"],
                "summary": entry.get("summary"),
                "focus": entry.get("focus"),
                "keywords": entry.get("keywords"),
            }
            for entry in sorted(relevant_entries, key=lambda e: e["norm_score"], reverse=True)
        ],
    }

    if not args.dry_run:
        log("Gemmer relevans-score for bogbilleder ...")
        write_json(RELEVANCE_PATH, relevance_payload)
        write_json(BOOK_CAPTIONS_PATH, enriched_captions)

    if args.refresh_images:
        log("Opdaterer bogbilleder for genererede kortsvar ...")
        updated = 0
        removed = 0
        for question in short_data:
            session = str(question.get("session", "")).lower()
            if question.get("year") != TARGET_YEAR or "genereret" not in session:
                continue
            image_path = find_best_book_image(question, relevant_entries)
            if image_path:
                if question.get("images") != [image_path]:
                    updated += 1
                question["images"] = [image_path]
            else:
                if question.get("images"):
                    removed += 1
                question["images"] = []
        log(f"Opdateret billeder: {updated}, fjernet: {removed}")
        if args.dry_run:
            log("Dry run: not writing data files")
            return
        write_json(SHORT_PATH, short_data)
        log("Færdig.")
        return

    generated_mcq: List[Dict[str, Any]] = []
    generated_short: List[Dict[str, Any]] = []

    if not client:
        raise RuntimeError("Client er ikke initialiseret.")

    if not relevant_entries:
        raise RuntimeError("Ingen relevante bogbilleder at generere fra.")

    if args.legacy_mode:
        for set_index, definition in enumerate(SET_DEFINITIONS, start=1):
            session = definition["session"]
            difficulty = definition["difficulty"]
            log(f"Genererer sæt: {session} ({difficulty}) ...")
            mcq_counts = distribute_counts(definition["mcq"], CATEGORY_POOL, seed=set_index * 17)
            short_counts = distribute_counts(definition["short"], CATEGORY_POOL, seed=set_index * 31)

            mcq_pool: List[Dict[str, Any]] = []
            short_pool: List[Dict[str, Any]] = []

            for category in CATEGORY_POOL:
                mcq_needed = mcq_counts[category]
                short_needed = short_counts[category]
                if mcq_needed:
                    mcq_pool.extend(
                        generate_mcq_for_category(
                            client,
                            category,
                            difficulty,
                            mcq_needed,
                            mcq_signatures,
                            batch_seed=set_index * 100 + CATEGORY_POOL.index(category) * 7,
                            batch_size=args.batch_mcq,
                            strict_attempts=args.strict_attempts,
                            max_attempts=args.max_attempts,
                        )
                    )
                if short_needed:
                    short_pool.extend(
                        generate_short_for_category(
                            client,
                            category,
                            difficulty,
                            short_needed,
                            short_signatures,
                            batch_seed=set_index * 200 + CATEGORY_POOL.index(category) * 11,
                            batch_size=args.batch_short,
                            strict_attempts=args.strict_attempts,
                            max_attempts=args.max_attempts,
                        )
                    )

            if len(mcq_pool) != definition["mcq"]:
                raise RuntimeError(f"MCQ count mismatch for {session}: {len(mcq_pool)}")
            if len(short_pool) != definition["short"]:
                raise RuntimeError(f"Short count mismatch for {session}: {len(short_pool)}")

            for idx, item in enumerate(mcq_pool, start=1):
                generated_mcq.append(build_generated_mcq(item, idx, session))
            for idx, item in enumerate(short_pool, start=1):
                image_path = find_best_book_image(item, relevant_entries)
                generated_short.append(build_generated_short(item, idx, session, image_path))
            log(f"Færdig: {session}")
    else:
        for set_index, definition in enumerate(SET_DEFINITIONS, start=1):
            session = definition["session"]
            difficulty = definition["difficulty"]
            log(f"Genererer sæt fra bogbilleder: {session} ({difficulty}) ...")

            mcq_pool_size = max(definition["mcq"], definition["mcq"] * args.seed_pool_multiplier)
            short_pool_size = max(definition["short"], definition["short"] * args.seed_pool_multiplier)

            mcq_seed_pool = select_caption_seeds(
                relevant_entries,
                mcq_pool_size,
                seed=set_index * 101,
            )
            short_seed_pool = select_caption_seeds(
                relevant_entries,
                short_pool_size,
                seed=set_index * 203,
            )
            mcq_seeds = mcq_seed_pool[: definition["mcq"]]
            mcq_replacements = mcq_seed_pool[definition["mcq"] :]
            short_seeds = short_seed_pool[: definition["short"]]
            short_replacements = short_seed_pool[definition["short"] :]

            mcq_results = generate_mcq_from_captions(
                client,
                mcq_seeds,
                mcq_replacements,
                difficulty,
                batch_seed=set_index * 1000,
                batch_size=args.batch_mcq,
                seed_retries=args.seed_retries,
            )
            short_results = generate_short_from_captions(
                client,
                short_seeds,
                short_replacements,
                difficulty,
                batch_seed=set_index * 2000,
                batch_size=args.batch_short,
                seed_retries=args.seed_retries,
            )

            for idx, result in enumerate(mcq_results, start=1):
                generated_mcq.append(build_generated_mcq(result["item"], idx, session))
            for idx, result in enumerate(short_results, start=1):
                image_path = result["seed"]["path"]
                generated_short.append(build_generated_short(result["item"], idx, session, image_path))
            log(f"Færdig: {session}")

    new_mcq = mcq_base + generated_mcq
    new_short = short_base + generated_short

    if args.dry_run:
        log("Dry run: not writing data files")
        return

    log("Skriver spørgsmål til data/ ...")
    write_json(QUESTIONS_PATH, new_mcq)
    write_json(SHORT_PATH, new_short)
    log("Færdig.")


if __name__ == "__main__":
    main()
