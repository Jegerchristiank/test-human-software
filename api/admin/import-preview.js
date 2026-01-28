const { readJson } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { validatePayload } = require("../_lib/validate");
const { isAdminUser, isImportEnabled } = require("../_lib/admin");
const { previewImport } = require("../_lib/importer");

const BODY_LIMIT_BYTES = 2 * 1024 * 1024;
const MAX_IMPORT_CHARS = 1_500_000;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJson(req, BODY_LIMIT_BYTES);
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return sendError(res, status, error.message || "Invalid JSON");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "admin:import_preview",
      limit: 10,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  if (!(await isAdminUser(user))) {
    return sendError(res, 403, "forbidden");
  }
  if (!isImportEnabled()) {
    return sendError(res, 403, "admin_import_disabled");
  }

  const validation = validatePayload(payload, {
    fields: {
      type: {
        type: "string",
        enum: ["mcq", "kortsvar", "sygdomslaere"],
        enumMessage: "Invalid import type",
      },
      content: {
        type: "string",
        minLen: 1,
        maxLen: MAX_IMPORT_CHARS,
        maxLenMessage: "Import content too large",
        maxLenStatus: 413,
      },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  try {
    const result = await previewImport({
      type: payload.type,
      content: payload.content,
    });

    return sendJson(res, 200, {
      ok: true,
      dataset: payload.type,
      result,
    });
  } catch (err) {
    const status = err && Number.isFinite(err.status) ? err.status : 500;
    const message = err && err.message ? String(err.message).slice(0, 200) : "Preview failed";
    return sendError(res, status, message);
  }
};
