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
            model = os.environ.get("OPENAI_MODEL") or "gpt-4.1-mini"
            if not os.environ.get("OPENAI_API_KEY"):
                self.send_json(503, {"status": "missing_key", "model": model})
                return
            self.send_json(200, {"status": "ok", "model": model})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path != "/api/grade":
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

        prompt = str(payload.get("prompt", "")).strip()
        model_answer = str(payload.get("modelAnswer", "")).strip()
        user_answer = str(payload.get("userAnswer", "")).strip()
        max_points = float(payload.get("maxPoints", 0) or 0)
        ignore_sketch = bool(payload.get("ignoreSketch"))
        language = str(payload.get("language", "da")).strip().lower()

        if not prompt or not user_answer:
            self.send_json(400, {"error": "Missing prompt or userAnswer"})
            return

        model = os.environ.get("OPENAI_MODEL") or "gpt-4.1-mini"
        endpoint = os.environ.get("OPENAI_API_BASE") or "https://api.openai.com/v1/chat/completions"

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
            self.send_json(502, {"error": f"OpenAI error: {error.code}"})
            return
        except URLError:
            self.send_json(502, {"error": "Could not reach OpenAI"})
            return

        try:
            data = json.loads(raw)
            content = data["choices"][0]["message"]["content"]
            result = parse_ai_response(content)
        except Exception:
            self.send_json(502, {"error": "Could not parse AI response"})
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


def main() -> None:
    load_env()
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), AppHandler)
    print(f"Server running on http://localhost:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
