import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import directory from "../directory";
/**
 * Detect if running inside Shopify iframe
 */



function isEmbedded() {
  try {
    return window.top !== window.self;
  } catch {
    return true;
  }
}

export async function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");
  const embedded = isEmbedded();

  window.shopifyAppHost = host;

  // 🧩 1️⃣ Case: Outside Shopify (standalone site)
  if (!embedded) {
    console.log("🌍 Running outside Shopify — App Bridge not required");
    return null;
  }

  if (embedded && !host && shop) {
    console.log("🧭 Embedded without host — requesting top-level redirect...");
  
    const app = createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host: "",
    });
    const redirect = Redirect.create(app);
  
    redirect.dispatch(
      Redirect.Action.REMOTE,
      `https://www.botassistai.com/auth.html?shop=${encodeURIComponent(shop)}`
    );
  
    return null;
  }
  

  if (embedded && host) {
    const app = createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    });
    window.appBridge = app;
    console.log("✅ Shopify App Bridge initialized successfully");
    return app;
  }

  console.warn("⚠️ Missing shop or host — skipping App Bridge init");
  return null;
}


export function getAppBridgeInstance() {
  return window.appBridge || null;
}

export function safeRedirect(url) {
  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host: window.shopifyAppHost,
  });

  const redirect = Redirect.create(app);

  // ✅ If it’s a Shopify admin URL, use App Bridge
  if (url.includes("admin.shopify.com")) {
    redirect.dispatch(Redirect.Action.REMOTE, url);
    return;
  }

  // ✅ Otherwise, normal navigation (your API/backend)
  window.location.assign(url);
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