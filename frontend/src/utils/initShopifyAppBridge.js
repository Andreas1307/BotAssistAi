import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import createApp from "@shopify/app-bridge";

function getAppBridgeGlobal() {
  return createApp;
}


function isEmbedded() {
  return window.top !== window.self;
}

export async function initShopifyAppBridge() {
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!isEmbedded() || !shop || !host) {
      console.info("ℹ️ Running outside Shopify iframe — skipping App Bridge init");
      return null;
    }

    const createApp = getAppBridgeGlobal();
    if (!createApp) return null;

    const app = createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    });

    window.appBridge = app;

    console.log("✅ Shopify App Bridge initialized");
    return app;
  } catch (err) {
    console.error("❌ Failed to init App Bridge:", err);
    return null;
  }
}

export function getAppBridgeInstance() {
  return window.appBridge || null;
}

export function safeRedirect(url) {
  const app = getAppBridgeInstance();
  if (isEmbedded() && app) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
  } else {
    window.top.location.href = url;
  }
}

export async function fetchWithAuth(url, options = {}) {
  const app = getAppBridgeInstance();

  if (!isEmbedded() || !app) {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  }

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
