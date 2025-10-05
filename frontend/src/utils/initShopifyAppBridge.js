import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";

/**
 * Detect if running inside Shopify iframe
 */
export function isEmbedded() {
  return window.top !== window.self;
}

/**
 * Initializes Shopify App Bridge safely
 */
export function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");

  if (!isEmbedded() || !shop || !host) {
    console.info("ℹ️ Running outside Shopify iframe — skipping App Bridge");
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
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");

  if (!url.includes("host=") && host) url += `${url.includes("?") ? "&" : "?"}host=${encodeURIComponent(host)}`;
  if (!url.includes("shop=") && shop) url += `${url.includes("?") ? "&" : "?"}shop=${encodeURIComponent(shop)}`;

  if (isEmbedded() && app) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, url);
  } else {
    window.top.location.href = url;
  }
}

/**
 * Fetch with App Bridge auth token if inside Shopify
 */
export async function fetchWithAuth(url, options = {}) {
  const app = getAppBridgeInstance();

  if (!isEmbedded() || !app) {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  }

  const token = await getSessionToken(app);
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}
