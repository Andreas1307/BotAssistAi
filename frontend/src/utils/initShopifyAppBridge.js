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
/**
 * Initializes Shopify App Bridge safely.
 * - Skips if not embedded or missing params
 * - Avoids noisy Web Vitals errors
 */
export async function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");

  console.log("🧭 [initShopifyAppBridge] Params →", { shop, host });
  console.log("🪞 Embedded check:", isEmbedded());

  if (!shop) {
    console.error("❌ Missing 'shop' param, cannot init App Bridge");
    return null;
  }

  // Handle first load or missing host param
  if (!isEmbedded() || !host) {
    console.warn("⚠️ Not embedded or missing host — redirecting to top-level auth");

    // Top-level redirect (allowed)
    if (window.top === window.self) {
      const redirectUrl = `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(shop)}`;
      console.log("🔁 Top-level redirect to:", redirectUrl);
      window.location.href = redirectUrl;
    } else {
      // Embedded case → use App Bridge redirect
      console.log("🧭 Inside iframe — using App Bridge Redirect to auth");
      const app = createApp({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host: host || "",
      });
      const redirect = Redirect.create(app);
      redirect.dispatch(
        Redirect.Action.REMOTE,
        `https://api.botassistai.com/shopify/auth?shop=${encodeURIComponent(shop)}`
      );
    }
    return null;
  }

  // Initialize App Bridge
  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  window.appBridge = app;
  console.log("✅ App Bridge initialized for", shop);
  return app;
}

/**
 * Returns existing App Bridge instance if available
 */
export async function getAppBridgeInstance() {
  if (window.appBridge) return window.appBridge;

  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");
  const apiKey = process.env.REACT_APP_SHOPIFY_API_KEY;

  console.log("🧩 [getAppBridgeInstance] →", { host, apiKey });

  if (!isEmbedded() || !host) {
    console.warn("⚠️ Not embedded or missing host — returning null");
    return null;
  }

  const app = createApp({ apiKey, host, forceRedirect: true });
  window.appBridge = app;
  console.log("✅ Created new App Bridge instance");
  return app;
}

/**
 * Safe redirect (embedded or standalone)
 */
export function safeRedirect(url) {
  console.log("🚀 [safeRedirect] Redirecting to:", url);

  const app = window.appBridge;

  if (isEmbedded() && app) {
    console.log("🧭 Inside iframe — using App Bridge redirect");
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
  } else {
    console.log("🌍 Outside iframe — using window.top.location.href");
    window.top.location.href = url;
  }
}

/**
 * Fetch with App Bridge auth token if inside Shopify
 * Falls back to plain fetch when running standalone
 */
export async function fetchWithAuth(url, options = {}) {
  console.group("🧩 [fetchWithAuth]");
  console.log("➡️ URL:", url);
  console.log("🧾 Options:", options);

  let token = null;

  try {
    const app = await getAppBridgeInstance();
    if (app) {
      console.log("🪄 Requesting Shopify session token via App Bridge...");
      token = await getSessionToken(app);
      console.log("✅ Received Shopify session JWT:", token ? token.slice(0, 25) + "..." : "(none)");
      window.sessionToken = token;
    } else {
      console.warn("⚠️ App Bridge not initialized — cannot get JWT");
    }
  } catch (err) {
    console.error("❌ Error getting session token:", err);
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const opts = {
    method: options.method || "GET",
    headers,
    credentials: "include",
  };

  if (options.body) {
    opts.body =
      typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  const fullUrl = url.startsWith("http")
    ? url
    : `${window.directory || "https://api.botassistai.com"}${url}`;

  console.log("🌐 Fetching:", fullUrl, "\n🧾 Headers:", headers);

  const res = await fetch(fullUrl, opts);

  console.log("📥 Response Status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Request failed:", res.status, text);
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  try {
    const json = await res.json();
    console.log("✅ JSON Response:", json);
    console.groupEnd();
    return json;
  } catch {
    console.warn("⚠️ No JSON body in response");
    console.groupEnd();
    return null;
  }
}

function getCookie(name) {
  return document.cookie.split("; ").find(row => row.startsWith(name + "="))?.split("=")[1];
}