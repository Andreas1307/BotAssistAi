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
  // 1️⃣ Ensure App Bridge is initialized
  let app = window.appBridge || (await initShopifyAppBridge());
  let token = null;

  // 2️⃣ Always get a fresh JWT from App Bridge
  if (app) {
    try {
      token = await getSessionToken(app);
      window.sessionToken = token; // cache for quick reuse
    } catch (err) {
      console.warn("⚠️ Failed to get Shopify session token:", err);
    }
  }

  // 3️⃣ Build headers (only include Authorization if we have a token)
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // 4️⃣ Build full URL
  const fullUrl = url.startsWith("http")
    ? url
    : `https://api.botassistai.com${url}`;

  // 5️⃣ Perform fetch
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${text}`);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}


function getCookie(name) {
  return document.cookie.split("; ").find(row => row.startsWith(name + "="))?.split("=")[1];
}