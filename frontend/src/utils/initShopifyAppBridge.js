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
  const token = window.sessionToken || getCookie("shopify_online_session");

  // Detect if the request is multipart
  const isFormData = options.body instanceof FormData;

  // ✅ Don’t manually set Content-Type for FormData
  const defaultHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const opts = {
    method: options.method || "GET",
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    credentials: "include", // like axios { withCredentials: true }
    body: isFormData
      ? options.body
      : options.body
      ? JSON.stringify(options.body)
      : undefined,
  };

  const fullUrl = url.startsWith("http")
    ? url
    : `${window.directory || "https://api.botassistai.com"}${url}`;

  const res = await fetch(fullUrl, opts);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Request failed: ${res.status} ${errorText}`);
  }

  // Try parsing JSON, but handle empty response
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function getCookie(name) {
  return document.cookie.split("; ").find(r => r.startsWith(name + "="))?.split("=")[1];
}
