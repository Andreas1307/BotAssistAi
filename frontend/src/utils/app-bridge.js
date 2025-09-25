import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const params = new URLSearchParams(window.location.search);
  let shop = params.get("shop");
  let host = params.get("host");

  if ((!shop || !host) && window.__SHOPIFY__) {
    shop = window.__SHOPIFY__.shop;
    host = window.__SHOPIFY__.host;
  }

  if (!shop || !host) {
    console.warn("⚠️ Not running in Shopify context. Skipping App Bridge init");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
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

// ✅ Make sure to export safeRedirect
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
