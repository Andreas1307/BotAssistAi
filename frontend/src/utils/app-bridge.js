// src/utils/app-bridge.js

let appInstance = null;

/**
 * Returns a singleton App Bridge instance
 */
export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  if (!host) {
    console.warn("❌ Missing host in URL");
    return null;
  }

  if (!window.appBridge || !window.appBridge.createApp) {
    console.warn("❌ App Bridge not loaded yet");
    return null;
  }

  const createApp = window.appBridge.createApp;

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  return appInstance;
}

/**
 * Authenticated fetch using App Bridge session token
 */
export async function authenticatedFetch(url, options = {}) {
  const app = getAppBridgeInstance();

  // Fallback fetch if outside embedded app (no App Bridge)
  if (!app || !window.appBridge?.getSessionToken) {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const token = await window.appBridge.getSessionToken(app);

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("❌ Failed to retrieve session token:", err);
    throw err;
  }
}
