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

  if (!shop) return null;

  if (isEmbedded() && !host) {
    const breakoutUrl = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop)}`;
  
    // Replace page content with a manual button prompt
    document.body.innerHTML = `
      <div style="text-align:center;margin-top:30vh;font-family:sans-serif">
        <h3>BotAssistAI needs permission to continue</h3>
        <p>Click below to finish authentication.</p>
        <button id="continue" 
          style="padding:10px 18px;font-size:16px;border-radius:8px;cursor:pointer">
          Continue
        </button>
      </div>`;
      
    document.getElementById("continue").addEventListener("click", () => {
      // ✅ Works because it's inside a user gesture
      window.open(breakoutUrl, "_top");
    });
    
    return null;
  }
  
  return createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });
}


export function getAppBridgeInstance() {
  return window.appBridge || null;
}

export function safeRedirect(url) {
  const app = getAppBridgeInstance();
  const embedded = isEmbedded();

  try {
    // 1️⃣ Inside Shopify iframe → use App Bridge for Shopify/admin URLs
    if (embedded && app && (url.includes("admin.shopify.com") || url.includes("/apps/"))) {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, url);
      return;
    }

    // 2️⃣ Inside iframe but external URL (your API or site) → breakout page
    if (embedded && !url.includes("admin.shopify.com")) {
      const breakoutUrl = `https://botassistai.com/redirect.html?target=${encodeURIComponent(url)}`;
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, breakoutUrl);
      return;
    }

    // 3️⃣ Outside Shopify → normal redirect
    window.location.assign(url);
  } catch (err) {
    console.error("❌ safeRedirect failed:", err);
    window.location.assign(url);
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