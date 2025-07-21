// appBridgeClient.js
import { loadShopifyAppBridgeScripts } from "./loadShopifyAppBridge";
const authenticatedFetch = window.appBridgeUtils?.authenticatedFetch;


let appInstance = null;

export async function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  try {
    await loadShopifyAppBridgeScripts(); // Ensure scripts are loaded first
  } catch (err) {
    console.error("❌ Failed to load App Bridge scripts", err);
    throw err;
  }

  const createApp = window.appBridge?.createApp;
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");

  if (!host) {
    console.warn("❌ Missing host param in URL or localStorage");
    return null;
  }

  localStorage.setItem("host", host);
  const isEmbedded = window.top !== window.self;

  if (!createApp) {
    console.error("❌ App Bridge createApp is still undefined after load");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: isEmbedded,
  });

  return appInstance;
}

export async function fetchWithAuth(url, options = {}) {
  const app = await getAppBridgeInstance();

  const fetchFunction = window.appBridgeUtils?.authenticatedFetch?.(app);
  if (!app || !fetchFunction) {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  return fetchFunction(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

function waitForAppBridge(timeout = 15000, interval = 100) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const hasAppBridge = typeof window.appBridge?.createApp === "function";
      const hasUtils = typeof window.appBridgeUtils?.authenticatedFetch === "function";

      if (hasAppBridge && hasUtils) {
        console.log("✅ Shopify App Bridge loaded");
        return resolve();
      }

      if (Date.now() - startTime >= timeout) {
        console.error("❌ App Bridge still not loaded after 15 seconds");
        return reject(new Error("Timed out waiting for Shopify App Bridge to load."));
      }

      setTimeout(check, interval);
    };

    check();
  });
}
