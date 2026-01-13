const { readJson } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { validatePayload } = require("../_lib/validate");
const { isAdminUser, isImportEnabled } = require("../_lib/admin");
const { applyImport } = require("../_lib/importer");
const { logAuditEvent } = require("../_lib/audit");

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
      scope: "admin:import",
      limit: 6,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  if (!isAdminUser(user)) {
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
      mode: {
        type: "string",
        enum: ["append", "replace"],
        enumMessage: "Invalid import mode",
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
    const result = await applyImport({
      type: payload.type,
      mode: payload.mode,
      content: payload.content,
    });

    await logAuditEvent({
      eventType: "admin_import",
      userId: user.id,
      status: "success",
      req,
      metadata: {
        dataset: payload.type,
        mode: payload.mode,
      },
    });

    return sendJson(res, 200, {
      ok: true,
      dataset: payload.type,
      mode: payload.mode,
      files: result,
    });
  } catch (err) {
    await logAuditEvent({
      eventType: "admin_import",
      userId: user.id,
      status: "failure",
      req,
      metadata: {
        dataset: payload.type,
        mode: payload.mode,
      },
    });
    return sendError(res, 500, "Import failed");
  }
};
