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

  // If not embedded → redirect to auth
  if (!isEmbedded() || !shop) {
    window.top.location.href = `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(
      shop || ""
    )}`;
    console.info("ℹ️ Not in iframe — redirecting to Shopify OAuth");
    return null;
  }

  if (!host) {
    console.warn("⚠️ Missing host param, cannot init App Bridge");
    return null;
  }

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  window.appBridge = app;
  console.log("✅ Shopify App Bridge initialized");
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
  let app = getAppBridgeInstance() || (await initShopifyAppBridge());
  let token = null;

  if (app) {
    try {
      // ✅ Always get a fresh JWT from Shopify
      token = await getSessionToken(app);
      window.sessionToken = token;
    } catch (err) {
      console.warn("⚠️ Failed to get Shopify session token:", err);
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
    throw new Error(`Request failed: ${res.status} ${text}`);
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