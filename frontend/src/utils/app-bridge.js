// src/utils/app-bridge.js
import { createApp, Redirect } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

/**
 * Returns a singleton App Bridge instance
 */
export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");
  if (!host) {
    console.warn("❌ Missing host param");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  return appInstance;
}

/**
 * Waits for App Bridge to be available (only in embedded apps)
 */
export async function waitForAppBridge() {
  const isEmbedded = window.top !== window.self;
  if (!isEmbedded) {
    console.warn("⚠️ Not in iframe (not embedded)");
    return null;
  }

  return getAppBridgeInstance();
}

/**
 * Performs a fetch request authenticated with Shopify session token
 */
export async function fetchWithAuth(url, options = {}) {
  const app = await waitForAppBridge();
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

/**
 * Redirects the user using App Bridge
 */
export function redirectToUrl(url) {
  const app = getAppBridgeInstance();
  if (!app) {
    // Fallback for non-embedded or missing app instance
    window.top.location.href = url;
    return;
  }

  const redirect = Redirect.create(app);
  redirect.dispatch(Redirect.Action.REMOTE, url);
}
