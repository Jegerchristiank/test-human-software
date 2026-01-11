import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

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

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function loadAuthModule({ user, error } = {}) {
  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: () => ({
      auth: {
        getUser: vi.fn(async () => {
          if (error) {
            return { data: null, error: { message: error } };
          }
          return { data: { user }, error: null };
        }),
      },
    }),
  });
  const resolved = require.resolve("../api/_lib/auth.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  return require(resolved);
}

describe("supabase auth", () => {
  it("returns missing_token when Authorization header is absent", async () => {
    const { getUserFromRequest } = loadAuthModule({
      user: { id: "user-1" },
    });
    const result = await getUserFromRequest({ headers: {} });
    expect(result.user).toBe(null);
    expect(result.error).toBe("missing_token");
  });

  it("returns invalid_token when Supabase rejects the token", async () => {
    const { getUserFromRequest } = loadAuthModule({ error: "invalid" });
    const result = await getUserFromRequest({
      headers: { authorization: "Bearer bad-token" },
    });
    expect(result.user).toBe(null);
    expect(result.error).toBe("invalid_token");
  });

  it("returns user when Supabase accepts the token", async () => {
    const user = { id: "user-1", email: "user@example.com", user_metadata: {} };
    const { getUserFromRequest } = loadAuthModule({ user });
    const result = await getUserFromRequest({
      headers: { authorization: "Bearer good-token" },
    });
    expect(result.error).toBe(null);
    expect(result.user).toEqual(user);
  });
});
