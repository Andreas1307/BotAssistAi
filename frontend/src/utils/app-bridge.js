// appBridgeClient.js
import { loadAppBridge } from "./loadAppBridge";
const authenticatedFetch = window?.Shopify?.AppBridge?.Utils?.authenticatedFetch;

function waitForAppBridgeLoad(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function checkReady() {
      const isReady = typeof window.Shopify?.AppBridge?.createApp === "function";

      if (isReady) {
        return resolve(window.Shopify.AppBridge.createApp);
      }

      if (Date.now() - start >= timeout) {
        return reject(new Error("Timed out waiting for AppBridge to load"));
      }

      setTimeout(checkReady, 100);
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
      checkReady();
    } else {
      window.addEventListener("DOMContentLoaded", checkReady);
    }
  });
}



let appInstance = null;

export async function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  try {
    await loadAppBridge();
  } catch (err) {
    console.error("❌ Failed to load App Bridge scripts", err);
    throw err;
  }

  const createApp = window.Shopify.AppBridge.createApp;
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");

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
  });

  return appInstance;
}


export async function fetchWithAuth(url, options = {}) {
  const app = await getAppBridgeInstance();

  const fetchFunction = authenticatedFetch?.(app);
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

