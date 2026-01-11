import { Clerk } from "@clerk/clerk-js";

// Clerk expects a publishable key before it can initialize.
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error("Clerk publishable key is missing; ClerkJS cannot be initialized.");
}

const clerk = new Clerk(clerkPubKey);
const DEFAULT_REDIRECT_PATH = "index.html";
let lastRenderKey = null;

function normalizeClerkView(view) {
  const cleaned = String(view || "").trim().toLowerCase();
  if (cleaned === "signup" || cleaned === "sign-up") return "sign-up";
  if (cleaned === "signin" || cleaned === "sign-in") return "sign-in";
  return "default";
}

function resolveRedirectTarget(root) {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("redirect") || root?.dataset?.clerkRedirect || root?.dataset?.redirect;
  if (!raw) return DEFAULT_REDIRECT_PATH;
  try {
    const targetUrl = new URL(raw, window.location.href);
    if (targetUrl.origin !== window.location.origin) return DEFAULT_REDIRECT_PATH;
    const targetPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (targetPath === currentPath) return DEFAULT_REDIRECT_PATH;
    return targetPath;
  } catch (error) {
    return DEFAULT_REDIRECT_PATH;
  }
}

function redirectIfSignedIn(root) {
  if (!clerk.isSignedIn) return false;
  const target = resolveRedirectTarget(root);
  if (!target) return false;
  window.location.replace(target);
  return true;
}

function clearClerkMountPoint(root) {
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }
}

function renderClerkWidgets({ force = false } = {}) {
  const root = document.getElementById("clerk-app");
  if (!root) return;
  const view = normalizeClerkView(root.dataset.clerkView || root.dataset.clerk);
  const isSignedIn = Boolean(clerk.isSignedIn);
  const renderKey = `${view}:${isSignedIn}`;
  if (!force && lastRenderKey === renderKey) return;
  lastRenderKey = renderKey;
  root.dataset.view = view;
  clearClerkMountPoint(root);
  root.dataset.signedIn = isSignedIn ? "true" : "false";
  if (isSignedIn && view !== "default") {
    redirectIfSignedIn(root);
    return;
  }
  const widgetId = isSignedIn
    ? "clerk-user-button"
    : view === "sign-up"
      ? "clerk-sign-up"
      : "clerk-sign-in";
  const widgetStyle = isSignedIn ? "user" : view === "sign-up" ? "signup" : "signin";
  const widgetWrapper = document.createElement("div");
  widgetWrapper.id = widgetId;
  widgetWrapper.className = `clerk-widget clerk-widget--${widgetStyle}`;
  root.appendChild(widgetWrapper);
  if (isSignedIn) {
    clerk.mountUserButton(widgetWrapper);
  } else if (view === "sign-up") {
    clerk.mountSignUp(widgetWrapper);
  } else {
    clerk.mountSignIn(widgetWrapper);
  }
}

function notifyClerkReady() {
  try {
    window.dispatchEvent(new CustomEvent("clerk:ready", { detail: { clerk } }));
  } catch (error) {
    // Ignore event dispatch failures in older browsers.
  }
}

async function initializeClerk() {
  try {
    await clerk.load();
    window.clerk = clerk;
    renderClerkWidgets({ force: true });
    notifyClerkReady();
    clerk.addListener(() => {
      renderClerkWidgets();
      notifyClerkReady();
    });
  } catch (error) {
    console.error("Failed to initialize ClerkJS", error);
  }
}

initializeClerk();
