import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  let host = urlParams.get("host");

  if (host) {
    localStorage.setItem("host", host);
  } else {
    host = localStorage.getItem("host");
  }

  if (!host) {
    console.warn("❌ Missing host in URL and localStorage");
    return null;
  }

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host: host,
    forceRedirect: window.top !== window.self,
  });

  appInstance = app;
  return app;
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