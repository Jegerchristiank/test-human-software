from __future__ import annotations

import json
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT_PATH = Path(__file__).resolve().parent.parent
DEFAULT_MODEL = "gpt-5.2"
DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions"


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


def parse_ai_response(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
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


def call_openai(api_key: str, endpoint: str, model: str, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    request_payload = {
        "model": model,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
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
        with urlopen(request, timeout=30) as response:
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


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, directory=str(ROOT_PATH), **kwargs)

    def send_json(self, status: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/health":
            model = os.environ.get("OPENAI_MODEL") or DEFAULT_MODEL
            if not os.environ.get("OPENAI_API_KEY"):
                self.send_json(503, {"status": "missing_key", "model": model})
                return
            self.send_json(200, {"status": "ok", "model": model})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path not in {"/api/grade", "/api/explain"}:
            self.send_json(404, {"error": "Not found"})
            return

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self.send_json(503, {"error": "OPENAI_API_KEY missing in .env"})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length)
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Could not read JSON"})
            return

        model = os.environ.get("OPENAI_MODEL") or DEFAULT_MODEL
        endpoint = os.environ.get("OPENAI_API_BASE") or DEFAULT_ENDPOINT

        if self.path == "/api/grade":
            prompt = str(payload.get("prompt", "")).strip()
            model_answer = str(payload.get("modelAnswer", "")).strip()
            user_answer = str(payload.get("userAnswer", "")).strip()
            max_points = float(payload.get("maxPoints", 0) or 0)
            ignore_sketch = bool(payload.get("ignoreSketch"))
            language = str(payload.get("language", "da")).strip().lower()

            if not prompt or not user_answer:
                self.send_json(400, {"error": "Missing prompt or userAnswer"})
                return

            system_prompt = (
                "You are a strict but fair examiner. "
                "Assess the student's answer against the model answer. "
                "Return JSON only with fields: "
                "score (number), feedback (short text), missing (list), matched (list). "
                f"Score must be between 0 and {max_points}. "
                "Feedback must be concise and concrete."
            )

            if ignore_sketch:
                system_prompt += " Ignore any sketch/drawing requirement; evaluate only the text response."

            user_prompt = (
                f"Language: {language}\n"
                f"Question: {prompt}\n"
                f"Model answer: {model_answer}\n"
                f"Student answer: {user_answer}\n"
                f"Max points: {max_points}\n"
                "Respond with JSON only."
            )

            try:
                result = call_openai(api_key, endpoint, model, system_prompt, user_prompt)
            except RuntimeError as error:
                self.send_json(502, {"error": str(error)})
                return

            score = float(result.get("score", 0) or 0)
            score = max(0, min(score, max_points))
            feedback = str(result.get("feedback", "")).strip()
            missing = result.get("missing") or []
            matched = result.get("matched") or []

            self.send_json(
                200,
                {
                    "score": score,
                    "feedback": feedback,
                    "missing": missing,
                    "matched": matched,
                    "model": model,
                },
            )
            return

        question_type = str(payload.get("type", "")).strip().lower()
        question = str(payload.get("question", "")).strip()
        language = str(payload.get("language", "da")).strip().lower()

        if not question_type or not question:
            self.send_json(400, {"error": "Missing type or question"})
            return

        if question_type == "mcq":
            options = payload.get("options") or []
            correct_label = str(payload.get("correctLabel", "")).strip().upper()
            user_label = str(payload.get("userLabel", "")).strip().upper()
            if not correct_label or not user_label:
                self.send_json(400, {"error": "Missing correctLabel or userLabel"})
                return

            formatted_options = []
            for option in options:
                label = str(option.get("label", "")).strip().upper()
                text = str(option.get("text", "")).strip()
                if label:
                    formatted_options.append(f"{label}. {text}")

            def find_option_text(label: str) -> str:
                for option in options:
                    if str(option.get("label", "")).strip().upper() == label:
                        return str(option.get("text", "")).strip()
                return ""

            correct_text = find_option_text(correct_label)
            user_text = find_option_text(user_label)

            system_prompt = (
                "You are a concise tutor. "
                "Explain why the student's answer is wrong and why the correct answer is right. "
                "Keep it short (1-3 sentences). "
                "Return JSON only with field: explanation."
            )

            user_prompt = (
                f"Language: {language}\n"
                f"Question: {question}\n"
                f"Options: {' | '.join(formatted_options)}\n"
                f"Correct answer: {correct_label}. {correct_text}\n"
                f"Student answer: {user_label}. {user_text}\n"
                "Respond with JSON only."
            )
        elif question_type == "short":
            model_answer = str(payload.get("modelAnswer", "")).strip()
            user_answer = str(payload.get("userAnswer", "")).strip()
            max_points = float(payload.get("maxPoints", 0) or 0)
            awarded_points = float(payload.get("awardedPoints", 0) or 0)
            ignore_sketch = bool(payload.get("ignoreSketch"))

            if not user_answer:
                self.send_json(400, {"error": "Missing userAnswer"})
                return

            system_prompt = (
                "You are a concise tutor. "
                "Explain briefly what is missing or incorrect in the student's answer. "
                "Keep it short (1-3 sentences). "
                "Return JSON only with field: explanation."
            )

            if ignore_sketch:
                system_prompt += " Ignore any sketch/drawing requirement; evaluate only the text response."

            user_prompt = (
                f"Language: {language}\n"
                f"Question: {question}\n"
                f"Model answer: {model_answer}\n"
                f"Student answer: {user_answer}\n"
                f"Score: {awarded_points} / {max_points}\n"
                "Respond with JSON only."
            )
        else:
            self.send_json(400, {"error": "Unknown type"})
            return

        try:
            result = call_openai(api_key, endpoint, model, system_prompt, user_prompt)
        except RuntimeError as error:
            self.send_json(502, {"error": str(error)})
            return

        explanation = str(result.get("explanation", "")).strip()
        self.send_json(200, {"explanation": explanation, "model": model})


def main() -> None:
    load_env()
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), AppHandler)
    print(f"Server running on http://localhost:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
