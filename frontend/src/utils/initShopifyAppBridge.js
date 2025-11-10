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

  // Restore missing params from sessionStorage
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

  if (window.top !== window.self && !host) {
    const target = `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(shop || "")}`;
    const breakout = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop || "")}&target=${encodeURIComponent(target)}`;
  
    console.log("🔁 Breaking out of iframe to:", breakout);
  
    // ✅ Fix: use App Bridge-safe redirect if embedded, else use top-level redirect via redirect.html
    if (window.ShopifyApp) {
      const redirect = window.ShopifyApp.Redirect.create(window.ShopifyApp);
      redirect.dispatch(window.ShopifyApp.Redirect.Action.REMOTE, breakout);
    } else {
      // Must be triggered from a user gesture (like a button click) — fallback
      document.body.innerHTML = `
        <div style="font-family:sans-serif;text-align:center;margin-top:30vh">
          <h3>App needs permission to open the Shopify install flow.</h3>
          <button id="continue" style="padding:10px 20px;font-size:16px;cursor:pointer">Continue</button>
        </div>`;
      document.getElementById("continue").addEventListener("click", () => {
        window.open(breakout, "_top");
      });
    }
  
    return null;
  }
  
  
  if (!host) {
    console.warn("⚠️ Missing host, cannot init App Bridge");
    return null;
  }

  // ✅ Safe to init App Bridge
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
  } else if (shop) {
    const redirectUrl = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop)}&target=${encodeURIComponent(url)}`;
    window.location.assign(redirectUrl);
  } else {
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