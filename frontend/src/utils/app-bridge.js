let appInstance = null;

/**
 * Returns a singleton App Bridge instance using the global script-loaded version
 */
export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  if (!host) {
    console.warn("❌ Missing 'host' parameter in URL");
    return null;
  }

  if (!window.appBridge || !window.appBridge.createApp) {
    console.warn("❌ Shopify App Bridge not loaded. Make sure the CDN script is included.");
    return null;
  }

  appInstance = window.appBridge.createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host: host,
    forceRedirect: true,
  });

  return appInstance;
}

/**
 * Authenticated fetch using App Bridge session token
 */
export async function authenticatedFetch(url, options = {}) {
  const app = getAppBridgeInstance();

  if (!app || !window.appBridgeUtils?.getSessionToken) {
    console.warn("⚠️ App Bridge or session token utility not available. Falling back to regular fetch.");
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const token = await window.appBridgeUtils.getSessionToken(app);

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("❌ Failed to get session token from App Bridge:", err);
    throw err;
  }
}