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
  if (window.top === window.self) return null;

  const host = new URLSearchParams(window.location.search).get("host");
  if (!host) return null;

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  window.appBridge = app;
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


  // Normal redirect
  window.location.href = url;
}

export async function fetchWithAuth(url, options = {}) {

  // 1️⃣ Always try to get or reuse a Shopify session token
  let token = window.sessionToken || null;
  try {
    const app = await getAppBridgeInstance();
    if (app) {
      token = await getSessionToken(window.appBridge);
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

  // 7b️⃣ If still 401 after retry → trigger OAuth re-auth
if (res.status === 401) {
  console.warn("❌ Still unauthorized after retry — forcing Shopify re-auth");

  const app = getAppBridgeInstance();
  if (app) {
    const redirect = Redirect.create(app);

    // Extract shop from token
    let shopFromToken = null;
    try {
      const token = await getSessionToken(window.appBridge);
      const payload = JSON.parse(atob(token.split(".")[1]));
      shopFromToken = payload.dest
        .replace("https://", "")
        .replace("/admin", "");
    } catch (e) {
      console.warn("⚠️ Could not parse JWT for shop", e);
    }

    redirect.dispatch(
      Redirect.Action.APP,
      `/shopify/auth?shop=${shopFromToken}`
    );

    return;
  }

  // fallback: hard redirect
  window.top.location.href = `/shopify/auth`;
  return;
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
