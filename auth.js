const STORAGE_KEYS = {
  theme: "ku_mcq_theme",
};

const DEFAULT_REDIRECT = "index.html";

const elements = {
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
};

let supabase = null;

function normalizeRedirectPath(raw) {
  if (!raw) return "";
  try {
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return "";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (error) {
    return "";
  }
}

function getRedirectPath() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  return normalizeRedirectPath(redirect) || DEFAULT_REDIRECT;
}

function getRedirectUrl() {
  return new URL(getRedirectPath(), window.location.origin).toString();
}

function applyRedirectParams() {
  const redirect = normalizeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
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
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored) return stored;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  if (elements.themeToggle) {
    elements.themeToggle.checked = nextTheme === "dark";
    elements.themeToggle.setAttribute("aria-checked", String(nextTheme === "dark"));
  }
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
}

function setStatus(message, isWarn = false) {
  if (!elements.status) return;
  const text = String(message || "").trim();
  elements.status.textContent = text;
  elements.status.classList.toggle("warn", Boolean(text) && isWarn);
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
}

async function loadConfig() {
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) {
    let detail = "Serveren svarer ikke lige nu.";
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

function initSupabaseClient(config) {
  if (supabase) return;
  const supabaseLib = window.supabase;
  if (!supabaseLib?.createClient || !config?.supabaseUrl || !config?.supabaseAnonKey) {
    throw new Error("Supabase klienten er ikke klar.");
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
  return document.body?.dataset?.authMode === "sign-up" ? "sign-up" : "sign-in";
}

function getEmailValue() {
  const email = elements.emailInput ? elements.emailInput.value.trim() : "";
  if (!email) {
    setStatus("Skriv din email først.", true);
  }
  return email;
}

function getPasswordValue() {
  const password = elements.passwordInput ? elements.passwordInput.value : "";
  if (!password) {
    setStatus("Skriv din adgangskode først.", true);
  }
  return password;
}

async function handleEmailAuth(event) {
  event?.preventDefault?.();
  if (!supabase) return;
  const email = getEmailValue();
  const password = getPasswordValue();
  if (!email || !password) return;
  setStatus("");
  setControlsEnabled(false);

  try {
    if (getAuthMode() === "sign-up") {
      const fullName = elements.nameInput ? elements.nameInput.value.trim() : "";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
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
      setStatus("Tjek din email for at bekræfte din konto.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.session) {
      window.location.replace(getRedirectPath());
      return;
    }
    setStatus("Kunne ikke logge ind endnu.", true);
  } catch (error) {
    const message = error?.message || "Kunne ikke logge ind.";
    setStatus(message, true);
  } finally {
    setControlsEnabled(true);
  }
}

async function handleOAuth(provider) {
  if (!supabase) return;
  setStatus("");
  setControlsEnabled(false);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getRedirectUrl(),
      },
    });
    if (error) throw error;
  } catch (error) {
    const message = error?.message || "OAuth-login fejlede.";
    setStatus(message, true);
    setControlsEnabled(true);
  }
}

async function initAuth() {
  setControlsEnabled(false);
  try {
    const config = await loadConfig();
    initSupabaseClient(config);
    setControlsEnabled(true);
  } catch (error) {
    setStatus(error.message || "Login er ikke klar endnu.", true);
    setControlsEnabled(false);
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

initTheme();
initEvents();
initAuth();
