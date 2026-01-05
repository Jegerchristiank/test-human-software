const fs = require("fs");
const path = require("path");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const IMAGE_MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const AUDIO_EXT_BY_MIME = {
  "audio/webm": ".webm",
  "audio/ogg": ".ogg",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".mp4",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
};

function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}

function parseDataUrl(dataUrl, { maxBytes, typePrefix }) {
  const match = /^data:([^;]+)(?:;[^,]+)*;base64,(.+)$/i.exec(dataUrl || "");
  if (!match) {
    const error = new Error("Invalid data URL");
    error.code = "INVALID_DATA_URL";
    throw error;
  }
  const mimeType = match[1].toLowerCase();
  if (typePrefix && !mimeType.startsWith(typePrefix)) {
    const error = new Error("Unsupported media type");
    error.code = "UNSUPPORTED_MEDIA";
    throw error;
  }
  const buffer = Buffer.from(match[2], "base64");
  if (maxBytes && buffer.length > maxBytes) {
    const error = new Error("Payload too large");
    error.code = "PAYLOAD_TOO_LARGE";
    throw error;
  }
  return { mimeType, buffer };
}

function parseImageDataUrl(dataUrl) {
  return parseDataUrl(dataUrl, { maxBytes: MAX_IMAGE_BYTES, typePrefix: "image/" });
}

function parseAudioDataUrl(dataUrl) {
  return parseDataUrl(dataUrl, { maxBytes: MAX_AUDIO_BYTES, typePrefix: "audio/" });
}

function guessAudioFilename(mimeType) {
  const extension = AUDIO_EXT_BY_MIME[mimeType] || ".webm";
  return `recording${extension}`;
}

function resolveImagePath(imagePath, { rootDir, allowedPrefixes = [] } = {}) {
  if (!imagePath || typeof imagePath !== "string") {
    const error = new Error("Missing image path");
    error.code = "MISSING_IMAGE";
    throw error;
  }
  if (path.isAbsolute(imagePath)) {
    const error = new Error("Invalid image path");
    error.code = "INVALID_PATH";
    throw error;
  }
  const normalized = path.normalize(imagePath).replace(/^([.][\/])+/, "");
  if (normalized.includes("..")) {
    const error = new Error("Invalid image path");
    error.code = "INVALID_PATH";
    throw error;
  }
  if (allowedPrefixes.length) {
    const allowed = allowedPrefixes.some((prefix) => normalized.startsWith(prefix));
    if (!allowed) {
      const error = new Error("Image path not allowed");
      error.code = "INVALID_PATH";
      throw error;
    }
  }
  const baseDir = rootDir || process.cwd();
  const resolved = path.join(baseDir, normalized);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    const error = new Error("Invalid image path");
    error.code = "INVALID_PATH";
    throw error;
  }
  return resolved;
}

function loadImageAsDataUrl(imagePath, { rootDir, allowedPrefixes } = {}) {
  const resolved = resolveImagePath(imagePath, { rootDir, allowedPrefixes });
  const ext = path.extname(resolved).toLowerCase();
  const mimeType = IMAGE_MIME_BY_EXT[ext];
  if (!mimeType) {
    const error = new Error("Unsupported image type");
    error.code = "UNSUPPORTED_IMAGE";
    throw error;
  }
  const buffer = fs.readFileSync(resolved);
  if (buffer.length > MAX_IMAGE_BYTES) {
    const error = new Error("Image too large");
    error.code = "PAYLOAD_TOO_LARGE";
    throw error;
  }
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

module.exports = {
  MAX_IMAGE_BYTES,
  MAX_AUDIO_BYTES,
  isDataUrl,
  parseImageDataUrl,
  parseAudioDataUrl,
  guessAudioFilename,
  loadImageAsDataUrl,
};
