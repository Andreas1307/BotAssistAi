// src/utils/appBridgeClient.js
import { authenticatedFetch } from '@shopify/app-bridge-utils';

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  // ✅ Check App Bridge is loaded
  if (!window.Shopify || !window.Shopify.AppBridge || typeof window.Shopify.AppBridge.createApp !== "function") {
    console.error("❌ AppBridge not available or createApp not found");
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");

  if (!host) {
    console.warn("❌ Missing host param in URL or localStorage");
    return null;
  }

  localStorage.setItem("host", host);

  const isEmbedded = window.top !== window.self;

  // ✅ Use createApp directly from AppBridge global
  appInstance = window.Shopify.AppBridge.createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: isEmbedded,
  });

  return appInstance;
}

export async function fetchWithAuth(url, options = {}) {
  const app = getAppBridgeInstance();

  if (!app) {
    console.warn("⚠️ No AppBridge instance. Using native fetch.");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  const fetchFn = authenticatedFetch(app);

  return fetchFn(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
