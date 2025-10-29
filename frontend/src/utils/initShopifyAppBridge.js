import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
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
 
export function getAppBridgeInstance() {
  return window.appBridge || null;
}
*/
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
  let token = null;
  const app = getAppBridgeInstance?.() || window.appBridge || null;

  // 🔹 Step 1: Try getting a fresh App Bridge token if available
  if (app) {
    try {
      token = await getSessionToken(app); // always fresh Shopify JWT
      window.sessionToken = token;
    } catch (err) {
      console.warn("⚠️ Could not fetch Shopify session token:", err);
      token = window.sessionToken || getCookie("shopify_online_session");
    }
  } else {
    // 🔹 Fallback for non-embedded or external users
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

  let res = await fetch(fullUrl, opts);

  // 🔄 Step 2: Handle expired or invalid token automatically
  if (res.status === 401 && app) {
    console.warn("🔄 Token expired — refreshing session token...");
    try {
      token = await getSessionToken(app);
      window.sessionToken = token;

      // retry request once
      opts.headers.Authorization = `Bearer ${token}`;
      res = await fetch(fullUrl, opts);
    } catch (retryErr) {
      console.error("❌ Token refresh failed:", retryErr);
    }
  }

  // 🔹 Step 3: Handle final response
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Safely reads cookies
 */
function getCookie(name) {
  if (typeof document === "undefined" || !document.cookie) return null;
  const match = document.cookie.split("; ").find(row => row.startsWith(name + "="));
  return match ? match.split("=")[1] : null;
}