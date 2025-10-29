import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import directory from "../directory";
/**
 * Detect if running inside Shopify iframe
 */
function isEmbedded() {
  return window.top !== window.self;
}
/**
 * Initializes Shopify App Bridge safely.
 * - Skips if not embedded or missing params
 * - Avoids noisy Web Vitals errors
 */
export async function initShopifyAppBridge() {
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!isEmbedded() || !shop || !host) {
      window.top.location.href = `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(shop)}`;
      console.info("ℹ️ Running outside Shopify iframe — skipping App Bridge");
      return null;
    }
    

    const app = createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    });

    window.appBridge = app;

    // Silently try to initialize Web Vitals
    try {
      if (typeof app.initializeWebVitals === "function") {
        app.initializeWebVitals();
      }
    } catch {
      // ignore
    }

    console.log("✅ Shopify App Bridge initialized");
    return app;
  } catch (err) {
    console.error("❌ Failed to init App Bridge:", err);
    return null;
  }
}

/**
 * Returns existing App Bridge instance if available
 */
export function getAppBridgeInstance() {
  return window.appBridge || null;
}

/**
 * Safe redirect (embedded or standalone)
 */
export function safeRedirect(url) {
  const app = getAppBridgeInstance();

  if (isEmbedded() && app) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
  } else {
    window.top.location.href = url;
  }
}

/**
 * Fetch with App Bridge auth token if inside Shopify
 * Falls back to plain fetch when running standalone
 */
export async function fetchWithAuth(url, options = {}) {
  console.log("🚀 fetchWithAuth →", url, options);

  const app = getAppBridgeInstance();
  const isEmbedded = window.top !== window.self;
  let token = null;

  if (app && isEmbedded) {
    console.log("🧩 Embedded app detected, fetching session token…");
    try {
      token = await getSessionToken(app);
      console.log("✅ Got session token:", token.slice(0, 20) + "…");
      window.sessionToken = token; // store for reuse briefly
    } catch (err) {
      console.warn("⚠️ Failed to get session token, falling back to cookie:", err);
      token = window.sessionToken || getCookie("shopify_online_session");
    }
  } else {
    console.log("🌍 Not embedded — using cookie instead");
    token = window.sessionToken || getCookie("shopify_online_session");
  }

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  console.log("📦 Final headers:", headers);

  const fullUrl = url.startsWith("http")
    ? url
    : `${window.directory || "https://api.botassistai.com"}${url}`;

  console.log("🌐 Full URL:", fullUrl);

  const res = await fetch(fullUrl, {
    method: options.method || "GET",
    headers,
    credentials: "include",
    body:
      options.body && !isFormData
        ? typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
        : options.body,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ Request failed:", res.status, errText);
    throw new Error(`Request failed: ${res.status} ${errText}`);
  }

  try {
    const json = await res.json();
    console.log("📥 Response JSON:", json);
    return json;
  } catch {
    console.log("📥 Response not JSON, returning raw");
    return null;
  }
}

function getCookie(name) {
  const value = document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="));
  return value ? value.split("=")[1] : null;
}