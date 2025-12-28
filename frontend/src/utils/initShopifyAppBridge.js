import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import directory from "../directory";
/**
 * Detect if running inside Shopify iframe
 */
function isEmbedded() {
  return window.top !== window.self;
}

export function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);
  let shop = params.get("shop");
  let host = params.get("host");

  if (!shop && sessionStorage.getItem("shopify_shop")) {
    shop = sessionStorage.getItem("shopify_shop");
  } else if (shop) {
    sessionStorage.setItem("shopify_shop", shop);
  }

  if (!host && sessionStorage.getItem("shopify_host")) {
    host = sessionStorage.getItem("shopify_host");
  } else if (host) {
    sessionStorage.setItem("shopify_host", host);
  }

  // 🔹 Only break out if this is FIRST install (no host + path includes /install)
  const embedded = window.top !== window.self;
  const isInstall = window.location.pathname.includes("/shopify/install");
  if (embedded && !host && isInstall) {
    const shopParam = encodeURIComponent(shop || "");
    
    // ✅ Step 1: bounce to your top-level domain first
    const bounceUrl = `https://botassistai.com/redirect.html?shop=${shopParam}&target=${encodeURIComponent(
      `https://api.botassistai.com/shopify/top-level-auth?shop=${shopParam}`
    )}`;
  
    console.log("🪟 Breaking out of iframe safely via redirect.html:", bounceUrl);
  
    // ✅ Step 2: open bounce in top-level window
    window.open(bounceUrl, "_top");
    return null;
  }
  
  if (!host) {
    console.warn("⚠️ Missing host; waiting until host param is available");
    return null;
  }

  // ✅ Init App Bridge normally
  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  window.appBridge = app;
  console.log("✅ Shopify App Bridge initialized with host:", host);
  return app;
}

export function getAppBridgeInstance() {
  return window.appBridge || null;
}

export function safeRedirect(url, fallbackShop = null) {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop") || fallbackShop;
  const host = params.get("host");
  const app = window.appBridge;

  if (!url) return console.error("❌ safeRedirect called without URL");

  if (app && host) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
    return;
  }

  // 🪟 If still inside iframe, bounce to your top-level domain (botassistai.com)
  if (window.top !== window.self && shop) {
    const bounce = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(
      shop
    )}&target=${encodeURIComponent(url)}`;

    console.log("🪟 Opening bounce in top context:", bounce);
    window.open(bounce, "_top");
    return;
  }

  // Normal redirect
  window.location.href = url;
}

export async function fetchWithAuth(url, options = {}) {
  // 1️⃣ Try to get Shopify token if embedded
  let token = null;

  try {
    const app = getAppBridgeInstance();
    if (app) token = await getSessionToken(app);
  } catch (err) {
    console.warn("⚠️ App Bridge not initialized — cannot get JWT");
  }

  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const opts = {
    method: options.method || "GET",
    headers,
    credentials: "include",
    body:
      options.body && typeof options.body === "object" && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  };

  const fullUrl = url.startsWith("http") ? url : `${window.directory || "https://api.botassistai.com"}${url}`;

  const res = await fetch(fullUrl, opts);

  // Retry once if token expired
  if (res.status === 401 && !options._retried) {
    window.sessionToken = null;
    return fetchWithAuth(url, { ...options, _retried: true });
  }

  if (!res.ok) {
    const contentType = res.headers.get("Content-Type") || "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();
    throw new Error(`Request failed: ${res.status} ${JSON.stringify(data)}`);
  }

  return res.status === 204 ? null : await res.json();
}

function getCookie(name) {
  return document.cookie.split("; ").find(row => row.startsWith(name + "="))?.split("=")[1];
}
