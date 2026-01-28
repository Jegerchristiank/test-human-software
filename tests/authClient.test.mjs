import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  normalizeRedirectPath,
  sanitizeRedirectPath,
  validateCredentials,
  mapAuthError,
  buildOAuthAuthorizeUrl,
} = require("../auth.js");

describe("auth client helpers", () => {
  const baseUrl = "https://app.example/sign-in.html";

  it("normalizes same-origin redirect paths", () => {
    expect(normalizeRedirectPath("/index.html?next=1#tab", baseUrl)).toBe(
      "/index.html?next=1#tab"
    );
  });

  it("rejects cross-origin redirect paths", () => {
    expect(normalizeRedirectPath("https://evil.example/phish", baseUrl)).toBe("");
  });

  it("blocks redirecting back to auth pages", () => {
    expect(sanitizeRedirectPath("/login", baseUrl)).toBe("");
    expect(sanitizeRedirectPath("/opret", baseUrl)).toBe("");
    expect(sanitizeRedirectPath("/samtykke", baseUrl)).toBe("");
    expect(sanitizeRedirectPath("/sign-in.html", baseUrl)).toBe("");
    expect(sanitizeRedirectPath("/sign-up.html", baseUrl)).toBe("");
    expect(sanitizeRedirectPath("/consent.html", baseUrl)).toBe("");
  });

  it("allows safe redirect paths", () => {
    expect(sanitizeRedirectPath("/index.html", baseUrl)).toBe("/index.html");
    expect(sanitizeRedirectPath("/dashboard", baseUrl)).toBe("/dashboard");
  });

  it("validates credentials for sign-in", () => {
    expect(validateCredentials({ email: "", password: "" }, "sign-in").ok).toBe(false);
    expect(validateCredentials({ email: "not-an-email", password: "pw" }, "sign-in").ok).toBe(false);
    expect(validateCredentials({ email: "user@example.com", password: "pw" }, "sign-in").ok).toBe(true);
  });

  it("validates credentials for sign-up", () => {
    const short = validateCredentials({ email: "user@example.com", password: "123" }, "sign-up");
    expect(short.ok).toBe(false);
    expect(short.message).toContain("mindst");

    const valid = validateCredentials(
      { email: "user@example.com", password: "123456" },
      "sign-up"
    );
    expect(valid.ok).toBe(true);
  });

  it("maps common auth errors", () => {
    expect(mapAuthError({ code: "invalid_credentials", message: "Invalid login credentials" })).toBe(
      "Forkert email eller adgangskode. Prøv igen."
    );
    expect(mapAuthError({ code: "user_already_exists", message: "User already registered" })).toBe(
      "Der findes allerede en konto med den email. Log ind i stedet."
    );
    expect(mapAuthError({ message: "Password should be at least 10 characters" })).toBe(
      "Adgangskoden skal være mindst 10 tegn."
    );
    expect(mapAuthError({ code: "oauth_url_missing", message: "OAuth URL missing" })).toBe(
      "Kunne ikke starte OAuth-login. Prøv igen eller brug email-login."
    );
  });

  it("builds a Supabase OAuth authorize URL", () => {
    const url = buildOAuthAuthorizeUrl({
      provider: "google",
      supabaseUrl: "https://project.supabase.co",
      redirectUrl: "https://app.example/index.html",
    });
    expect(url).toBe(
      "https://project.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fapp.example%2Findex.html"
    );
  });

  it("returns empty string when OAuth authorize inputs are missing", () => {
    expect(buildOAuthAuthorizeUrl({ provider: "", supabaseUrl: "https://x", redirectUrl: "" })).toBe(
      ""
    );
  });
});
