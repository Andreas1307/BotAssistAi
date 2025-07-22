import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

/**
 * Wait for Shopify App Bridge global to be available inside the iframe.
 * Resolves with window.Shopify.AppBridge object or rejects on timeout.
 */
function waitForShopifyAppBridge(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    (function check() {
      const bridgeReady =
        window.Shopify?.AppBridge?.createApp &&
        typeof window.Shopify.AppBridge.createApp === "function";

      if (bridgeReady) {
        // console.log("✅ AppBridge is ready");
        return resolve(window.Shopify.AppBridge);
      }

      if (Date.now() - start > timeout) {
        console.error("❌ AppBridge still not ready after timeout");
        return reject(new Error("AppBridge timeout"));
      }

      // Poll every 100ms
      setTimeout(check, 100);
    })();
  });
}

/**
 * Waits for App Bridge to be ready, then returns the app instance.
 */
export async function waitForAppBridge(timeout = 10000) {
  // Only try to load App Bridge if inside Shopify embedded iframe
  const isEmbedded = window.top !== window.self;
  if (!isEmbedded) {
    console.warn("⚠️ Not inside embedded iframe, skipping AppBridge initialization");
    return null;
  }

  await waitForShopifyAppBridge(timeout);
  return getAppBridgeInstance();
}

/**
 * Creates or returns cached App Bridge app instance.
 */
export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");

  if (!host) {
    console.warn("❌ Missing host param in URL or localStorage");
    return null;
  }

  try {
    appInstance = window.Shopify.AppBridge.createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true, // force redirect inside embedded iframe to login if needed
    });

    if (!appInstance) {
      throw new Error("Failed to initialize AppBridge");
    }

  } catch (e) {
    console.error("❌ Failed to create AppBridge instance:", e);
    return null;
  }

  return appInstance;
}

/**
 * Helper fetch wrapper to do authenticated fetch with session token.
 */
export async function fetchWithAuth(url, options = {}) {
  const app = await waitForAppBridge();
  if (!app) {
    console.warn("⚠️ No AppBridge instance, skipping fetch");
    return new Response(null, { status: 401 });
  }

  try {
    const token = await getSessionToken(app);
    if (!token) {
      console.warn("⚠️ No session token, skipping fetch");
      return new Response(null, { status: 401 });
    }

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error("❌ Failed to get session token:", err);
    return new Response(null, { status: 401 });
  }
}
