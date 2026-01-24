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

function setupMocks({ admin = true } = {}) {
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
  });
  stubModule("../api/_lib/datasetAdmin.js", {
    normalizeDataset: (value) => value,
    ensurePublishedVersion: vi.fn(async () => ({ id: "ver-1" })),
    listVersions: vi.fn(async () => [{ id: "ver-1", status: "published", item_count: 2 }]),
    cloneDraftFromVersion: vi.fn(async () => ({ id: "draft-1" })),
    createDraftVersion: vi.fn(async () => ({ id: "draft-2" })),
    buildQaSummary: vi.fn(() => ({ itemCount: 0, warnings: {} })),
    listItems: vi.fn(async () => ({ items: [{ id: "item-1", item_type: "mcq" }], count: 1 })),
    createItem: vi.fn(async () => ({ id: "item-2" })),
    getItemById: vi.fn(async () => ({ id: "item-1", payload: {} })),
    updateItem: vi.fn(async () => ({ id: "item-1" })),
    deleteItem: vi.fn(async () => ({ id: "item-1" })),
    bulkUpdate: vi.fn(async () => {}),
    publishVersion: vi.fn(async () => ({ versionId: "ver-1" })),
    getQaSummaryForVersion: vi.fn(async () => ({ itemCount: 1, warnings: {} })),
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function createReq(body, { method = "GET", headers = {}, query = {} } = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  const req = Readable.from(payload ? [Buffer.from(payload)] : []);
  req.method = method;
  req.headers = headers;
  req.socket = { remoteAddress: "127.0.0.1" };
  req.query = query;
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

describe("Admin dataset endpoints", () => {
  it("requires dataset on versions GET", async () => {
    setupMocks();
    const handler = await loadHandler("../api/admin/datasets/versions.js");
    const res = await callHandler(handler, undefined, { method: "GET", query: {} });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Invalid dataset");
  });

  it("lists versions for dataset", async () => {
    setupMocks();
    const handler = await loadHandler("../api/admin/datasets/versions.js");
    const res = await callHandler(handler, undefined, {
      method: "GET",
      query: { dataset: "mcq" },
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.dataset).toBe("mcq");
    expect(payload.versions.length).toBeGreaterThan(0);
  });

  it("creates item with valid payload", async () => {
    setupMocks();
    const handler = await loadHandler("../api/admin/datasets/items.js");
    const res = await callHandler(
      handler,
      {
        dataset: "mcq",
        version_id: "ver-1",
        item: { year: 2024, number: 1, category: "Cellebiologi", text: "Test", options: [] },
      },
      { method: "POST" }
    );
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
  });

  it("publishes a version", async () => {
    setupMocks();
    const handler = await loadHandler("../api/admin/datasets/publish.js");
    const res = await callHandler(handler, { version_id: "ver-1" }, { method: "POST" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
  });
});
