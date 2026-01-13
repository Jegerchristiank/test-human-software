import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { describe, it, expect, vi, afterEach } from "vitest";

const require = createRequire(import.meta.url);
const Module = require("module");
const cachedModules = new Set();

function stubModule(modulePath, exports) {
  const resolved = require.resolve(modulePath);
  const stub = new Module(resolved);
  stub.exports = exports;
  stub.loaded = true;
  require.cache[resolved] = stub;
  cachedModules.add(resolved);
}

function setupMocks({ admin = true, importEnabled = true } = {}) {
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
  });
  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({
      user: { id: "user-1", email: "admin@example.com" },
      error: null,
    })),
  });
  stubModule("../api/_lib/admin.js", {
    isAdminUser: vi.fn(() => admin),
    isImportEnabled: vi.fn(() => importEnabled),
  });
  stubModule("../api/_lib/audit.js", {
    logAuditEvent: vi.fn(async () => {}),
  });
  stubModule("../api/_lib/importer.js", {
    applyImport: vi.fn(async () => ({
      importPath: "imports/rawdata-mc.txt",
      rawPath: "rawdata-mc",
      dataPath: "data/questions.json",
    })),
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function createReq(body, { method = "POST", headers = {} } = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  const req = Readable.from(payload ? [Buffer.from(payload)] : []);
  req.method = method;
  req.headers = headers;
  req.socket = { remoteAddress: "127.0.0.1" };
  return req;
}

function createRes() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}

async function callHandler(handler, body, options = {}) {
  const req = createReq(body, options);
  const res = createRes();
  await handler(req, res);
  return res;
}

async function loadHandler(path) {
  const resolved = require.resolve(path);
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("Admin endpoints", () => {
  it("rejects non-admin status requests", async () => {
    setupMocks({ admin: false });
    const handler = await loadHandler("../api/admin/status.js");
    const res = await callHandler(handler, undefined, { method: "GET" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(403);
    expect(payload.error).toBe("forbidden");
  });

  it("rejects invalid import type", async () => {
    setupMocks({ admin: true, importEnabled: true });
    const handler = await loadHandler("../api/admin/import.js");
    const res = await callHandler(handler, {
      type: "bad",
      mode: "append",
      content: "2026",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Invalid import type");
  });

  it("rejects import when disabled", async () => {
    setupMocks({ admin: true, importEnabled: false });
    const handler = await loadHandler("../api/admin/import.js");
    const res = await callHandler(handler, {
      type: "mcq",
      mode: "append",
      content: "2026",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(403);
    expect(payload.error).toBe("admin_import_disabled");
  });

  it("accepts valid admin import", async () => {
    setupMocks({ admin: true, importEnabled: true });
    const handler = await loadHandler("../api/admin/import.js");
    const res = await callHandler(handler, {
      type: "mcq",
      mode: "append",
      content: "2026",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.dataset).toBe("mcq");
  });
});
