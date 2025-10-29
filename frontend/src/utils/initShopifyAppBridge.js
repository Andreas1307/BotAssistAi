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
  console.log("🟢 [fetchWithAuth] Called with URL:", url, "Options:", options);

  let token = null;
  const app = window.appBridge || null;
  const isEmbedded = window.top !== window.self;

  console.log("🟡 [fetchWithAuth] isEmbedded:", isEmbedded, "AppBridge instance:", !!app);

  if (app && isEmbedded) {
    try {
      console.log("🟢 [fetchWithAuth] Attempting to get Shopify session token...");
      token = await getSessionToken(app);
      console.log("✅ [fetchWithAuth] Received Shopify token:", token?.slice(0, 40) + "...");
      window.sessionToken = token;
    } catch (err) {
      console.warn("⚠️ [fetchWithAuth] Could not get Shopify session token:", err);
      token = window.sessionToken || getCookie("shopify_online_session");
      console.log("🟠 [fetchWithAuth] Fallback token (cookie/session):", token);
    }
  } else {
    console.log("🔵 [fetchWithAuth] Not embedded or no appBridge, using cookie/session");
    token = window.sessionToken || getCookie("shopify_online_session");
    console.log("🔵 [fetchWithAuth] Cookie token value:", token);
  }

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  console.log("🧾 [fetchWithAuth] Final request headers:", headers);

  const opts = {
    method: options.method || "GET",
    headers,
    credentials: "include",
    body:
      options.body && !isFormData
        ? typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
        : options.body,
  };

  const fullUrl = url.startsWith("http")
    ? url
    : `${window.directory || "https://api.botassistai.com"}${url}`;

  console.log("🌐 [fetchWithAuth] Final URL:", fullUrl);
  console.log("📤 [fetchWithAuth] Sending fetch with opts:", opts);

  const res = await fetch(fullUrl, opts);

  console.log("📥 [fetchWithAuth] Response status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ [fetchWithAuth] Request failed:", res.status, text);
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  try {
    const json = await res.json();
    console.log("✅ [fetchWithAuth] JSON response:", json);
    return json;
  } catch (err) {
    console.warn("⚠️ [fetchWithAuth] Could not parse JSON:", err);
    return null;
  }
}

function getCookie(name) {
  if (!document.cookie) return null;
  const row = document.cookie.split("; ").find(r => r.startsWith(name + "="));
  return row ? row.split("=")[1] : null;
}