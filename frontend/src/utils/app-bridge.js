// utils/app-bridge.js
import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

/**
 * Gets the App Bridge instance using host from URL or localStorage
 */
export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  let host;

  // Check URL first
  const urlParams = new URLSearchParams(window.location.search);
  host = urlParams.get("host");

  // If found in URL, store it
  if (host) {
    localStorage.setItem("host", host);
  } else {
    // Otherwise, try localStorage
    host = localStorage.getItem("host");
  }

  if (!host) {
    console.warn("❌ Missing host in URL and localStorage");
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
 * Authenticated fetch using session token
 */
export async function authenticatedFetch(url, options = {}) {
  const app = getAppBridgeInstance();

  if (!app) {
    console.warn("⚠️ App Bridge not available. Falling back to regular fetch.");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  try {
    const token = await getSessionToken(app);

    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (err) {
    console.error("❌ Failed to get session token from App Bridge:", err);
    throw err;
  }
}