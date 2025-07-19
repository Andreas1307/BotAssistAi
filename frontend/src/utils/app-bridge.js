let appInstance = null;

/**
 * Returns a singleton App Bridge instance using the globally created app
 */
export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  if (!window.appBridge || !window.appBridge.app) {
    console.warn("❌ App Bridge not initialized via global script.");
    return null;
  }

  appInstance = window.appBridge.app;
  return appInstance;
}

/**
 * Authenticated fetch using App Bridge session token
 */
export async function authenticatedFetch(url, options = {}) {
  const app = getAppBridgeInstance();

  if (!app || !window.appBridge?.getSessionToken) {
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
    console.error("❌ Failed to get session token from App Bridge:", err);
    throw err;
  }
}
