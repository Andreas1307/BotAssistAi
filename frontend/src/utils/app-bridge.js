// utils/app-bridge.js
import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

/**
 * Gets the App Bridge instance using host from URL or localStorage
 */
export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  // Try getting host from URL first
  const urlParams = new URLSearchParams(window.location.search);
  let host = urlParams.get("host");

  // Save host if found in URL
  if (host) {
    localStorage.setItem("shopify_host", host);
  } else {
    // Try getting host from localStorage
    host = localStorage.getItem("shopify_host");
  }

  // If still no host, fail
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
    console.log("📦 Using session token:", token); // Optional: Debug

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
