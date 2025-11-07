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

function getShopFromHost(host) {
  try {
    const decoded = atob(host);
    const params = new URLSearchParams(decoded);
    return params.get("shop");
  } catch {
    return null;
  }
}

export async function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);

  let shop = params.get("shop");
  const host = params.get("host");

  // ✅ If Shopify didn't provide ?shop=, extract from host
  if (!shop && host) {
    shop = getShopFromHost(host);
  }

  if (!shop) return null;

  if (isEmbedded() && !host) {
    const breakoutUrl = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop)}`;

    document.body.innerHTML = `
      <div style="text-align:center;margin-top:30vh;font-family:sans-serif">
        <h3>BotAssistAI needs permission to continue</h3>
        <p>Click below to finish authentication.</p>
        <button id="continue" style="padding:10px 18px;font-size:16px;border-radius:8px;cursor:pointer">Continue</button>
      </div>
    `;

    document.getElementById("continue").onclick = () => {
      window.open(breakoutUrl, "_top");
    };

    return null;
  }

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

export function breakoutTo(url) {
  // Create an intermediate HTML page so we never touch window.top directly
  const redirectPage = `https://botassistai.com/redirect.html?target=${encodeURIComponent(url)}`;

  // Always open it by user gesture if possible
  const openInTop = () => {
    window.open(redirectPage, "_top");
  };

  // If this function is called automatically (no user click),
  // fall back to App-Bridge redirect instead of touching window.top.
  try {
    const app = getAppBridgeInstance();
    if (app) {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, redirectPage);
    } else {
      // last-chance fallback
      openInTop();
    }
  } catch (e) {
    openInTop();
  }
}

export function safeRedirect(url) {
  const embedded = isEmbedded();
  const isAdmin = url.includes("admin.shopify.com");

  try {
    const app = getAppBridgeInstance();

    // ✅ Use App Bridge Redirect (this is the official safe way)
    if (app) {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, url);
      return;
    }

    // ✅ Fallback: open via breakout page (never window.top directly)
    if (embedded) {
      const breakoutUrl = `https://botassistai.com/redirect.html?target=${encodeURIComponent(url)}`;
      window.open(breakoutUrl, "_top");
      return;
    }

    // ✅ Only use normal redirect when outside Shopify iframe
    window.location.href = url;
  } catch (err) {
    console.error("❌ safeRedirect failed:", err);
    // last resort fallback
    window.open(`https://botassistai.com/redirect.html?target=${encodeURIComponent(url)}`, "_top");
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