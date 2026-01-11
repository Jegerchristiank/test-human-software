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

class SupabaseQuery {
  constructor(table, deleteErrors) {
    this.table = table;
    this.deleteErrors = deleteErrors;
    this.operation = null;
  }

  select() {
    this.operation = "select";
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq() {
    return this;
  }

  async maybeSingle() {
    return this.resolve();
  }

  then(resolve, reject) {
    return this.resolve().then(resolve, reject);
  }

  async resolve() {
    if (this.operation === "select") {
      if (this.table === "profiles") {
        return { data: { stripe_customer_id: null }, error: null };
      }
      if (this.table === "subscriptions") {
        return { data: [], error: null };
      }
      return { data: null, error: null };
    }
    if (this.operation === "delete") {
      const error = this.deleteErrors[this.table] || null;
      return { data: null, error };
    }
    return { data: null, error: null };
  }
}

function buildSupabaseStub(deleteErrors = {}) {
  return {
    from(table) {
      return new SupabaseQuery(table, deleteErrors);
    },
    auth: {
      admin: {
        deleteUser: async () => ({ data: null, error: null }),
      },
    },
  };
}

function setupMocks({ deleteErrors } = {}) {
  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({ user: { id: "user-1" }, error: null })),
  });
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
  });
  stubModule("../api/_lib/audit.js", {
    logAuditEvent: vi.fn(async () => {}),
  });
  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: () => buildSupabaseStub(deleteErrors),
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function createReq(body, { method = "POST" } = {}) {
  const payload = Buffer.from(JSON.stringify(body));
  const req = Readable.from([payload]);
  req.method = method;
  req.headers = {};
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

async function callHandler(handler, body, options) {
  const req = createReq(body, options);
  const res = createRes();
  await handler(req, res);
  return res;
}

async function loadHandler(path, mocks) {
  setupMocks(mocks);
  const resolved = require.resolve(path);
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("account delete", () => {
  it("fails when a supabase delete fails", async () => {
    const handler = await loadHandler("../api/account/delete.js", {
      deleteErrors: { usage_events: { message: "delete failed" } },
    });
    const res = await callHandler(handler, { confirm: true }, { method: "POST" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(500);
    expect(payload.error).toBe("Could not delete account");
  });
});
