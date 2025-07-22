import { getSessionToken } from "@shopify/app-bridge-utils";
import createApp from "@shopify/app-bridge";
let appInstance = null;

function waitForShopifyAppBridge(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    (function check() {
      const bridgeReady =
        window.Shopify?.AppBridge?.createApp &&
        typeof window.Shopify.AppBridge.createApp === "function";
    
      console.log("Checking AppBridge availability:", bridgeReady);
    
      if (bridgeReady) {
        return resolve(window.Shopify.AppBridge);
      }
    
      if (Date.now() - start > timeout) {
        console.error("❌ AppBridge still not ready after timeout");
        return reject(new Error("AppBridge timeout"));
      }
    
      setTimeout(check, 100);
    })();
    
  });
}

export async function waitForAppBridge() {
  const isEmbedded = window.top !== window.self;
  if (!isEmbedded) {
    console.warn("⚠️ Not inside Shopify embedded iframe, skipping AppBridge initialization");
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");
  if (!host) {
    console.warn("❌ Missing host param in URL or localStorage");
    return null;
  }

  return getAppBridgeInstance(); // ✅ no wait needed
}



export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");

  if (!host) {
    console.warn("❌ Missing host param in URL or localStorage");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  return appInstance;
}


export async function fetchWithAuth(url, options = {}) {
  const app = await waitForAppBridge();
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



