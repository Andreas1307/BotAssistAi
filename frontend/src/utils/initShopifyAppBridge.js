import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";

/**
 * Initializes Shopify App Bridge safely.
 * - Skips initialization if not embedded or missing params
 * - Guards against Web Vitals errors
 * - Avoids SendBeacon/metrics failures affecting app
*/

export async function initShopifyAppBridge() {
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");
    const embedded = params.get("embedded") === "1" || params.get("embedded") === "true";

    if (!embedded || !shop || !host) {
      console.warn(
        "⚠️ Not embedded or missing 'shop'/'host' params — skipping App Bridge init"
      );
      return null;
    }

    const app = createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    });

    window.appBridge = app;

    // Safely initialize Web Vitals
    try {
      if (typeof app.initializeWebVitals === "function") {
        app.initializeWebVitals();
      } else {
        console.warn("⚠️ Web Vitals init skipped: method missing");
      }
    } catch (err) {
      console.warn("⚠️ Web Vitals initialization failed:", err);
    }

    console.log("✅ Shopify App Bridge initialized");
    return app;
  } catch (err) {
    console.error("❌ Failed to init App Bridge:", err);
    return null;
  }
}

/**
 * Returns existing App Bridge instance or creates one if needed
 */
export function getAppBridgeInstance() {
  if (window.appBridge) return window.appBridge;

  const params = new URLSearchParams(window.location.search);
  const host = params.get("host") || localStorage.getItem("host");
  if (!host) {
    console.warn("❌ Missing host param, cannot create App Bridge instance");
    return null;
  }

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  window.appBridge = app;
  return app;
}

/**
 * Safe redirect (embedded or standalone)
 */
export function safeRedirect(url) {
  const app = getAppBridgeInstance();
  const isEmbedded = window.top !== window.self;

  if (isEmbedded && app) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
  } else {
    window.top.location.href = url;
  }
}

/**
 * Fetch with App Bridge auth token
 */
export async function fetchWithAuth(url, options = {}) {
  const app = getAppBridgeInstance();
  if (!app) return new Response(null, { status: 401 });

  try {
    const token = await getSessionToken(app);
    if (!token) return new Response(null, { status: 401 });

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error("❌ Token error:", err);
    return new Response(null, { status: 401 });
  }
}
