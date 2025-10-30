import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";
import { getShopOrigin } from "@shopify/app-bridge/utilities";

let app = null; 

function isEmbedded() {
  return window.top !== window.self;
}

export function initShopifyAppBridge() {
  if (!isEmbedded()) return null;

  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");
  const shop = params.get("shop");

  if (!host || !shop) {
    console.warn("⚠️ Missing shop or host — redirecting to backend auth");
    window.top.location.href = `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(shop)}`;
    return null;
  }

  app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  return app;
}

export function getAppBridgeInstance() {
  if (app) return app;

  const shopOrigin =
    getShopOrigin() || new URLSearchParams(window.location.search).get("shop");

  if (!shopOrigin) {
    console.warn("⚠️ No shopOrigin found for App Bridge");
    return null;
  }

  app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    shopOrigin,
    host: new URLSearchParams(window.location.search).get("host"),
    forceRedirect: true,
  });

  return app;
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
  if (!app) initShopifyAppBridge();

  let token;
  try {
    token = await getSessionToken(app); // 🔑 Always fetch fresh token
  } catch (err) {
    console.error("Failed to fetch Shopify session token:", err);
    throw err;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    },
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}