(() => {
const STORAGE_KEYS = {
  theme: "ku_mcq_theme",
};

const DEFAULT_REDIRECT = "/";
const DEFAULT_BASE_URL = "http://localhost/";
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_REDIRECT_BLOCKLIST = new Set([
  "/login",
  "/opret",
  "/samtykke",
  "/sign-in",
  "/sign-up",
  "/consent",
  "/sign-in.html",
  "/sign-up.html",
  "/consent.html",
]);
const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined";

function safeStorageGet(key) {
  if (!canUseDOM) return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeStorageSet(key, value) {
  if (!canUseDOM) return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Ignore storage errors (private mode or blocked storage).
  }
}

const elements = canUseDOM
  ? {
      themeToggle: document.getElementById("theme-toggle"),
      status: document.getElementById("auth-status"),
      nameInput: document.getElementById("auth-name-input"),
      emailInput: document.getElementById("auth-email-input"),
      passwordInput: document.getElementById("auth-password-input"),
      loginBtn: document.getElementById("auth-login-btn"),
      signupBtn: document.getElementById("auth-signup-btn"),
      googleBtn: document.getElementById("auth-google-btn"),
      appleBtn: document.getElementById("auth-apple-btn"),
      form: document.getElementById("auth-form"),
    }
  : {};

let supabase = null;
let cachedConfig = null;
let cachedConfigPromise = null;

function getBaseUrl() {
  if (canUseDOM && window.location && window.location.href) {
    return window.location.href;
  }
  return DEFAULT_BASE_URL;
}

function normalizeRedirectPath(raw, baseUrl = getBaseUrl()) {
  if (!raw) return "";
  try {
    const base = new URL(baseUrl, DEFAULT_BASE_URL);
    const url = new URL(raw, base);
    if (url.origin !== base.origin) return "";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (error) {
    return "";
  }
}

function isBlockedRedirect(path, baseUrl = getBaseUrl()) {
  if (!path) return false;
  try {
    const base = new URL(baseUrl, DEFAULT_BASE_URL);
    const url = new URL(path, base);
    return AUTH_REDIRECT_BLOCKLIST.has(url.pathname.toLowerCase());
  } catch (error) {
    return false;
  }
}

function sanitizeRedirectPath(raw, baseUrl = getBaseUrl()) {
  const normalized = normalizeRedirectPath(raw, baseUrl);
  if (!normalized || isBlockedRedirect(normalized, baseUrl)) return "";
  return normalized;
}

function getRedirectPath() {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams(canUseDOM ? window.location.search : "");
  const redirect = params.get("redirect");
  const sanitized = sanitizeRedirectPath(redirect, baseUrl);
  if (sanitized) return sanitized;
  return normalizeRedirectPath(DEFAULT_REDIRECT, baseUrl) || DEFAULT_REDIRECT;
}

function getRedirectUrl() {
  return new URL(getRedirectPath(), getBaseUrl()).toString();
}

function applyRedirectParams() {
  if (!canUseDOM) return;
  const redirect = sanitizeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
  if (!redirect) return;
  const links = document.querySelectorAll("[data-preserve-redirect='true']");
  links.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    const href = link.getAttribute("href");
    if (!href) return;
    try {
      const url = new URL(href, window.location.href);
      url.searchParams.set("redirect", redirect);
      link.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
    } catch (error) {
      // Ignore invalid hrefs.
    }
  });
}

function getInitialTheme() {
  if (!canUseDOM) return "light";
  const stored = safeStorageGet(STORAGE_KEYS.theme);
  if (stored) return stored;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme) {
  if (!canUseDOM) return;
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  if (elements.themeToggle) {
    elements.themeToggle.checked = nextTheme === "dark";
    elements.themeToggle.setAttribute("aria-checked", String(nextTheme === "dark"));
  }
  safeStorageSet(STORAGE_KEYS.theme, nextTheme);
}

function setFieldInvalid(field, isInvalid) {
  if (!field) return;
  if (isInvalid) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }
}

function focusFirstAuthError() {
  const mode = getAuthMode();
  const emailValue = elements.emailInput ? elements.emailInput.value.trim() : "";
  const passwordValue = elements.passwordInput ? elements.passwordInput.value : "";
  const emailInvalid = Boolean(elements.emailInput) && (!emailValue || !isValidEmail(emailValue));
  const passwordInvalid = Boolean(elements.passwordInput) &&
    (!passwordValue || (mode === "sign-up" && passwordValue.length < MIN_PASSWORD_LENGTH));

  setFieldInvalid(elements.emailInput, emailInvalid);
  setFieldInvalid(elements.passwordInput, passwordInvalid);
  setFieldInvalid(elements.nameInput, false);

  const target = emailInvalid
    ? elements.emailInput
    : passwordInvalid
      ? elements.passwordInput
      : null;
  if (target && typeof target.focus === "function") {
    target.focus();
    return;
  }
  if (elements.status && typeof elements.status.focus === "function") {
    elements.status.tabIndex = -1;
    elements.status.focus();
  }
}

function clearAuthInvalidStates() {
  setFieldInvalid(elements.emailInput, false);
  setFieldInvalid(elements.passwordInput, false);
  setFieldInvalid(elements.nameInput, false);
}

function setStatus(message, isWarn = false) {
  if (!elements.status) return;
  const text = String(message || "").trim();
  elements.status.textContent = text;
  elements.status.classList.toggle("warn", Boolean(text) && isWarn);
  elements.status.setAttribute("aria-live", isWarn ? "assertive" : "polite");
  elements.status.setAttribute("role", isWarn ? "alert" : "status");
  if (text && isWarn) {
    focusFirstAuthError();
  } else {
    clearAuthInvalidStates();
  }
}

function setControlsEnabled(enabled) {
  const controls = [
    elements.nameInput,
    elements.emailInput,
    elements.passwordInput,
    elements.loginBtn,
    elements.signupBtn,
    elements.googleBtn,
    elements.appleBtn,
  ];
  controls.forEach((control) => {
    if (control) {
      control.disabled = !enabled;
    }
  });
  if (elements.form) {
    elements.form.setAttribute("aria-busy", String(!enabled));
  }
}

async function loadConfig() {
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) {
    let detail = "Serveren svarer ikke lige nu. Prøv igen om lidt.";
    try {
      const data = await res.json();
      if (data?.error) {
        detail = data.error;
      }
    } catch (error) {
      // Ignore JSON parse errors.
    }
    throw new Error(detail);
  }
  return res.json();
}

async function getRuntimeConfig() {
  if (cachedConfig) return cachedConfig;
  if (cachedConfigPromise) return cachedConfigPromise;
  cachedConfigPromise = loadConfig()
    .then((config) => {
      cachedConfig = config;
      return config;
    })
    .finally(() => {
      cachedConfigPromise = null;
    });
  return cachedConfigPromise;
}

function buildOAuthAuthorizeUrl({ provider, supabaseUrl, redirectUrl }) {
  if (!provider || !supabaseUrl || !redirectUrl) return "";
  try {
    const url = new URL("auth/v1/authorize", supabaseUrl);
    url.searchParams.set("provider", provider);
    url.searchParams.set("redirect_to", redirectUrl);
    return url.toString();
  } catch (error) {
    return "";
  }
}

function initSupabaseClient(config) {
  if (supabase) return;
  const supabaseLib = canUseDOM ? window.supabase : null;
  if (!supabaseLib?.createClient || !config?.supabaseUrl || !config?.supabaseAnonKey) {
    throw new Error("Supabase klienten er ikke klar. Prøv igen om lidt.");
  }
  supabase = supabaseLib.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

function getAuthMode() {
  if (!canUseDOM || !document.body) return "sign-in";
  return document.body.dataset?.authMode === "sign-up" ? "sign-up" : "sign-in";
}

function isValidEmail(value) {
  return EMAIL_PATTERN.test(value);
}

function collectCredentials() {
  return {
    fullName: elements.nameInput ? elements.nameInput.value.trim() : "",
    email: elements.emailInput ? elements.emailInput.value.trim() : "",
    password: elements.passwordInput ? elements.passwordInput.value : "",
  };
}

function validateCredentials({ email, password }, mode) {
  if (!email) {
    return { ok: false, message: "Skriv din email først." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, message: "Skriv en gyldig email." };
  }
  if (!password) {
    return { ok: false, message: "Skriv din adgangskode først." };
  }
  if (mode === "sign-up" && password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Adgangskoden skal være mindst ${MIN_PASSWORD_LENGTH} tegn.`,
    };
  }
  return { ok: true, message: "" };
}

function normalizeAuthError(error) {
  if (!error) return { message: "", code: "", status: null };
  if (typeof error === "string") {
    return { message: error, code: "", status: null };
  }
  return {
    message: typeof error.message === "string" ? error.message : "",
    code: typeof error.code === "string" ? error.code : "",
    status: Number.isFinite(error.status) ? error.status : null,
  };
}

function logAuthError(context, error) {
  const { message, code, status } = normalizeAuthError(error);
  if (!message && !code && !status) return;
  console.warn("[auth]", context, { code, status, message });
}

async function ensureSupabaseReady() {
  if (supabase) return supabase;
  const config = await getRuntimeConfig();
  initSupabaseClient(config);
  return supabase;
}

async function redirectToOAuthProvider(provider) {
  const config = await getRuntimeConfig();
  const authorizeUrl = buildOAuthAuthorizeUrl({
    provider,
    supabaseUrl: config?.supabaseUrl,
    redirectUrl: getRedirectUrl(),
  });
  if (!authorizeUrl) {
    const missing = new Error("OAuth URL missing");
    missing.code = "oauth_url_missing";
    throw missing;
  }
  window.location.assign(authorizeUrl);
}

function mapAuthError(error, { mode } = {}) {
  const { message, code, status } = normalizeAuthError(error);
  const normalizedMessage = message.toLowerCase();
  const normalizedCode = code.toLowerCase();

  if (
    normalizedCode === "invalid_credentials" ||
    normalizedMessage.includes("invalid login credentials")
  ) {
    return "Forkert email eller adgangskode. Prøv igen.";
  }
  if (
    normalizedCode === "user_already_exists" ||
    normalizedMessage.includes("user already registered")
  ) {
    return "Der findes allerede en konto med den email. Log ind i stedet.";
  }
  if (
    normalizedCode === "email_not_confirmed" ||
    normalizedMessage.includes("email not confirmed")
  ) {
    return "Bekræft din email før du logger ind. Tjek indbakken og prøv igen.";
  }
  if (
    normalizedCode === "invalid_email" ||
    normalizedMessage.includes("invalid email") ||
    normalizedMessage.includes("invalid email format")
  ) {
    return "Skriv en gyldig email.";
  }
  if (
    normalizedCode === "weak_password" ||
    normalizedMessage.includes("password should be at least")
  ) {
    const lengthMatch = message.match(/\d+/);
    const minLength = lengthMatch ? Number(lengthMatch[0]) : MIN_PASSWORD_LENGTH;
    return `Adgangskoden skal være mindst ${minLength} tegn.`;
  }
  if (
    normalizedCode === "over_email_send_rate_limit" ||
    normalizedCode === "too_many_requests" ||
    normalizedMessage.includes("rate limit") ||
    status === 429
  ) {
    return "For mange forsøg. Vent lidt og prøv igen.";
  }
  if (normalizedCode === "oauth_url_missing" || normalizedMessage.includes("oauth url")) {
    return "Kunne ikke starte OAuth-login. Prøv igen eller brug email-login.";
  }
  if (
    normalizedCode === "signup_disabled" ||
    normalizedMessage.includes("signups not allowed")
  ) {
    return "Oprettelse er slået fra lige nu. Prøv igen senere.";
  }
  if (
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("failed to fetch")
  ) {
    return "Netværksfejl. Prøv igen om lidt.";
  }

  if (mode === "sign-up") {
    return "Kunne ikke oprette konto. Tjek felterne og prøv igen.";
  }
  if (mode === "oauth") {
    return "OAuth-login fejlede. Prøv igen eller vælg en anden metode.";
  }
  return "Kunne ikke logge ind. Tjek email og adgangskode og prøv igen.";
}

async function getExistingSession() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data?.session || null;
  } catch (error) {
    return null;
  }
}

async function handleEmailAuth(event) {
  event?.preventDefault?.();
  try {
    await ensureSupabaseReady();
  } catch (error) {
    logAuthError("email-init", error);
    setStatus("Login er ikke klar endnu. Prøv igen om lidt.", true);
    return;
  }
  const mode = getAuthMode();
  const credentials = collectCredentials();
  const validation = validateCredentials(credentials, mode);
  if (!validation.ok) {
    setStatus(validation.message, true);
    return;
  }
  setStatus("");
  setControlsEnabled(false);

  try {
    if (mode === "sign-up") {
      const fullName = credentials.fullName;
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: fullName ? { full_name: fullName, name: fullName } : undefined,
          emailRedirectTo: getRedirectUrl(),
        },
      });
      if (error) throw error;
      if (data?.session) {
        window.location.replace(getRedirectPath());
        return;
      }
      setStatus("Tjek din email for at bekræfte din konto og fortsæt.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;
    if (data?.session) {
      window.location.replace(getRedirectPath());
      return;
    }
    setStatus("Kunne ikke logge ind endnu. Prøv igen om lidt.", true);
  } catch (error) {
    logAuthError("email", error);
    setStatus(mapAuthError(error, { mode }), true);
  } finally {
    setControlsEnabled(true);
  }
}

async function handleOAuth(provider) {
  setStatus("");
  setControlsEnabled(false);
  try {
    if (!supabase) {
      try {
        await ensureSupabaseReady();
      } catch (error) {
        logAuthError("oauth-init", error);
      }
    }
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectUrl(),
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
    }
    await redirectToOAuthProvider(provider);
  } catch (error) {
    logAuthError("oauth", error);
    setStatus(mapAuthError(error, { mode: "oauth" }), true);
    setControlsEnabled(true);
  }
}

async function initAuth() {
  setControlsEnabled(false);
  try {
    const config = await getRuntimeConfig();
    initSupabaseClient(config);
    await getExistingSession();
  } catch (error) {
    setStatus(error.message || "Login er ikke klar endnu. Prøv igen om lidt.", true);
  } finally {
    setControlsEnabled(true);
  }
}

function initTheme() {
  applyTheme(getInitialTheme());
  applyRedirectParams();
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener("change", (event) => {
      applyTheme(event.target.checked ? "dark" : "light");
    });
  }
}

function initEvents() {
  if (elements.form) {
    elements.form.addEventListener("submit", handleEmailAuth);
  }
  if (elements.googleBtn) {
    elements.googleBtn.addEventListener("click", () => handleOAuth("google"));
  }
  if (elements.appleBtn) {
    elements.appleBtn.addEventListener("click", () => handleOAuth("apple"));
  }
}

if (canUseDOM) {
  const initKey = "__hbsAuthInit";
  if (!window[initKey]) {
    window[initKey] = true;
    initTheme();
    initEvents();
    initAuth();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeRedirectPath,
    sanitizeRedirectPath,
    validateCredentials,
    mapAuthError,
    buildOAuthAuthorizeUrl,
  };
}
})();
