
let appInstance = null;
let authenticatedFetchFn = null;
function waitForAppBridge(timeout = 15000) { // bump to 15 seconds
  return new Promise((resolve, reject) => {
    const start = Date.now();

    (function check() {
      if (window.Shopify && window.Shopify.AppBridge && typeof window.Shopify.AppBridge.createApp === 'function') {
        return resolve(window.Shopify.AppBridge);
      }
      if (Date.now() - start > timeout) {
        return reject(new Error("Timed out waiting for AppBridge to load"));
      }
      setTimeout(check, 100); // check every 100ms instead of rAF for more reliable polling
    })();
  });
}

async function getAuthenticatedFetch(app) {
  if (!authenticatedFetchFn) {
    const module = await import('@shopify/app-bridge-utils');
    authenticatedFetchFn = module.authenticatedFetch;
  }
  return authenticatedFetchFn(app);
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

    console.log("Creating AppBridge instance with host:", host);
    console.log("Shopify API Key:", process.env.REACT_APP_SHOPIFY_API_KEY);

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

  const fetchFn = await getAuthenticatedFetch(app);

  return fetchFn(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}