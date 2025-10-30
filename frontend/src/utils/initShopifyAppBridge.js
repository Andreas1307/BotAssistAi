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
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");

  if (!shop) {
    console.error("❌ Missing 'shop' param, cannot init App Bridge");
    return null;
  }

  // if running outside iframe (standalone or first load)
  if (!isEmbedded() || !host) {
    window.top.location.href = `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(
      shop
    )}`;
    return null;
  }

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  window.appBridge = app;
  console.log("✅ App Bridge initialized for", shop);
  return app;
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
  let app = window.appBridge || (await initShopifyAppBridge());
  let token = null;

  if (app) {
    try {
      token = await getSessionToken(app); // 🔥 Secure, fresh JWT every call
      window.sessionToken = token;
    } catch (err) {
      console.warn("⚠️ Failed to get session token:", err);
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const fullUrl = url.startsWith("http")
    ? url
    : `https://api.botassistai.com${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

function getCookie(name) {
  return document.cookie.split("; ").find(row => row.startsWith(name + "="))?.split("=")[1];
}