import { getSessionToken } from '@shopify/app-bridge-utils';

let appInstance = null;
async function waitForAppBridge(timeout = 3000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      const app = getAppBridgeInstance();
      if (app) return resolve(app);
      if (Date.now() - start > timeout) return reject("AppBridge timeout");
      setTimeout(check, 100);
    })();
  });
} 
export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");

  if (!host) {
    console.warn("❌ Missing host param in URL or localStorage");
    return null;
  }

  localStorage.setItem("host", host);

  const isEmbedded = window.top !== window.self;

  if (!window.Shopify || !window.Shopify.AppBridge || typeof window.Shopify.AppBridge.createApp !== "function") {
    console.error("❌ AppBridge not available or createApp not found");
    return null;
  }

  try {
    appInstance = window.Shopify.AppBridge.createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: isEmbedded,
    });
  } catch (e) {
    console.error("❌ Failed to create AppBridge instance:", e);
    return null;
  }

  return appInstance;
}

export async function fetchWithAuth(url, options = {}) {
  const app = await getAppBridgeInstance();
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
export { waitForAppBridge };
