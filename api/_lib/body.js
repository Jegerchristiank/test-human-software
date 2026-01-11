const DEFAULT_LIMIT_BYTES = 8 * 1024 * 1024; // 8MB

function readRawBody(req, limitBytes = DEFAULT_LIMIT_BYTES) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

async function readJson(req, limitBytes) {
  const raw = await readRawBody(req, limitBytes);
  try {
    return JSON.parse(raw.toString("utf-8"));
  } catch (error) {
    const err = new Error("Invalid JSON");
    err.cause = error;
    throw err;
  }
}

async function readJsonAllowEmpty(req, limitBytes) {
  const raw = await readRawBody(req, limitBytes);
  if (!raw || raw.length === 0) return {};
  const text = raw.toString("utf-8").trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    const err = new Error("Invalid JSON");
    err.cause = error;
    throw err;
  }
}

module.exports = {
  readRawBody,
  readJson,
  readJsonAllowEmpty,
  DEFAULT_LIMIT_BYTES,
};
