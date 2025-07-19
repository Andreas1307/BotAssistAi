import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  if (!host) {
    console.warn("❌ Missing host in URL");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY, // Must be set in your .env
    host,
    forceRedirect: true,
  });

  return appInstance;
}

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
