from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

ROOT_PATH = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_PATH / "scripts"))

import convert_rawdata  # type: ignore
import convert_kortsvar  # type: ignore
import convert_sygdomslaere  # type: ignore

PIPELINE_VERSION = "2026-01-11.1"
NAMESPACE_UUID = uuid.UUID("9e2d6f3b-6a3a-4e4b-8f36-9a7c56a8d5a4")
MARKER_START = "-- BEGIN STUDIO_PIPELINE_DATA"
MARKER_END = "-- END STUDIO_PIPELINE_DATA"

RAW_MC_PATH = ROOT_PATH / "rawdata-mc"
RAW_SHORT_PATH = ROOT_PATH / "rawdata-kortsvar"
RAW_DISEASE_PATH = ROOT_PATH / "rawdata-sygdomslaere.txt"
FIGURE_CAPTIONS_PATH = ROOT_PATH / "data" / "figure_captions.json"
FIGURE_AUDIT_PATH = ROOT_PATH / "data" / "figure_audit.json"
SCHEMA_PATH = ROOT_PATH / "supabase" / "schema.sql"

SOURCE_VERSIONS = {
    "rawdata-mc": "rawdata-mc-v1",
    "rawdata-kortsvar": "rawdata-kortsvar-v1",
    "rawdata-sygdomslaere": "rawdata-sygdomslaere-v1",
    "figure-captions": "figure-captions-v1",
    "figure-audit": "figure-audit-v1",
}

STUDY_SLUG_HUMAN = "human"
STUDY_SLUG_DISEASE = "sygdomslaere"

DOMAIN_KEY_MAP = {
    "noeglepunkter": "key_points",
    "definition": "definition",
    "forekomst": "occurrence",
    "patogenese": "pathogenesis",
    "aetiologi": "etiology",
    "symptomer og fund": "symptoms_findings",
    "diagnostik": "diagnostics",
    "foelgetilstande": "complications",
    "behandling": "treatment",
    "forebyggelse": "prevention",
    "prognose": "prognosis",
}


def normalize_session_key(value: Optional[str]) -> str:
    return value or "na"


def canonical_json(payload: Any) -> str:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def hash_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def content_hash(payload: Any) -> str:
    return hash_text(canonical_json(payload))


def build_run_id(source_system: str, source_hash: str) -> str:
    name = f"{source_system}:{source_hash}:{PIPELINE_VERSION}"
    return str(uuid.uuid5(NAMESPACE_UUID, name))


def slugify(text: str) -> str:
    lowered = text.strip().lower()
    lowered = re.sub(r"[^a-z0-9\s_-]", "", lowered)
    lowered = re.sub(r"\s+", "_", lowered).strip("_")
    return lowered or "unknown"


def normalize_domain_title(title: str) -> str:
    normalized = title.strip().lower()
    normalized = (
        normalized.replace("\u00e6", "ae")
        .replace("\u00f8", "oe")
        .replace("\u00e5", "aa")
    )
    return normalized


def sql_literal(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value)
    text = text.replace("'", "''")
    return f"'{text}'"


def ensure_keys(record: Dict[str, Any], required: Iterable[str], allowed: Iterable[str]) -> None:
    required_set = set(required)
    allowed_set = set(allowed)
    missing = [key for key in required_set if record.get(key) is None]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(sorted(missing))}")
    unknown = [key for key in record.keys() if key not in allowed_set]
    if unknown:
        raise ValueError(f"Unknown fields: {', '.join(sorted(unknown))}")


def ensure_type(value: Any, expected: type, field: str) -> None:
    if value is None:
        return
    if not isinstance(value, expected):
        raise TypeError(f"Invalid type for {field}: expected {expected.__name__}")


def validate_items(items: List[Dict[str, Any]]) -> None:
    allowed = {
        "study_slug",
        "item_type",
        "source_system",
        "source_key",
        "source_version",
        "source_hash",
        "content_hash",
        "ingest_run_id",
        "year",
        "session",
        "category",
        "title",
        "stem",
        "priority",
        "weight",
        "is_active",
    }
    required = {
        "study_slug",
        "item_type",
        "source_system",
        "source_key",
        "source_version",
        "content_hash",
        "stem",
    }
    for item in items:
        ensure_keys(item, required, allowed)
        ensure_type(item.get("study_slug"), str, "study_slug")
        ensure_type(item.get("item_type"), str, "item_type")
        ensure_type(item.get("source_key"), str, "source_key")
        ensure_type(item.get("stem"), str, "stem")
        ensure_type(item.get("year"), int, "year")
        ensure_type(item.get("is_active"), bool, "is_active")


def validate_parts(parts: List[Dict[str, Any]]) -> None:
    allowed = {
        "item_source_key",
        "part_type",
        "label",
        "domain_key",
        "prompt",
        "sort_order",
        "source_key",
        "content_hash",
    }
    required = {"item_source_key", "part_type", "prompt", "source_key", "content_hash"}
    for part in parts:
        ensure_keys(part, required, allowed)
        ensure_type(part.get("item_source_key"), str, "item_source_key")
        ensure_type(part.get("prompt"), str, "prompt")
        ensure_type(part.get("sort_order"), int, "sort_order")


def validate_choices(choices: List[Dict[str, Any]]) -> None:
    allowed = {
        "item_source_key",
        "label",
        "choice_text",
        "is_correct",
        "sort_order",
        "source_key",
        "content_hash",
    }
    required = {"item_source_key", "label", "choice_text", "is_correct", "source_key", "content_hash"}
    for choice in choices:
        ensure_keys(choice, required, allowed)
        ensure_type(choice.get("item_source_key"), str, "item_source_key")
        ensure_type(choice.get("label"), str, "label")
        ensure_type(choice.get("choice_text"), str, "choice_text")
        ensure_type(choice.get("is_correct"), bool, "is_correct")
        ensure_type(choice.get("sort_order"), int, "sort_order")


def validate_model_answers(model_answers: List[Dict[str, Any]]) -> None:
    allowed = {
        "item_source_key",
        "part_source_key",
        "answer_text",
        "version",
        "source_key",
        "source_type",
        "source_system",
        "source_version",
        "content_hash",
    }
    required = {"item_source_key", "answer_text", "version", "source_key", "content_hash"}
    for answer in model_answers:
        ensure_keys(answer, required, allowed)
        ensure_type(answer.get("item_source_key"), str, "item_source_key")
        ensure_type(answer.get("answer_text"), str, "answer_text")
        ensure_type(answer.get("version"), str, "version")


def validate_sources(sources: List[Dict[str, Any]]) -> None:
    allowed = {"item_source_key", "part_source_key", "source_text", "source_key"}
    required = {"source_text", "source_key"}
    for source in sources:
        ensure_keys(source, required, allowed)
        ensure_type(source.get("source_text"), str, "source_text")


def validate_assets(assets: List[Dict[str, Any]]) -> None:
    allowed = {
        "item_source_key",
        "part_source_key",
        "asset_type",
        "asset_path",
        "source_key",
        "content_hash",
    }
    required = {"item_source_key", "asset_type", "asset_path", "source_key", "content_hash"}
    for asset in assets:
        ensure_keys(asset, required, allowed)
        ensure_type(asset.get("asset_path"), str, "asset_path")


def validate_annotations(annotations: List[Dict[str, Any]]) -> None:
    allowed = {
        "asset_source_key",
        "annotation_type",
        "text",
        "match",
        "confidence",
        "issues",
        "source_type",
        "llm_model",
        "llm_prompt_version",
        "llm_output_version",
        "source_key",
        "source_system",
        "source_version",
        "content_hash",
    }
    required = {"asset_source_key", "annotation_type", "llm_output_version", "source_key", "content_hash"}
    for annotation in annotations:
        ensure_keys(annotation, required, allowed)
        ensure_type(annotation.get("annotation_type"), str, "annotation_type")
        ensure_type(annotation.get("llm_output_version"), str, "llm_output_version")


def load_json(path: Path) -> Any:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def build_mcq_items(raw_text: str, ingest_run_id: str, source_hash: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    questions = convert_rawdata.parse_raw_data(raw_text)
    items: List[Dict[str, Any]] = []
    choices: List[Dict[str, Any]] = []
    for question in questions:
        session_key = normalize_session_key(question.session)
        source_key = f"human:mcq:{question.year}:{session_key}:{question.number}"
        item_payload = {
            "item_type": "mcq",
            "year": question.year,
            "session": question.session,
            "category": question.category,
            "title": None,
            "stem": question.text,
        }
        items.append(
            {
                "study_slug": STUDY_SLUG_HUMAN,
                "item_type": "mcq",
                "source_system": "rawdata-mc",
                "source_key": source_key,
                "source_version": SOURCE_VERSIONS["rawdata-mc"],
                "source_hash": source_hash,
                "content_hash": content_hash(item_payload),
                "ingest_run_id": ingest_run_id,
                "year": question.year,
                "session": question.session,
                "category": question.category,
                "title": None,
                "stem": question.text,
                "priority": None,
                "weight": None,
                "is_active": True,
            }
        )
        for idx, option in enumerate(question.options):
            choice_payload = {
                "label": option.label,
                "text": option.text,
                "is_correct": option.is_correct,
                "sort_order": idx,
            }
            choices.append(
                {
                    "item_source_key": source_key,
                    "label": option.label,
                    "choice_text": option.text,
                    "is_correct": option.is_correct,
                    "sort_order": idx,
                    "source_key": f"{source_key}:choice:{option.label}",
                    "content_hash": content_hash(choice_payload),
                }
            )
    return items, choices


def normalize_short_category(title: Optional[str]) -> str:
    cleaned = convert_kortsvar.HOVEDEMN_TITLE_RE.sub("", title or "").strip()
    return cleaned or (title or "")


def build_short_items(raw_text: str, ingest_run_id: str, source_hash: str) -> Tuple[
    List[Dict[str, Any]],
    List[Dict[str, Any]],
    List[Dict[str, Any]],
    List[Dict[str, Any]],
    List[Dict[str, Any]],
]:
    questions = convert_kortsvar.parse_raw_data(raw_text)
    convert_kortsvar.fill_missing_answers(questions)
    convert_kortsvar.assign_images(questions)

    groups: Dict[Tuple[int, Optional[str], int, str, Optional[str], str], List[Any]] = {}
    for question in questions:
        category = normalize_short_category(question.opgave_title)
        key = (
            question.year,
            question.session,
            question.opgave,
            question.opgave_title,
            question.opgave_intro,
            category,
        )
        groups.setdefault(key, []).append(question)

    items: List[Dict[str, Any]] = []
    parts: List[Dict[str, Any]] = []
    model_answers: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    assets: List[Dict[str, Any]] = []

    for (year, session, opgave, title, intro, category), group in groups.items():
        session_key = normalize_session_key(session)
        source_key = f"human:short:{year}:{session_key}:{opgave}"
        stem = intro or title
        item_payload = {
            "item_type": "short",
            "year": year,
            "session": session,
            "category": category,
            "title": title,
            "stem": stem,
        }
        items.append(
            {
                "study_slug": STUDY_SLUG_HUMAN,
                "item_type": "short",
                "source_system": "rawdata-kortsvar",
                "source_key": source_key,
                "source_version": SOURCE_VERSIONS["rawdata-kortsvar"],
                "source_hash": source_hash,
                "content_hash": content_hash(item_payload),
                "ingest_run_id": ingest_run_id,
                "year": year,
                "session": session,
                "category": category,
                "title": title,
                "stem": stem,
                "priority": None,
                "weight": None,
                "is_active": True,
            }
        )
        sorted_group = sorted(group, key=lambda q: (q.label or "", q.prompt))
        for idx, question in enumerate(sorted_group):
            label = question.label.lower() if question.label else None
            part_suffix = label or f"p{idx + 1}"
            part_key = f"{source_key}:part:{part_suffix}"
            part_payload = {
                "label": label,
                "prompt": question.prompt,
                "sort_order": idx,
            }
            parts.append(
                {
                    "item_source_key": source_key,
                    "part_type": "short_part",
                    "label": label,
                    "domain_key": None,
                    "prompt": question.prompt,
                    "sort_order": idx,
                    "source_key": part_key,
                    "content_hash": content_hash(part_payload),
                }
            )
            answer_payload = {"answer_text": question.answer}
            model_answers.append(
                {
                    "item_source_key": source_key,
                    "part_source_key": part_key,
                    "answer_text": question.answer,
                    "version": SOURCE_VERSIONS["rawdata-kortsvar"],
                    "source_key": f"{part_key}:model_answer:{SOURCE_VERSIONS['rawdata-kortsvar']}",
                    "source_type": "human",
                    "source_system": "rawdata-kortsvar",
                    "source_version": SOURCE_VERSIONS["rawdata-kortsvar"],
                    "content_hash": content_hash(answer_payload),
                }
            )
            for source_index, source_text in enumerate(question.sources or []):
                sources.append(
                    {
                        "item_source_key": source_key,
                        "part_source_key": part_key,
                        "source_text": source_text,
                        "source_key": f"{part_key}:source:{source_index}",
                    }
                )
            for asset_path in question.images or []:
                asset_key = f"{part_key}:asset:{hash_text(asset_path)[:12]}"
                asset_payload = {"asset_path": asset_path}
                assets.append(
                    {
                        "item_source_key": source_key,
                        "part_source_key": part_key,
                        "asset_type": "image",
                        "asset_path": asset_path,
                        "source_key": asset_key,
                        "content_hash": content_hash(asset_payload),
                    }
                )

    return items, parts, model_answers, sources, assets


def build_disease_items(ingest_run_id: str, source_hash: str) -> Tuple[
    List[Dict[str, Any]],
    List[Dict[str, Any]],
    List[Dict[str, Any]],
]:
    rows = convert_sygdomslaere.read_tsv(RAW_DISEASE_PATH)
    header, mapped = convert_sygdomslaere.parse_rows(rows)
    payload = convert_sygdomslaere.build_payload(mapped, header)

    items: List[Dict[str, Any]] = []
    parts: List[Dict[str, Any]] = []
    model_answers: List[Dict[str, Any]] = []

    diseases = payload.get("diseases") or []
    for disease in diseases:
        disease_id = disease.get("id")
        if not disease_id:
            continue
        source_key = f"sygdomslaere:disease:{disease_id}"
        weight = disease.get("weight") or None
        priority = disease.get("priority") or None
        item_payload = {
            "item_type": "disease",
            "year": None,
            "session": None,
            "category": disease.get("category"),
            "title": disease.get("name"),
            "stem": disease.get("name"),
            "priority": priority,
            "weight": weight,
        }
        items.append(
            {
                "study_slug": STUDY_SLUG_DISEASE,
                "item_type": "disease",
                "source_system": "rawdata-sygdomslaere",
                "source_key": source_key,
                "source_version": SOURCE_VERSIONS["rawdata-sygdomslaere"],
                "source_hash": source_hash,
                "content_hash": content_hash(item_payload),
                "ingest_run_id": ingest_run_id,
                "year": None,
                "session": None,
                "category": disease.get("category"),
                "title": disease.get("name"),
                "stem": disease.get("name"),
                "priority": priority,
                "weight": weight,
                "is_active": True,
            }
        )
        sections = disease.get("sections") or []
        for idx, section in enumerate(sections):
            title = section.get("title") or ""
            normalized_title = normalize_domain_title(title)
            domain_key = DOMAIN_KEY_MAP.get(normalized_title) or slugify(normalized_title)
            part_key = f"{source_key}:domain:{domain_key}"
            part_payload = {
                "domain_key": domain_key,
                "prompt": title,
                "sort_order": idx,
            }
            parts.append(
                {
                    "item_source_key": source_key,
                    "part_type": "disease_domain",
                    "label": None,
                    "domain_key": domain_key,
                    "prompt": title,
                    "sort_order": idx,
                    "source_key": part_key,
                    "content_hash": content_hash(part_payload),
                }
            )
            answer_payload = {"answer_text": section.get("content")}
            model_answers.append(
                {
                    "item_source_key": source_key,
                    "part_source_key": part_key,
                    "answer_text": section.get("content"),
                    "version": SOURCE_VERSIONS["rawdata-sygdomslaere"],
                    "source_key": f"{part_key}:model_answer:{SOURCE_VERSIONS['rawdata-sygdomslaere']}",
                    "source_type": "human",
                    "source_system": "rawdata-sygdomslaere",
                    "source_version": SOURCE_VERSIONS["rawdata-sygdomslaere"],
                    "content_hash": content_hash(answer_payload),
                }
            )

    return items, parts, model_answers


def build_annotations(
    assets: List[Dict[str, Any]],
    captions: Optional[Dict[str, Any]],
    audits: Optional[List[Dict[str, Any]]],
) -> List[Dict[str, Any]]:
    asset_by_path: Dict[str, List[Dict[str, Any]]] = {}
    for asset in assets:
        asset_by_path.setdefault(asset["asset_path"], []).append(asset)
    annotations: List[Dict[str, Any]] = []

    if captions:
        for path, caption in captions.items():
            asset_list = asset_by_path.get(path, [])
            if not asset_list:
                continue
            for asset in asset_list:
                payload = {"text": caption}
                source_key = f"{asset['source_key']}:caption:legacy"
                annotations.append(
                    {
                        "asset_source_key": asset["source_key"],
                        "annotation_type": "caption",
                        "text": caption,
                        "match": None,
                        "confidence": None,
                        "issues": None,
                        "source_type": "legacy",
                        "llm_model": None,
                        "llm_prompt_version": None,
                        "llm_output_version": "legacy",
                        "source_key": source_key,
                        "source_system": "figure-captions",
                        "source_version": SOURCE_VERSIONS["figure-captions"],
                        "content_hash": content_hash(payload),
                    }
                )

    if audits:
        for audit in audits:
            path = audit.get("image")
            if not path:
                continue
            asset_list = asset_by_path.get(path, [])
            if not asset_list:
                continue
            model = audit.get("model")
            prompt_version = audit.get("prompt_version")
            source_type = "llm" if model and prompt_version else "legacy"
            output_version = prompt_version or "legacy"
            payload = {
                "text": audit.get("description"),
                "match": audit.get("match"),
                "confidence": audit.get("confidence"),
                "issues": audit.get("issues"),
            }
            for asset in asset_list:
                source_key = f"{asset['source_key']}:audit:{output_version}"
                annotations.append(
                    {
                        "asset_source_key": asset["source_key"],
                        "annotation_type": "audit",
                        "text": audit.get("description"),
                        "match": bool(audit.get("match")) if audit.get("match") is not None else None,
                        "confidence": float(audit.get("confidence"))
                        if audit.get("confidence") is not None
                        else None,
                        "issues": audit.get("issues"),
                        "source_type": source_type,
                        "llm_model": model,
                        "llm_prompt_version": prompt_version,
                        "llm_output_version": output_version,
                        "source_key": source_key,
                        "source_system": "figure-audit",
                        "source_version": SOURCE_VERSIONS["figure-audit"],
                        "content_hash": content_hash(payload),
                    }
                )

    return annotations


def insert_ingest_run_sql(run_id: str, source_system: str, source_hash: str) -> str:
    return (
        "insert into public.ingest_runs "
        "(id, source_system, source_version, source_hash, pipeline_version, status) values ("
        f"{sql_literal(run_id)}, {sql_literal(source_system)}, {sql_literal(SOURCE_VERSIONS[source_system])}, "
        f"{sql_literal(source_hash)}, {sql_literal(PIPELINE_VERSION)}, 'completed') "
        "on conflict (id) do nothing;"
    )


def build_item_insert_sql(item: Dict[str, Any]) -> str:
    study_id = f"(select id from public.studies where slug = {sql_literal(item['study_slug'])})"
    fields = (
        "study_id, item_type, source_system, source_key, source_version, source_hash, content_hash, "
        "ingest_run_id, year, session, category, title, stem, priority, weight, is_active"
    )
    values = (
        f"{study_id}, {sql_literal(item['item_type'])}, {sql_literal(item['source_system'])}, "
        f"{sql_literal(item['source_key'])}, {sql_literal(item['source_version'])}, {sql_literal(item.get('source_hash'))}, "
        f"{sql_literal(item['content_hash'])}, {sql_literal(item.get('ingest_run_id'))}, {sql_literal(item.get('year'))}, "
        f"{sql_literal(item.get('session'))}, {sql_literal(item.get('category'))}, {sql_literal(item.get('title'))}, "
        f"{sql_literal(item.get('stem'))}, {sql_literal(item.get('priority'))}, {sql_literal(item.get('weight'))}, "
        f"{sql_literal(item.get('is_active'))}"
    )
    return (
        f"insert into public.study_items ({fields}) values ({values}) "
        "on conflict (source_key) do update set "
        "item_type = excluded.item_type, "
        "source_system = excluded.source_system, "
        "source_version = excluded.source_version, "
        "source_hash = excluded.source_hash, "
        "content_hash = excluded.content_hash, "
        "ingest_run_id = excluded.ingest_run_id, "
        "year = excluded.year, "
        "session = excluded.session, "
        "category = excluded.category, "
        "title = excluded.title, "
        "stem = excluded.stem, "
        "priority = excluded.priority, "
        "weight = excluded.weight, "
        "is_active = excluded.is_active "
        "where public.study_items.content_hash is distinct from excluded.content_hash;"
    )


def build_choice_insert_sql(choice: Dict[str, Any]) -> str:
    item_id = (
        f"(select id from public.study_items where source_key = {sql_literal(choice['item_source_key'])})"
    )
    fields = "item_id, label, choice_text, is_correct, sort_order, source_key, content_hash"
    values = (
        f"{item_id}, {sql_literal(choice['label'])}, {sql_literal(choice['choice_text'])}, "
        f"{sql_literal(choice['is_correct'])}, {sql_literal(choice.get('sort_order'))}, "
        f"{sql_literal(choice['source_key'])}, {sql_literal(choice['content_hash'])}"
    )
    return (
        f"insert into public.item_choices ({fields}) values ({values}) "
        "on conflict (source_key) do update set "
        "choice_text = excluded.choice_text, "
        "is_correct = excluded.is_correct, "
        "sort_order = excluded.sort_order, "
        "content_hash = excluded.content_hash "
        "where public.item_choices.content_hash is distinct from excluded.content_hash;"
    )


def build_part_insert_sql(part: Dict[str, Any]) -> str:
    item_id = f"(select id from public.study_items where source_key = {sql_literal(part['item_source_key'])})"
    domain_id = (
        f"(select id from public.disease_domains where domain_key = {sql_literal(part.get('domain_key'))})"
        if part.get("domain_key")
        else "null"
    )
    fields = "item_id, part_type, label, domain_id, prompt, sort_order, source_key, content_hash"
    values = (
        f"{item_id}, {sql_literal(part['part_type'])}, {sql_literal(part.get('label'))}, {domain_id}, "
        f"{sql_literal(part.get('prompt'))}, {sql_literal(part.get('sort_order'))}, "
        f"{sql_literal(part['source_key'])}, {sql_literal(part['content_hash'])}"
    )
    return (
        f"insert into public.item_parts ({fields}) values ({values}) "
        "on conflict (source_key) do update set "
        "part_type = excluded.part_type, "
        "label = excluded.label, "
        "domain_id = excluded.domain_id, "
        "prompt = excluded.prompt, "
        "sort_order = excluded.sort_order, "
        "content_hash = excluded.content_hash "
        "where public.item_parts.content_hash is distinct from excluded.content_hash;"
    )


def build_model_answer_insert_sql(answer: Dict[str, Any]) -> str:
    item_id = (
        f"(select id from public.study_items where source_key = {sql_literal(answer['item_source_key'])})"
    )
    part_id = (
        f"(select id from public.item_parts where source_key = {sql_literal(answer.get('part_source_key'))})"
        if answer.get("part_source_key")
        else "null"
    )
    fields = (
        "item_id, part_id, answer_text, version, source_key, source_type, source_system, "
        "source_version, content_hash"
    )
    values = (
        f"{item_id}, {part_id}, {sql_literal(answer['answer_text'])}, {sql_literal(answer['version'])}, "
        f"{sql_literal(answer['source_key'])}, {sql_literal(answer.get('source_type'))}, "
        f"{sql_literal(answer.get('source_system'))}, {sql_literal(answer.get('source_version'))}, "
        f"{sql_literal(answer['content_hash'])}"
    )
    return (
        f"insert into public.item_model_answers ({fields}) values ({values}) "
        "on conflict (source_key) do update set "
        "answer_text = excluded.answer_text, "
        "version = excluded.version, "
        "source_type = excluded.source_type, "
        "source_system = excluded.source_system, "
        "source_version = excluded.source_version, "
        "content_hash = excluded.content_hash "
        "where public.item_model_answers.content_hash is distinct from excluded.content_hash;"
    )


def build_source_insert_sql(source: Dict[str, Any]) -> str:
    item_id = (
        f"(select id from public.study_items where source_key = {sql_literal(source.get('item_source_key'))})"
        if source.get("item_source_key")
        else "null"
    )
    part_id = (
        f"(select id from public.item_parts where source_key = {sql_literal(source.get('part_source_key'))})"
        if source.get("part_source_key")
        else "null"
    )
    fields = "item_id, part_id, source_text, source_key"
    values = (
        f"{item_id}, {part_id}, {sql_literal(source['source_text'])}, {sql_literal(source['source_key'])}"
    )
    return (
        f"insert into public.item_sources ({fields}) values ({values}) "
        "on conflict (source_key) do update set "
        "source_text = excluded.source_text "
        "where public.item_sources.source_text is distinct from excluded.source_text;"
    )


def build_asset_insert_sql(asset: Dict[str, Any]) -> str:
    item_id = (
        f"(select id from public.study_items where source_key = {sql_literal(asset['item_source_key'])})"
    )
    part_id = (
        f"(select id from public.item_parts where source_key = {sql_literal(asset.get('part_source_key'))})"
        if asset.get("part_source_key")
        else "null"
    )
    fields = "item_id, part_id, asset_type, asset_path, source_key, content_hash"
    values = (
        f"{item_id}, {part_id}, {sql_literal(asset['asset_type'])}, {sql_literal(asset['asset_path'])}, "
        f"{sql_literal(asset['source_key'])}, {sql_literal(asset['content_hash'])}"
    )
    return (
        f"insert into public.item_assets ({fields}) values ({values}) "
        "on conflict (source_key) do update set "
        "asset_type = excluded.asset_type, "
        "asset_path = excluded.asset_path, "
        "content_hash = excluded.content_hash "
        "where public.item_assets.content_hash is distinct from excluded.content_hash;"
    )


def build_annotation_insert_sql(annotation: Dict[str, Any]) -> str:
    asset_id = (
        f"(select id from public.item_assets where source_key = {sql_literal(annotation['asset_source_key'])})"
    )
    fields = (
        "asset_id, annotation_type, text, match, confidence, issues, source_type, "
        "llm_model, llm_prompt_version, llm_output_version, source_key, source_system, "
        "source_version, content_hash"
    )
    values = (
        f"{asset_id}, {sql_literal(annotation['annotation_type'])}, {sql_literal(annotation.get('text'))}, "
        f"{sql_literal(annotation.get('match'))}, {sql_literal(annotation.get('confidence'))}, "
        f"{sql_literal(annotation.get('issues'))}, {sql_literal(annotation.get('source_type'))}, "
        f"{sql_literal(annotation.get('llm_model'))}, {sql_literal(annotation.get('llm_prompt_version'))}, "
        f"{sql_literal(annotation.get('llm_output_version'))}, {sql_literal(annotation['source_key'])}, "
        f"{sql_literal(annotation.get('source_system'))}, {sql_literal(annotation.get('source_version'))}, "
        f"{sql_literal(annotation['content_hash'])}"
    )
    return (
        f"insert into public.asset_annotations ({fields}) values ({values}) "
        "on conflict (source_key) do update set "
        "annotation_type = excluded.annotation_type, "
        "text = excluded.text, "
        "match = excluded.match, "
        "confidence = excluded.confidence, "
        "issues = excluded.issues, "
        "source_type = excluded.source_type, "
        "llm_model = excluded.llm_model, "
        "llm_prompt_version = excluded.llm_prompt_version, "
        "llm_output_version = excluded.llm_output_version, "
        "source_system = excluded.source_system, "
        "source_version = excluded.source_version, "
        "content_hash = excluded.content_hash "
        "where public.asset_annotations.content_hash is distinct from excluded.content_hash;"
    )


def replace_schema_section(schema_path: Path, block: str) -> None:
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_path}")
    content = schema_path.read_text(encoding="utf-8")
    if MARKER_START in content and MARKER_END in content:
        before, remainder = content.split(MARKER_START, 1)
        _, after = remainder.split(MARKER_END, 1)
        updated = f"{before.rstrip()}\n\n{block}\n\n{after.lstrip()}"
    else:
        separator = "" if content.endswith("\n") else "\n"
        updated = f"{content}{separator}\n{block}\n"
    schema_path.write_text(updated, encoding="utf-8")


def build_pipeline(schema_path: Path) -> None:
    mcq_text = RAW_MC_PATH.read_text(encoding="utf-8")
    short_text = RAW_SHORT_PATH.read_text(encoding="utf-8")
    disease_text = RAW_DISEASE_PATH.read_text(encoding="utf-8")

    mcq_hash = hash_bytes(mcq_text.encode("utf-8"))
    short_hash = hash_bytes(short_text.encode("utf-8"))
    disease_hash = hash_bytes(disease_text.encode("utf-8"))

    mcq_run_id = build_run_id("rawdata-mc", mcq_hash)
    short_run_id = build_run_id("rawdata-kortsvar", short_hash)
    disease_run_id = build_run_id("rawdata-sygdomslaere", disease_hash)

    mcq_items, mcq_choices = build_mcq_items(mcq_text, mcq_run_id, mcq_hash)
    short_items, short_parts, short_answers, short_sources, short_assets = build_short_items(
        short_text, short_run_id, short_hash
    )
    disease_items, disease_parts, disease_answers = build_disease_items(disease_run_id, disease_hash)

    items = mcq_items + short_items + disease_items
    parts = short_parts + disease_parts
    model_answers = short_answers + disease_answers
    sources = short_sources
    assets = short_assets

    captions = load_json(FIGURE_CAPTIONS_PATH) or {}
    audits = load_json(FIGURE_AUDIT_PATH) or []
    annotations = build_annotations(assets, captions, audits)

    validate_items(items)
    validate_choices(mcq_choices)
    validate_parts(parts)
    validate_model_answers(model_answers)
    validate_sources(sources)
    validate_assets(assets)
    validate_annotations(annotations)

    statements: List[str] = []
    statements.append("-- Generated by scripts/build_studio_pipeline.py")
    statements.append(f"-- pipeline_version: {PIPELINE_VERSION}")
    statements.append("begin;")
    statements.append(insert_ingest_run_sql(mcq_run_id, "rawdata-mc", mcq_hash))
    statements.append(insert_ingest_run_sql(short_run_id, "rawdata-kortsvar", short_hash))
    statements.append(insert_ingest_run_sql(disease_run_id, "rawdata-sygdomslaere", disease_hash))

    for item in items:
        statements.append(build_item_insert_sql(item))
    for choice in mcq_choices:
        statements.append(build_choice_insert_sql(choice))
    for part in parts:
        statements.append(build_part_insert_sql(part))
    for answer in model_answers:
        statements.append(build_model_answer_insert_sql(answer))
    for source in sources:
        statements.append(build_source_insert_sql(source))
    for asset in assets:
        statements.append(build_asset_insert_sql(asset))
    for annotation in annotations:
        statements.append(build_annotation_insert_sql(annotation))

    statements.append("commit;")
    block = "\n".join([MARKER_START, *statements, MARKER_END])
    replace_schema_section(schema_path, block)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build deterministic studio pipeline SQL.")
    parser.add_argument(
        "--schema",
        type=Path,
        default=SCHEMA_PATH,
        help="Path to supabase/schema.sql (required).",
    )
    args = parser.parse_args()
    if args.schema.resolve() != SCHEMA_PATH.resolve():
        raise SystemExit("Output must be supabase/schema.sql per repo policy.")
    build_pipeline(args.schema)
    print(f"Pipeline SQL written into {args.schema}")


if __name__ == "__main__":
    main()
