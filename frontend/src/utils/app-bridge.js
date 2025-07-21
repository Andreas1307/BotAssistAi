import { authenticatedFetch } from '@shopify/app-bridge-utils';

let appInstance = null;

/**
 * Polls until AppBridge is available on the window object
 */
function waitForAppBridge(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    (function check() {
      const bridge = window?.Shopify?.AppBridge;

      if (bridge && typeof bridge.createApp === 'function') {
        return resolve(bridge);
      }

      if (Date.now() - start > timeout) {
        return reject(new Error("Timed out waiting for AppBridge to load"));
      }

      requestAnimationFrame(check);
    })();
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

  try {
    const AppBridge = await waitForAppBridge();

    appInstance = AppBridge.createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: isEmbedded,
    });

    return appInstance;
  } catch (err) {
    console.error("❌ App Bridge failed to load:", err);
    return null;
  }
}

export async function fetchWithAuth(url, options = {}) {
  const app = await getAppBridgeInstance();

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
