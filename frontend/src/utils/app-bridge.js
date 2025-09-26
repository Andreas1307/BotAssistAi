import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const params = new URLSearchParams(window.location.search);
  let shop = params.get("shop");
  let host = params.get("host");

  // Save to localStorage if present
  if (shop) localStorage.setItem("shop", shop);
  if (host) localStorage.setItem("host", host);

  // Fallback to stored values
  shop = shop || localStorage.getItem("shop");
  host = host || localStorage.getItem("host");

  if (!shop || !host) {
    console.warn("⚠️ Missing Shopify shop or host — App Bridge cannot initialize");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host, // Shopify wants the Base64-encoded host string
    forceRedirect: window.top !== window.self,
  });

  console.log("✅ Shopify App Bridge initialized", { shop, host });
  return appInstance;
}

export async function fetchWithAuth(url, options = {}) {
  const app = getAppBridgeInstance();
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
