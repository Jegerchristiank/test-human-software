import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

function buildContext() {
  const elements = new Map();
  const createElement = (id = "") => ({
    id,
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false,
    },
    dataset: {},
    style: {},
    textContent: "",
    innerHTML: "",
    value: "",
    checked: false,
    disabled: false,
    tabIndex: 0,
    type: "",
    href: "",
    src: "",
    alt: "",
    title: "",
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    removeAttribute: () => {},
    toggleAttribute: () => {},
    appendChild: () => {},
    focus: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getContext: () => ({}),
  });

  const document = {
    body: createElement("body"),
    hidden: false,
    visibilityState: "visible",
    getElementById: (id) => {
      if (!elements.has(id)) {
        elements.set(id, createElement(id));
      }
      return elements.get(id);
    },
    querySelector: (selector) => createElement(selector),
    querySelectorAll: () => [],
    createElement: (tag) => createElement(tag),
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  const location = {
    href: "https://example.test/index.html",
    origin: "https://example.test",
    pathname: "/index.html",
    search: "",
    hash: "",
    protocol: "https:",
    hostname: "example.test",
    replace: () => {},
  };

  const window = {
    location,
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    addEventListener: () => {},
    removeEventListener: () => {},
    confirm: () => true,
  };

  const localStorage = {
    store: new Map(),
    getItem(key) {
      return this.store.has(key) ? this.store.get(key) : null;
    },
    setItem(key, value) {
      this.store.set(key, value);
    },
    removeItem(key) {
      this.store.delete(key);
    },
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
    navigator: { language: "da-DK", mediaDevices: { getUserMedia: async () => ({}) } },
    crypto: { randomUUID: () => "test-uuid" },
    URL,
    URLSearchParams,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    console: { warn: () => {}, error: () => {} },
  };
}

function loadApp() {
  const script = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const harness = `${script}\n;globalThis.__appTest = { state, document, updateAuthUI, getSessionCourse, canSwitchCourse, setActiveCourse, shouldShowPausedPanel };`;
  const context = buildContext();
  vm.createContext(context);
  vm.runInContext(harness, context);
  return context.__appTest;
}

describe("studio course switch lock", () => {
  it("allows switching when there is no active session", () => {
    const { state, canSwitchCourse } = loadApp();
    state.sessionActive = false;
    state.sessionCourse = null;
    expect(canSwitchCourse("human")).toBe(true);
    expect(canSwitchCourse("sygdomslaere")).toBe(true);
  });

  it("blocks switching away from the active session course", () => {
    const { state, canSwitchCourse, setActiveCourse } = loadApp();
    state.sessionActive = true;
    state.sessionPaused = false;
    state.sessionCourse = "human";
    state.activeCourse = "human";
    expect(canSwitchCourse("sygdomslaere")).toBe(false);
    expect(canSwitchCourse("human")).toBe(true);
    setActiveCourse("sygdomslaere");
    expect(state.activeCourse).toBe("human");
  });

  it("allows switching when the session is paused", () => {
    const { state, canSwitchCourse, setActiveCourse } = loadApp();
    state.sessionActive = true;
    state.sessionPaused = true;
    state.sessionCourse = "human";
    state.activeCourse = "human";
    expect(canSwitchCourse("sygdomslaere")).toBe(true);
    setActiveCourse("sygdomslaere");
    expect(state.activeCourse).toBe("sygdomslaere");
  });

  it("hides the paused panel when the paused session belongs to another course", () => {
    const { state, shouldShowPausedPanel } = loadApp();
    state.sessionActive = true;
    state.sessionPaused = true;
    state.sessionCourse = "human";
    state.activeCourse = "sygdomslaere";
    expect(shouldShowPausedPanel()).toBe(false);
  });

  it("shows the paused panel when the paused session matches the active course", () => {
    const { state, shouldShowPausedPanel } = loadApp();
    state.sessionActive = true;
    state.sessionPaused = true;
    state.sessionCourse = "sygdomslaere";
    state.activeCourse = "sygdomslaere";
    expect(shouldShowPausedPanel()).toBe(true);
  });

  it("infers the session course from active questions when unset", () => {
    const { state, getSessionCourse } = loadApp();
    state.sessionActive = true;
    state.sessionCourse = null;
    state.activeQuestions = [{ course: "sygdomslaere" }];
    expect(getSessionCourse()).toBe("sygdomslaere");
  });

  it("resets the course theme on logout", () => {
    const { state, document, updateAuthUI } = loadApp();
    state.isLoading = false;
    state.authReady = true;
    state.session = null;
    updateAuthUI();
    expect(document.body.dataset.course).toBe("human");
  });
});
