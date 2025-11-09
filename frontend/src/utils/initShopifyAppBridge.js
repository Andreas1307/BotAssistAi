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

  // Restore from sessionStorage if missing
  if (!host && sessionStorage.getItem("shopify_host")) {
    host = sessionStorage.getItem("shopify_host");
  } else if (host) {
    sessionStorage.setItem("shopify_host", host);
  }

  if (!shop && sessionStorage.getItem("shopify_shop")) {
    shop = sessionStorage.getItem("shopify_shop");
  } else if (shop) {
    sessionStorage.setItem("shopify_shop", shop);
  }

  if (window.top !== window.self && !host) {
    // Only breakout for OAuth/install flow
    if (window.location.pathname.includes("/shopify/install")) {
      const target = `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(shop || "")}`;
      // ✅ Redirect through our own domain to break out safely
      window.location.href = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop || "")}&target=${encodeURIComponent(target)}`;
      return null;
    } else {
      console.warn("⚠️ Missing host but not install flow, skipping breakout");
      return null;
    }
  }
  
  
  
  if (!host) return null;

  // ✅ Safe to init App Bridge now
  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true, // ⚠️ <--- KEY CHANGE
  });

  window.appBridge = app;
  console.log("✅ Shopify App Bridge initialized");
  return app;
}

export function getAppBridgeInstance() {
  return window.appBridge || null;
}

export function safeRedirect(url, fallbackShop = null) {
  const app = window.appBridge;
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop") || fallbackShop;
  const host = params.get("host");

  if (!url) {
    console.error("❌ safeRedirect called without URL");
    return;
  }

  if (app && host) {
    // ✅ use App Bridge to redirect cleanly
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
  } else if (shop) {
    // ✅ route through redirect.html to escape iframe
    window.location.href = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop)}&target=${encodeURIComponent(url)}`;
  } else {
    // ✅ fallback, not top.href
    window.open(url, "_top");
  }
}

export async function fetchWithAuth(url, options = {}) {

  // 1️⃣ Always try to get or reuse a Shopify session token
  let token = window.sessionToken || null;
  try {
    const app = await getAppBridgeInstance();
    if (app) {
      token = await getSessionToken(app);
      window.sessionToken = token;
    } else {
      console.warn("⚠️ App Bridge not initialized — cannot get JWT");
    }
  } catch (err) {
    console.error("❌ Error fetching session token:", err);
  }

  // 2️⃣ Merge headers cleanly, allowing user overrides
  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 3️⃣ Automatically handle Content-Type
  const bodyIsFormData = options.body instanceof FormData;
  const bodyIsJSON = options.body && !bodyIsFormData && typeof options.body === "object";

  if (bodyIsJSON && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // 4️⃣ Build fetch options
  const opts = {
    method: options.method || "GET",
    headers,
    credentials: "include", // always send cookies
    body: bodyIsFormData
      ? options.body
      : bodyIsJSON
      ? JSON.stringify(options.body)
      : options.body, // supports text, Blob, etc.
  };

  // 5️⃣ Construct full URL (handles relative paths)
  const fullUrl = url.startsWith("http")
    ? url
    : `${window.directory || "https://api.botassistai.com"}${url}`;


  // 6️⃣ Send the request
  const res = await fetch(fullUrl, opts);

  // 7️⃣ Retry once if token expired (401)
  if (res.status === 401 && !options._retried) {
    console.warn("🔄 Token expired — refreshing App Bridge token...");
    window.sessionToken = null;
    return fetchWithAuth(url, { ...options, _retried: true });
  }

  // 8️⃣ Handle response
  let data;
  const contentType = res.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else if (contentType.includes("text/")) {
    data = await res.text();
  } else {
    data = await res.blob(); // fallback for files, images, etc.
  }

  if (!res.ok) {
    console.error("❌ Request failed:", res.status, data);
    throw new Error(`Request failed: ${res.status} ${JSON.stringify(data)}`);
  }

  console.groupEnd();
  return data;
}

function getCookie(name) {
  return document.cookie.split("; ").find(row => row.startsWith(name + "="))?.split("=")[1];
}