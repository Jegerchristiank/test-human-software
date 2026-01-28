import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

function buildContext({ sessionUser = null } = {}) {
  const elements = new Map();
  const createElement = (id) => ({
    id,
    value: "",
    checked: false,
    disabled: false,
    classList: { toggle: () => {} },
    setAttribute: () => {},
    removeAttribute: () => {},
    addEventListener: () => {},
    focus: () => {},
    textContent: "",
  });

  const document = {
    getElementById: (id) => {
      if (!elements.has(id)) {
        elements.set(id, createElement(id));
      }
      return elements.get(id);
    },
    querySelectorAll: () => [],
    body: { dataset: {} },
  };

  const replaceCalls = [];
  const location = {
    href: "https://example.test/login",
    origin: "https://example.test",
    pathname: "/login",
    search: "",
    hash: "",
    replace: (url) => replaceCalls.push(url),
    assign: (url) => replaceCalls.push(url),
  };

  const supabaseClient = {
    auth: {
      getSession: async () => ({
        data: { session: sessionUser ? { user: sessionUser } : null },
        error: null,
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  };

  const window = {
    location,
    matchMedia: () => ({ matches: false }),
    supabase: {
      createClient: () => supabaseClient,
    },
  };

  const fetch = async () => ({
    ok: true,
    json: async () => ({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon",
    }),
  });

  const localStorage = {
    getItem: () => null,
    setItem: () => {},
  };

  return {
    window,
    document,
    localStorage,
    fetch,
    URL,
    URLSearchParams,
    console: { warn: () => {}, error: () => {} },
    __replaceCalls: replaceCalls,
  };
}

describe("auth script", () => {
  it("does not auto redirect when a session already exists", async () => {
    const script = readFileSync(new URL("../auth.js", import.meta.url), "utf8");
    const context = buildContext({ sessionUser: { id: "user_1" } });
    vm.createContext(context);
    vm.runInContext(script, context);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(context.__replaceCalls).toHaveLength(0);
  });
});
