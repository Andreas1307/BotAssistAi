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


export async function fetchWithAuth(url, options = {}) {
  let token = null;
  const app = window.appBridge || null;
  const embedded = isEmbedded();

  // 🧠 Get Shopify session token when embedded
  if (app && embedded) {
    try {
      token = await getSessionToken(app);
      console.log("✅ [fetchWithAuth] Shopify token:", token.slice(0, 40) + "...");
      window.sessionToken = token;
    } catch (err) {
      console.warn("⚠️ Could not get App Bridge session token:", err);
    }
  } else {
    console.log("🔵 Not embedded or no AppBridge; using cookie fallback");
    token = window.sessionToken || getCookie("shopify_online_session");
  }

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const opts = {
    method: options.method || "GET",
    headers,
    credentials: "include",
  };

  if (options.body) {
    opts.body = isFormData
      ? options.body
      : typeof options.body === "string"
      ? options.body
      : JSON.stringify(options.body);
  }

  const base = window.directory || "https://api.botassistai.com";
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`;

  const res = await fetch(fullUrl, opts);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ [fetchWithAuth] Error:", res.status, text);
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

function getCookie(name) {
  return document.cookie.split("; ").find(r => r.startsWith(name + "="))?.split("=")[1];
}