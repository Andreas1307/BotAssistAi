// appBridgeClient.js

import createApp from '@shopify/app-bridge';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
let appInstance = null;

function waitForAppBridgeLoad(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function checkReady() {
      const createApp = window?.Shopify?.AppBridge?.createApp;
      console.log('Checking AppBridge:', createApp ? 'Found' : 'Not yet');

      if (typeof createApp === "function") return resolve(createApp);

      if (Date.now() - start >= timeout) {
        return reject(new Error("Timed out waiting for AppBridge to load"));
      }

      setTimeout(checkReady, 100);
    }

    checkReady();
  });
}


export async function getAppBridgeInstance() {
  if (appInstance) return appInstance;

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

  const fetchFn = authenticatedFetch(app);
  return fetchFn(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
