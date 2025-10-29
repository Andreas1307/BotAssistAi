import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { getShopOrigin } from "@shopify/app-bridge/utilities";
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
  if (app) return app;

  const shopOrigin = getShopOrigin() || new URLSearchParams(window.location.search).get("shop");
  if (!shopOrigin) {
    console.warn("⚠️ No shopOrigin found for App Bridge");
    return null;
  }

  app = createApp({
    apiKey: process.env.SHOPIFY_API_KEY,
    shopOrigin,
    host: new URLSearchParams(window.location.search).get("host"),
    forceRedirect: true,
  });

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
  const app = getAppBridgeInstance();
  let token = null;

  try {
    if (app) {
      token = await getSessionToken(app); // 🔐 Shopify JWT
      window.sessionToken = token;
    }
  } catch (err) {
    console.warn("⚠️ Failed to get session token:", err);
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const opts = {
    method: options.method || "GET",
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    credentials: "include",
  };

  if (options.body) {
    opts.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  const base = window.directory || "https://api.botassistai.com";
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`;

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