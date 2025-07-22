
let appInstance = null;
let authenticatedFetchFn = null;
import { getSessionToken } from '@shopify/app-bridge-utils';


async function waitForAppBridge(timeout = 15000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const module = await import('@shopify/app-bridge'); // 👈 real ESM module
      if (typeof module.createApp === 'function') {
        return module;
      }
    } catch (e) {
      // Might fail if not resolved yet, keep retrying
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  throw new Error("Timed out waiting for AppBridge to load");
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

  try {
    const token = await getSessionToken(app); // 👈 Get token manually
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 👈 Inject manually
      ...(options.headers || {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error("❌ Failed to get session token:", err);
    return fetch(url, options); // fallback
  }
}