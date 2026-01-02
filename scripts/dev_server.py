from __future__ import annotations

import base64
import io
import json
import mimetypes
import os
import re
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT_PATH = Path(__file__).resolve().parent.parent
DEFAULT_MODEL = "gpt-5.2"
DEFAULT_VISION_MODEL = DEFAULT_MODEL
DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions"
DEFAULT_TTS_MODEL = "tts-1"
DEFAULT_TTS_ENDPOINT = "https://api.openai.com/v1/audio/speech"
DEFAULT_TRANSCRIBE_MODEL = "whisper-1"
DEFAULT_TRANSCRIBE_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions"
TTS_VOICES = {"alloy", "echo", "fable", "onyx", "nova", "shimmer"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_AUDIO_BYTES = 25 * 1024 * 1024


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


def clamp_tts_speed(value: Any) -> float:
    try:
        speed = float(value)
    except (TypeError, ValueError):
        return 1.0
    return max(0.25, min(speed, 4.0))


def clean_tts_text(text: str) -> str:
    cleaned = re.sub(r"[ \t]+", " ", text)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def language_instruction(language: str) -> str:
    if language == "da":
        return "Svar altid på dansk."
    return f"Respond in {language}."


def call_openai_tts(
    api_key: str,
    endpoint: str,
    model: str,
    voice: str,
    speed: float,
    text: str,
) -> bytes:
    request_payload = {
        "model": model,
        "input": text,
        "voice": voice,
        "speed": speed,
        "response_format": "mp3",
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
            return response.read()
    except HTTPError as error:
        raise RuntimeError(parse_openai_error(error)) from error
    except URLError as error:
        raise RuntimeError("Could not reach OpenAI") from error


def parse_audio_data_url(data_url: str) -> Tuple[str, bytes]:
    match = re.match(r"^data:(?P<mime>[^;]+)(?:;[^,]+)*;base64,(?P<data>.+)$", data_url)
    if not match:
        raise RuntimeError("Invalid audioData")
    mime_type = match.group("mime").strip().lower()
    if not mime_type.startswith("audio/"):
        raise RuntimeError("Unsupported audio type")
    try:
        decoded = base64.b64decode(match.group("data"))
    except Exception as error:
        raise RuntimeError("Invalid audio data") from error
    if len(decoded) > MAX_AUDIO_BYTES:
        raise RuntimeError("Audio too large")
    return mime_type, decoded


def guess_audio_filename(mime_type: str) -> str:
    base_type = mime_type.split(";", 1)[0].strip().lower()
    extension_map = {
        "audio/webm": ".webm",
        "audio/ogg": ".ogg",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".mp4",
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
    }
    extension = extension_map.get(base_type) or mimetypes.guess_extension(base_type) or ".webm"
    return f"recording{extension}"


def build_multipart_form(
    fields: Dict[str, str],
    files: List[Tuple[str, str, str, bytes]],
) -> Tuple[bytes, str]:
    boundary = f"----CodexBoundary{uuid.uuid4().hex}"
    buffer = io.BytesIO()

    def write_line(line: str) -> None:
        buffer.write(line.encode("utf-8"))
        buffer.write(b"\r\n")

    for name, value in fields.items():
        write_line(f"--{boundary}")
        write_line(f'Content-Disposition: form-data; name="{name}"')
        write_line("")
        write_line(str(value))

    for field_name, filename, content_type, data in files:
        write_line(f"--{boundary}")
        write_line(
            f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"'
        )
        write_line(f"Content-Type: {content_type}")
        write_line("")
        buffer.write(data)
        buffer.write(b"\r\n")

    write_line(f"--{boundary}--")
    return buffer.getvalue(), f"multipart/form-data; boundary={boundary}"


def call_openai_transcribe(
    api_key: str,
    endpoint: str,
    model: str,
    audio_bytes: bytes,
    mime_type: str,
    language: str,
) -> Dict[str, Any]:
    fields = {"model": model}
    if language:
        fields["language"] = language
    filename = guess_audio_filename(mime_type)
    body, content_type = build_multipart_form(
        fields, [("file", filename, mime_type, audio_bytes)]
    )
    request = Request(
        endpoint,
        data=body,
        headers={
            "Content-Type": content_type,
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=60) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as error:
        raise RuntimeError(parse_openai_error(error)) from error
    except URLError as error:
        raise RuntimeError("Could not reach OpenAI") from error

    try:
        return json.loads(raw)
    except Exception as error:
        raise RuntimeError("Could not parse transcription response") from error


def resolve_image_path(raw_path: str) -> Path:
    candidate = (ROOT_PATH / raw_path).resolve()
    if ROOT_PATH != candidate and ROOT_PATH not in candidate.parents:
        raise RuntimeError("Image path not allowed")
    if not candidate.exists():
        raise RuntimeError("Image not found")
    return candidate


def load_image_as_data_url(raw_path: str) -> str:
    path = resolve_image_path(raw_path)
    data = path.read_bytes()
    if len(data) > MAX_IMAGE_BYTES:
        raise RuntimeError("Image too large")
    mime, _ = mimetypes.guess_type(str(path))
    if not mime or not mime.startswith("image/"):
        raise RuntimeError("Unsupported image type")
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def is_data_url(value: str) -> bool:
    return value.startswith("data:image/")


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
        raise RuntimeError("Could not parse vision response") from error


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

    def send_audio(self, status: int, payload: bytes, content_type: str = "audio/mpeg") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/health":
            model = os.environ.get("OPENAI_MODEL") or DEFAULT_MODEL
            tts_model = os.environ.get("OPENAI_TTS_MODEL") or DEFAULT_TTS_MODEL
            if not os.environ.get("OPENAI_API_KEY"):
                self.send_json(503, {"status": "missing_key", "model": model, "tts_model": tts_model})
                return
            self.send_json(200, {"status": "ok", "model": model, "tts_model": tts_model})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path not in {
            "/api/grade",
            "/api/explain",
            "/api/hint",
            "/api/tts",
            "/api/vision",
            "/api/transcribe",
        }:
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

        if self.path == "/api/tts":
            text = clean_tts_text(str(payload.get("text", "")))
            voice = str(payload.get("voice", "")).strip().lower() or "alloy"
            speed = clamp_tts_speed(payload.get("speed", 1.0))

            if not text:
                self.send_json(400, {"error": "Missing text"})
                return
            if voice not in TTS_VOICES:
                self.send_json(400, {"error": "Unknown voice"})
                return

            tts_model = os.environ.get("OPENAI_TTS_MODEL") or DEFAULT_TTS_MODEL
            tts_endpoint = os.environ.get("OPENAI_TTS_ENDPOINT") or DEFAULT_TTS_ENDPOINT

            try:
                audio = call_openai_tts(api_key, tts_endpoint, tts_model, voice, speed, text)
            except RuntimeError as error:
                self.send_json(502, {"error": str(error)})
                return

            self.send_audio(200, audio)
            return

        if self.path == "/api/transcribe":
            audio_data = str(payload.get("audioData", "")).strip()
            language = str(payload.get("language", "")).strip().lower()
            if not audio_data:
                self.send_json(400, {"error": "Missing audioData"})
                return

            try:
                mime_type, audio_bytes = parse_audio_data_url(audio_data)
            except RuntimeError as error:
                self.send_json(400, {"error": str(error)})
                return

            transcribe_model = (
                os.environ.get("OPENAI_TRANSCRIBE_MODEL") or DEFAULT_TRANSCRIBE_MODEL
            )
            transcribe_endpoint = (
                os.environ.get("OPENAI_TRANSCRIBE_ENDPOINT") or DEFAULT_TRANSCRIBE_ENDPOINT
            )

            try:
                result = call_openai_transcribe(
                    api_key,
                    transcribe_endpoint,
                    transcribe_model,
                    audio_bytes,
                    mime_type,
                    language,
                )
            except RuntimeError as error:
                self.send_json(502, {"error": str(error)})
                return

            text = str(result.get("text", "")).strip()
            self.send_json(200, {"text": text, "model": transcribe_model})
            return

        if self.path == "/api/vision":
            task = str(payload.get("task", "")).strip().lower()
            language = str(payload.get("language", "da")).strip().lower()
            vision_model = os.environ.get("OPENAI_VISION_MODEL") or model or DEFAULT_VISION_MODEL
            image_url = ""

            raw_image_path = str(payload.get("imagePath", "")).strip()
            raw_image_data = str(payload.get("imageData", "")).strip()

            if raw_image_path:
                try:
                    image_url = load_image_as_data_url(raw_image_path)
                except RuntimeError as error:
                    self.send_json(400, {"error": str(error)})
                    return
            elif raw_image_data:
                if not is_data_url(raw_image_data):
                    self.send_json(400, {"error": "Invalid imageData"})
                    return
                if len(raw_image_data) > MAX_IMAGE_BYTES * 2:
                    self.send_json(400, {"error": "Image too large"})
                    return
                image_url = raw_image_data

            if not image_url:
                self.send_json(400, {"error": "Missing image"})
                return

            if task == "figure":
                system_prompt = (
                    "Du er en præcis beskriver af medicinske illustrationer. "
                    "Beskriv kun det, der er synligt i billedet, uden at gætte. "
                    "Returnér kun JSON med felterne: description (string), labels (list), topics (list). "
                    f"{language_instruction(language)}"
                )
                user_prompt = (
                    f"Sprog: {language}\n"
                    "Beskriv figuren for en studerende i 2-4 korte sætninger. "
                    "Inkludér nøgleetiketter og relationer, hvis de er vist."
                )
            elif task == "sketch":
                question = str(payload.get("question", "")).strip()
                model_answer = str(payload.get("modelAnswer", "")).strip()
                if not question:
                    self.send_json(400, {"error": "Missing question"})
                    return
                system_prompt = (
                    "Du er en underviser, der vurderer en studerendes skitse. "
                    "Beskriv først hvad skitsen viser, og sammenlign derefter med modelsvaret. "
                    "Returnér kun JSON med felterne: description (string), match (number 0-1), "
                    "matched (list), missing (list), feedback (string). "
                    f"{language_instruction(language)}"
                )
                user_prompt = (
                    f"Sprog: {language}\n"
                    f"Spørgsmål: {question}\n"
                    f"Modelbesvarelse: {model_answer}\n"
                    "Vurdér hvor godt skitsen matcher modelbesvarelsen."
                )
            else:
                self.send_json(400, {"error": "Unknown task"})
                return

            try:
                result = call_openai_vision(api_key, endpoint, vision_model, system_prompt, user_prompt, image_url)
            except RuntimeError as error:
                self.send_json(502, {"error": str(error)})
                return

            response_payload: Dict[str, Any] = {"model": vision_model}
            if task == "figure":
                response_payload["description"] = str(result.get("description", "")).strip()
                response_payload["labels"] = result.get("labels") or []
                response_payload["topics"] = result.get("topics") or []
            else:
                response_payload["description"] = str(result.get("description", "")).strip()
                response_payload["match"] = float(result.get("match", 0) or 0)
                response_payload["matched"] = result.get("matched") or []
                response_payload["missing"] = result.get("missing") or []
                response_payload["feedback"] = str(result.get("feedback", "")).strip()

            self.send_json(200, response_payload)
            return

        if self.path == "/api/hint":
            question = str(payload.get("question", "")).strip()
            model_answer = str(payload.get("modelAnswer", "")).strip()
            user_answer = str(payload.get("userAnswer", "")).strip()
            max_points = float(payload.get("maxPoints", 0) or 0)
            awarded_points = float(payload.get("awardedPoints", 0) or 0)
            ignore_sketch = bool(payload.get("ignoreSketch"))
            language = str(payload.get("language", "da")).strip().lower()
            expand = bool(payload.get("expand"))
            previous_hint = str(payload.get("previousHint", "")).strip()
            if not previous_hint:
                expand = False

            if not question or not model_answer:
                self.send_json(400, {"error": "Missing question or modelAnswer"})
                return

            if expand:
                system_prompt = (
                    "Du er en hjælpsom underviser. "
                    "Udvid det eksisterende hint med flere detaljer og sammenhænge. "
                    "Bevar hint-formatet og afslør ikke facit. "
                    "Returnér kun JSON med feltet: hint (string). "
                    "Hint må være 3-5 korte sætninger. "
                    f"{language_instruction(language)}"
                )
            else:
                system_prompt = (
                    "Du er en hjælpsom underviser. "
                    "Giv et kort hint, der hjælper den studerende mod det rigtige svar uden at afsløre facit. "
                    "Fokusér på det vigtigste, der mangler eller er misforstået. "
                    "Returnér kun JSON med feltet: hint (string). "
                    "Hint må være 1-2 korte sætninger. "
                    f"{language_instruction(language)}"
                )

            if ignore_sketch:
                system_prompt += " Ignorér krav om skitse/tegning; giv kun hint til tekstsvaret."

            user_prompt = (
                f"Sprog: {language}\n"
                f"Spørgsmål: {question}\n"
                f"Modelbesvarelse: {model_answer}\n"
                f"Studerendes svar: {user_answer}\n"
                f"Point: {awarded_points} / {max_points}\n"
                + (f"Eksisterende hint: {previous_hint}\n" if expand else "")
                + "Giv et hint (ikke facit). Returnér kun JSON."
            )

            try:
                result = call_openai(api_key, endpoint, model, system_prompt, user_prompt)
            except RuntimeError as error:
                self.send_json(502, {"error": str(error)})
                return

            hint = str(result.get("hint", "")).strip()
            self.send_json(200, {"hint": hint, "model": model})
            return

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
                "Du er en streng, men fair eksaminator. "
                "Vurdér den studerendes svar mod modelsvaret. "
                "Returnér kun JSON med felterne: "
                "score (number), feedback (short text), missing (list), matched (list). "
                f"Score skal være mellem 0 og {max_points}. "
                "Feedback skal være kort, konkret og på dansk. "
                f"{language_instruction(language)}"
            )

            if ignore_sketch:
                system_prompt += " Ignorér krav om skitse/tegning; vurder kun tekstsvaret."

            user_prompt = (
                f"Sprog: {language}\n"
                f"Spørgsmål: {prompt}\n"
                f"Modelbesvarelse: {model_answer}\n"
                f"Studerendes svar: {user_answer}\n"
                f"Maks point: {max_points}\n"
                "Returnér kun JSON."
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
        expand = bool(payload.get("expand"))
        previous_explanation = str(payload.get("previousExplanation", "")).strip()
        if not previous_explanation:
            expand = False

        if not question_type or not question:
            self.send_json(400, {"error": "Missing type or question"})
            return

        if question_type == "mcq":
            options = payload.get("options") or []
            correct_label = str(payload.get("correctLabel", "")).strip().upper()
            user_label = str(payload.get("userLabel", "")).strip().upper()
            skipped = bool(payload.get("skipped"))
            if not correct_label:
                self.send_json(400, {"error": "Missing correctLabel"})
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

            if expand:
                system_prompt = (
                    "Du er en hjælpsom tutor. "
                    "Udvid den eksisterende forklaring med flere detaljer og sammenhænge. "
                    "Gå et lag dybere i mekanismerne uden at gentage den eksisterende forklaring ordret. "
                    "Svar i 4-7 korte sætninger. "
                    "Returnér kun JSON med feltet: explanation. "
                    f"{language_instruction(language)}"
                )
            else:
                system_prompt = (
                    "Du er en hjælpsom tutor. "
                    "Forklar kort hvorfor det korrekte svar passer. "
                    "Hvis et elevsvar er angivet, forklar også kort hvorfor det ikke gør. "
                    "Fokusér på den centrale begrundelse fremfor bare rigtigt/forkert. "
                    "Svar i 2-4 korte sætninger. "
                    "Returnér kun JSON med feltet: explanation. "
                    f"{language_instruction(language)}"
                )

            if skipped or not user_label:
                student_line = "Studerendes svar: Sprunget over"
            else:
                student_line = f"Studerendes svar: {user_label}. {user_text}"

            user_prompt = (
                f"Sprog: {language}\n"
                f"Spørgsmål: {question}\n"
                f"Muligheder: {' | '.join(formatted_options)}\n"
                f"Korrekt svar: {correct_label}. {correct_text}\n"
                f"{student_line}\n"
                + (
                    f"Eksisterende forklaring: {previous_explanation}\n"
                    if expand
                    else ""
                )
                + "Returnér kun JSON."
            )
        elif question_type == "short":
            model_answer = str(payload.get("modelAnswer", "")).strip()
            user_answer = str(payload.get("userAnswer", "")).strip()
            max_points = float(payload.get("maxPoints", 0) or 0)
            awarded_points = float(payload.get("awardedPoints", 0) or 0)
            ignore_sketch = bool(payload.get("ignoreSketch"))
            skipped = bool(payload.get("skipped"))

            if expand:
                system_prompt = (
                    "Du er en hjælpsom tutor. "
                    "Udvid den eksisterende forklaring med flere detaljer og faglige sammenhænge. "
                    "Gå et lag dybere uden at gentage den eksisterende forklaring ordret. "
                    "Svar i 4-7 korte sætninger uden at kopiere facit. "
                    "Returnér kun JSON med feltet: explanation. "
                    f"{language_instruction(language)}"
                )
            else:
                system_prompt = (
                    "Du er en hjælpsom tutor. "
                    "Forklar kort hvad et godt svar skal indeholde, og hvad der evt. mangler eller er misforstået. "
                    "Hvis der ikke er givet et svar, forklar kort det centrale indhold. "
                    "Svar i 2-4 korte sætninger uden at kopiere facit. "
                    "Returnér kun JSON med feltet: explanation. "
                    f"{language_instruction(language)}"
                )

            if ignore_sketch:
                system_prompt += " Ignorér krav om skitse/tegning; vurder kun tekstsvaret."

            if skipped or not user_answer:
                student_line = "Studerendes svar: Sprunget over"
            else:
                student_line = f"Studerendes svar: {user_answer}"

            user_prompt = (
                f"Sprog: {language}\n"
                f"Spørgsmål: {question}\n"
                f"Modelbesvarelse: {model_answer}\n"
                f"{student_line}\n"
                f"Point: {awarded_points} / {max_points}\n"
                + (
                    f"Eksisterende forklaring: {previous_explanation}\n"
                    if expand
                    else ""
                )
                + "Returnér kun JSON."
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
