import { createRequire } from "node:module";
import { describe, expect, it, afterEach } from "vitest";

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

function createSupabaseMock({ profileById = null, profileByEmail = null } = {}) {
  let upsertPayload = null;
  return {
    from() {
      const state = { filters: [] };
      const api = {
        select() {
          return api;
        },
        eq(field, value) {
          state.filters.push([field, value]);
          return api;
        },
        order() {
          return api;
        },
        limit() {
          return api;
        },
        async maybeSingle() {
          if (state.filters.some(([field]) => field === "id")) {
            return { data: profileById, error: null };
          }
          if (state.filters.some(([field]) => field === "email")) {
            return { data: profileByEmail, error: null };
          }
          return { data: null, error: null };
        },
        async upsert(payload) {
          upsertPayload = payload;
          return { error: null, data: null };
        },
      };
      return api;
    },
    getUpsertPayload() {
      return upsertPayload;
    },
  };
}

async function loadAdminModule(mockSupabase) {
  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: () => mockSupabase,
  });
  const resolved = require.resolve("../api/_lib/admin.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  return require(resolved);
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

describe("isAdminUser", () => {
  it("accepts admin when profile is marked is_admin", async () => {
    const mockSupabase = createSupabaseMock({
      profileById: { id: "user-1", email: "admin@example.com", is_admin: true },
    });
    const { isAdminUser } = await loadAdminModule(mockSupabase);
    const allowed = await isAdminUser({ id: "user-1", email: "admin@example.com" });
    expect(allowed).toBe(true);
    expect(mockSupabase.getUpsertPayload()).toBeNull();
  });

  it("falls back to email admin and syncs profile when email is confirmed", async () => {
    const mockSupabase = createSupabaseMock({
      profileById: null,
      profileByEmail: { id: "legacy-id", email: "admin@example.com", is_admin: true },
    });
    const { isAdminUser } = await loadAdminModule(mockSupabase);
    const allowed = await isAdminUser({
      id: "user-1",
      email: "admin@example.com",
      email_confirmed_at: "2025-01-01T00:00:00Z",
    });
    expect(allowed).toBe(true);
    expect(mockSupabase.getUpsertPayload()).toEqual({
      id: "user-1",
      email: "admin@example.com",
      is_admin: true,
    });
  });

  it("denies admin when profile is not admin and no fallback applies", async () => {
    const mockSupabase = createSupabaseMock({
      profileById: { id: "user-1", email: "admin@example.com", is_admin: false },
      profileByEmail: null,
    });
    const { isAdminUser } = await loadAdminModule(mockSupabase);
    const allowed = await isAdminUser({
      id: "user-1",
      email: "admin@example.com",
      email_confirmed_at: "2025-01-01T00:00:00Z",
    });
    expect(allowed).toBe(false);
  });
});
