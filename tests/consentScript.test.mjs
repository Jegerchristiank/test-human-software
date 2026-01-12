import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

function buildContext() {
  const elements = new Map();
  const createElement = (id) => ({
    id,
    checked: false,
    disabled: false,
    dataset: {},
    classList: { toggle: () => {} },
    addEventListener: () => {},
    setAttribute: () => {},
    textContent: "",
  });

  const document = {
    getElementById: (id) => {
      if (!elements.has(id)) {
        elements.set(id, createElement(id));
      }
      return elements.get(id);
    },
    body: { dataset: {} },
  };

  const window = {
    location: {
      pathname: "/consent.html",
      search: "",
      hash: "",
      href: "https://example.test/consent.html",
      replace: () => {},
    },
    matchMedia: () => ({ matches: false }),
  };

  const localStorage = {
    getItem: () => null,
    setItem: () => {},
  };

  const fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ error: "fail" }),
  });

  return {
    window,
    document,
    localStorage,
    fetch,
    URL,
    console: { warn: () => {}, error: () => {} },
  };
}

describe("consent script", () => {
  it("can run twice without redeclaration errors", () => {
    const script = readFileSync(new URL("../consent.js", import.meta.url), "utf8");
    const context = buildContext();
    vm.createContext(context);
    expect(() => vm.runInContext(script, context)).not.toThrow();
    expect(() => vm.runInContext(script, context)).not.toThrow();
  });
});
