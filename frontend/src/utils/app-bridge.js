import { getSessionToken } from '@shopify/app-bridge-utils';

let appInstance = null;

export async function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");

  if (!host) {
    console.warn("❌ Missing host param");
    return null;
  }

  localStorage.setItem("host", host);

  const isEmbedded = window.top !== window.self;

  try {
    const { createApp } = await import('@shopify/app-bridge');
    appInstance = createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: isEmbedded,
    });
    return appInstance;
  } catch (err) {
    console.error("❌ App Bridge load error:", err);
    return null;
  }
}

export async function fetchWithAuth(url, options = {}) {
  const app = await getAppBridgeInstance();
  if (!app) {
    console.warn("⚠️ No AppBridge instance, doing regular fetch");
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error("❌ Failed to get session token:", err);
    return fetch(url, options);
  }
}
