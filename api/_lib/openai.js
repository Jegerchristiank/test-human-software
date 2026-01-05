const { optionalEnv } = require("./env");

const DEFAULT_MODEL = "gpt-5.2";
const DEFAULT_VISION_MODEL = DEFAULT_MODEL;
const DEFAULT_TTS_MODEL = "tts-1";
const DEFAULT_TRANSCRIBE_MODEL = "whisper-1";
const DEFAULT_CHAT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_TTS_ENDPOINT = "https://api.openai.com/v1/audio/speech";
const DEFAULT_TRANSCRIBE_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

function parseAiResponse(content) {
  if (typeof content !== "string") {
    throw new Error("Invalid AI response");
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Could not parse AI response");
    }
    return JSON.parse(match[0]);
  }
}

async function callOpenAiJson({ apiKey, model, systemPrompt, userPrompt }) {
  const endpoint = optionalEnv("OPENAI_API_BASE", DEFAULT_CHAT_ENDPOINT);
  const payload = {
    model: model || optionalEnv("OPENAI_MODEL", DEFAULT_MODEL),
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `OpenAI error ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) message = `OpenAI error ${res.status}: ${parsed.error.message}`;
    } catch (error) {
      // keep default
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return parseAiResponse(content);
}

async function callOpenAiVision({ apiKey, model, systemPrompt, userPrompt, imageUrl }) {
  const endpoint = optionalEnv("OPENAI_API_BASE", DEFAULT_CHAT_ENDPOINT);
  const payload = {
    model: model || optionalEnv("OPENAI_VISION_MODEL", DEFAULT_VISION_MODEL),
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `OpenAI error ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) message = `OpenAI error ${res.status}: ${parsed.error.message}`;
    } catch (error) {
      // keep default
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return parseAiResponse(content);
}

async function callOpenAiTts({ apiKey, model, voice, speed, text }) {
  const endpoint = optionalEnv("OPENAI_TTS_ENDPOINT", DEFAULT_TTS_ENDPOINT);
  const payload = {
    model: model || optionalEnv("OPENAI_TTS_MODEL", DEFAULT_TTS_MODEL),
    input: text,
    voice,
    speed,
    response_format: "mp3",
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `OpenAI error ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) message = `OpenAI error ${res.status}: ${parsed.error.message}`;
    } catch (error) {
      // keep default
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return Buffer.from(await res.arrayBuffer());
}

function buildMultipartForm(fields, files) {
  const boundary = `----CodexBoundary${Math.random().toString(16).slice(2)}`;
  const chunks = [];

  const writeLine = (line) => {
    chunks.push(Buffer.from(line + "\r\n"));
  };

  Object.entries(fields || {}).forEach(([name, value]) => {
    writeLine(`--${boundary}`);
    writeLine(`Content-Disposition: form-data; name="${name}"`);
    writeLine("");
    writeLine(String(value));
  });

  (files || []).forEach(({ fieldName, filename, contentType, data }) => {
    writeLine(`--${boundary}`);
    writeLine(`Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"`);
    writeLine(`Content-Type: ${contentType}`);
    writeLine("");
    chunks.push(Buffer.from(data));
    writeLine("");
  });

  writeLine(`--${boundary}--`);

  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

async function callOpenAiTranscribe({ apiKey, model, audioBytes, mimeType, filename, language }) {
  const endpoint = optionalEnv("OPENAI_TRANSCRIBE_ENDPOINT", DEFAULT_TRANSCRIBE_ENDPOINT);
  const payload = buildMultipartForm(
    {
      model: model || optionalEnv("OPENAI_TRANSCRIBE_MODEL", DEFAULT_TRANSCRIBE_MODEL),
      language: language || "da",
    },
    [
      {
        fieldName: "file",
        filename,
        contentType: mimeType,
        data: audioBytes,
      },
    ]
  );

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": payload.contentType,
      Authorization: `Bearer ${apiKey}`,
    },
    body: payload.body,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `OpenAI error ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) message = `OpenAI error ${res.status}: ${parsed.error.message}`;
    } catch (error) {
      // keep default
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

module.exports = {
  DEFAULT_MODEL,
  DEFAULT_TTS_MODEL,
  DEFAULT_VISION_MODEL,
  DEFAULT_TRANSCRIBE_MODEL,
  callOpenAiJson,
  callOpenAiVision,
  callOpenAiTts,
  callOpenAiTranscribe,
};
