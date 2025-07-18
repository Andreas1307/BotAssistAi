// app-bridge.js
const createApp = window.appBridge.createApp;
const getSessionToken = window.appBridgeUtils.getSessionToken;

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  if (!host) return null;

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  return appInstance;
}

export async function authenticatedFetch(url, options = {}) {
  const app = getAppBridgeInstance();
  if (!app) {
    // fallback for non-Shopify users
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    });
  }

  const token = await getSessionToken(app);

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
