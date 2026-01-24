(() => {
const STORAGE_KEYS = {
  theme: "ku_mcq_theme",
};

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
      shell: document.getElementById("main-content"),
      themeToggle: document.getElementById("theme-toggle"),
      status: document.getElementById("gate-status"),
      email: document.getElementById("gate-email"),
      terms: document.getElementById("gate-terms"),
      privacy: document.getElementById("gate-privacy"),
      acceptBtn: document.getElementById("gate-accept-btn"),
      logoutBtn: document.getElementById("gate-logout-btn"),
    }
  : {};

let supabase = null;
let activeSession = null;

function focusConsentError() {
  const target = [elements.terms, elements.privacy].find((el) => el && !el.checked) || null;
  if (target && typeof target.focus === "function") {
    target.focus();
    return;
  }
  if (elements.status && typeof elements.status.focus === "function") {
    elements.status.tabIndex = -1;
    elements.status.focus();
  }
}

function setStatus(message, isWarn = false) {
  if (!elements.status) return;
  const text = String(message || "").trim();
  elements.status.textContent = text;
  elements.status.classList.toggle("warn", Boolean(text) && isWarn);
  elements.status.classList.toggle("hidden", !text);
  elements.status.setAttribute("aria-live", isWarn ? "assertive" : "polite");
  elements.status.setAttribute("role", isWarn ? "alert" : "status");
  if (text && isWarn) {
    focusConsentError();
  }
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

function updateAcceptButton() {
  if (!elements.acceptBtn) return;
  const acceptTerms = Boolean(elements.terms?.checked);
  const acceptPrivacy = Boolean(elements.privacy?.checked);
  elements.acceptBtn.disabled = !activeSession || !(acceptTerms && acceptPrivacy);
}

function setControlsEnabled(enabled) {
  if (elements.acceptBtn) {
    elements.acceptBtn.disabled = !enabled;
  }
  if (elements.terms) {
    const locked = elements.terms.dataset.locked === "true";
    elements.terms.disabled = !enabled || locked;
  }
  if (elements.privacy) {
    const locked = elements.privacy.dataset.locked === "true";
    elements.privacy.disabled = !enabled || locked;
  }
  if (elements.logoutBtn) {
    elements.logoutBtn.disabled = !enabled;
  }
  if (elements.shell) {
    elements.shell.setAttribute("aria-busy", String(!enabled));
  }
}

function redirectToSignIn() {
  if (!canUseDOM) return;
  const redirectPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const url = new URL("/sign-in", window.location.origin);
  url.searchParams.set("redirect", redirectPath);
  window.location.replace(`${url.pathname}${url.search}${url.hash}`);
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

async function loadProfile() {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Login er ikke klar endnu. Prøv igen om lidt.");
  }
  const res = await fetch("/api/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (res.status === 401) {
    await handleLogout();
    return null;
  }
  if (!res.ok) {
    throw new Error("Kunne ikke hente profilen. Prøv igen om lidt.");
  }
  const data = await res.json();
  return data.profile || null;
}

function initSupabaseClient(config) {
  if (supabase) return;
  const supabaseLib = canUseDOM ? window.supabase : null;
  if (!supabaseLib?.createClient || !config?.supabaseUrl || !config?.supabaseAnonKey) {
    return;
  }
  supabase = supabaseLib.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

async function hydrateConsent() {
  setStatus("Henter din konto …");
  setControlsEnabled(false);
  const config = await loadConfig();
  initSupabaseClient(config);
  if (!supabase) {
    throw new Error("Login er ikke klar endnu. Prøv igen om lidt.");
  }
  const { data, error } = await supabase.auth.getSession();
  activeSession = error ? null : data?.session || null;
  const user = activeSession?.user || null;
  if (!user) {
    redirectToSignIn();
    return;
  }
  if (elements.email) {
    elements.email.textContent = user.email || "—";
  }

  const profile = await loadProfile();
  if (!profile) return;
  const termsAccepted = Boolean(profile.terms_accepted_at);
  const privacyAccepted = Boolean(profile.privacy_accepted_at);
  if (termsAccepted && privacyAccepted) {
    window.location.replace("/");
    return;
  }

  if (elements.terms) {
    elements.terms.checked = termsAccepted;
    elements.terms.dataset.locked = termsAccepted ? "true" : "false";
    elements.terms.disabled = termsAccepted;
  }
  if (elements.privacy) {
    elements.privacy.checked = privacyAccepted;
    elements.privacy.dataset.locked = privacyAccepted ? "true" : "false";
    elements.privacy.disabled = privacyAccepted;
  }
  setStatus("");
  setControlsEnabled(true);
  updateAcceptButton();
}

async function submitConsent() {
  if (!activeSession) return;
  const acceptTerms = Boolean(elements.terms?.checked);
  const acceptPrivacy = Boolean(elements.privacy?.checked);
  if (!(acceptTerms && acceptPrivacy)) {
    setStatus("Markér begge felter for at fortsætte.", true);
    return;
  }
  setStatus("Gemmer samtykke …");
  setControlsEnabled(false);
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Login er ikke klar endnu. Prøv igen om lidt.");
    }
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ acceptTerms, acceptPrivacy }),
    });
    if (!res.ok) {
      throw new Error("Kunne ikke gemme samtykke. Prøv igen om lidt.");
    }
    window.location.replace("/");
  } catch (error) {
    setStatus(error.message || "Kunne ikke gemme samtykke. Prøv igen om lidt.", true);
    setControlsEnabled(true);
    updateAcceptButton();
  }
}

async function handleLogout() {
  setControlsEnabled(false);
  if (supabase) {
    await supabase.auth.signOut();
  }
  window.location.replace("/");
}

async function getAccessToken() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data?.session?.access_token || null;
  } catch (error) {
    return null;
  }
}

function init() {
  applyTheme(getInitialTheme());
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener("change", (event) => {
      applyTheme(event.target.checked ? "dark" : "light");
    });
  }
  if (elements.terms) {
    elements.terms.addEventListener("change", updateAcceptButton);
  }
  if (elements.privacy) {
    elements.privacy.addEventListener("change", updateAcceptButton);
  }
  if (elements.acceptBtn) {
    elements.acceptBtn.addEventListener("click", submitConsent);
  }
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", handleLogout);
  }
  hydrateConsent().catch((error) => {
    setStatus(error.message || "Noget gik galt. Prøv igen.", true);
    setControlsEnabled(true);
    updateAcceptButton();
  });
}

if (canUseDOM) {
  const initKey = "__hbsConsentInit";
  if (!window[initKey]) {
    window[initKey] = true;
    init();
  }
}
})();
