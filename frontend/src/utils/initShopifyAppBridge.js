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

  if (!isEmbedded() || !host) {
    console.log("⚠️ Not embedded or missing host — redirecting to auth via top-level window");
    // Use top-level navigation only if we're NOT embedded
    if (window.top === window.self) {
      window.location.href = `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(shop)}`;
    } else {
      // Use App Bridge Redirect to safely exit iframe
      const app = createApp({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host: host || "",
      });
      const redirect = Redirect.create(app);
      redirect.dispatch(
        Redirect.Action.REMOTE,
        `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(shop)}`
      );
    }
    return null;
  }
  

if (!host) {
  console.warn("⚠️ Missing host param — retrying App Bridge init");
  setTimeout(initShopifyAppBridge, 500); // retry once host appears
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
export async function getAppBridgeInstance() {
  if (window.appBridge) return window.appBridge;

  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");
  const apiKey = process.env.REACT_APP_SHOPIFY_API_KEY;

  if (!isEmbedded() || !host) return null;

  const app = createApp({ apiKey, host, forceRedirect: true });
  window.appBridge = app;
  return app;
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

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const opts = {
    method: options.method || "GET",
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    credentials: "include", // 🔑 allow cookies cross-domain
  };

  if (options.body) {
    opts.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  const fullUrl = url.startsWith("http")
    ? url
    : `${window.directory || "https://api.botassistai.com"}${url}`;

  const res = await fetch(fullUrl, opts);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Request failed: ${res.status} ${errText}`);
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