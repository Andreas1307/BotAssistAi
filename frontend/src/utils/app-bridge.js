// appBridgeClient.js

import createApp from "@shopify/app-bridge";
import { authenticatedFetch } from "@shopify/app-bridge/utilities";

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  let host = urlParams.get("host") || localStorage.getItem("host");

  if (!host) {
    console.warn("❌ Missing host param in URL or localStorage");
    return null;
  }

  localStorage.setItem("host", host);

  const isEmbedded = window.top !== window.self;

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: isEmbedded,
    performance: {
      webVitals: false,
    },
  });

  return appInstance;
}

export function fetchWithAuth(url, options = {}) {
  const app = getAppBridgeInstance();

  if (!app) {
    console.warn("⚠️ App Bridge not initialized. Using regular fetch.");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  const fetchFunction = authenticatedFetch(app);

  return fetchFunction(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
