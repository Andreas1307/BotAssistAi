import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;
console.log("Inside app-bridge.js");

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  let shop, host;

  // 1️⃣ Check query params first
  const params = new URLSearchParams(window.location.search);
  shop = params.get("shop");
  host = params.get("host");

  // 2️⃣ Fallback to embedded Shopify globals
  if ((!shop || !host) && window.__SHOPIFY__) {
    shop = window.__SHOPIFY__.shop;
    host = window.__SHOPIFY__.host;
  }

  if (!shop || !host) {
    console.warn(
      "⚠️ Not running in Shopify iframe or missing 'shop'/'host'. App Bridge will not initialize"
    );
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

export async function fetchWithAuth(url, options = {}) {
  const app = getAppBridgeInstance();
  if (!app) return fetch(url, options);

  try {
    const token = await getSessionToken(app);
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error("❌ Token error:", err);
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
