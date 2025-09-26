import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop") || window.__SHOPIFY__?.shop;
  const host = params.get("host") || window.__SHOPIFY__?.host;

  if (!shop || !host) {
    console.warn("⚠️ Missing Shopify shop or host — App Bridge cannot initialize");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: window.top !== window.self, // redirect only inside iframe
  });

  console.log("✅ Shopify App Bridge initialized", { shop, host });
  return appInstance;
}

export async function waitForAppBridge(timeout = 3000) {
  const isEmbedded = window.top !== window.self;
  if (!isEmbedded) {
    console.warn("⚠️ Not embedded (outside Shopify iframe)");
    return null;
  }

  // Wait until App Bridge is ready
  const start = Date.now();
  while (!getAppBridgeInstance() && Date.now() - start < timeout) {
    await new Promise((res) => setTimeout(res, 50));
  }

  return getAppBridgeInstance();
}

export async function fetchWithAuth(url, options = {}) {
  const app = await waitForAppBridge();
  if (!app) {
    console.error("❌ App Bridge not ready, cannot fetch");
    return new Response(null, { status: 401 });
  }

  try {
    const token = await getSessionToken(app);
    if (!token) throw new Error("Token not available");

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error("❌ fetchWithAuth failed:", err);
    return new Response(null, { status: 401 });
  }
}

// Optional helper to redirect safely
export function safeRedirect(url) {
  const app = getAppBridgeInstance();
  const isEmbedded = window.top !== window.self;

  if (isEmbedded && app) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
  } else {
    window.top.location.href = url;
  }
}
