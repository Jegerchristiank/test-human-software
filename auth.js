const STORAGE_KEYS = {
  theme: "ku_mcq_theme",
};

const elements = {
  themeToggle: document.getElementById("theme-toggle"),
};

function applyRedirectParams() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
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

function initTheme() {
  applyTheme(getInitialTheme());
  applyRedirectParams();
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener("change", (event) => {
      applyTheme(event.target.checked ? "dark" : "light");
    });
  }
}

initTheme();
