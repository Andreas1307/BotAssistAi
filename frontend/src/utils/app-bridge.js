import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  // Try URL first
  const params = new URLSearchParams(window.location.search);
  let shop = params.get("shop");
  let host = params.get("host");

  // Fallback to Shopify injected object
  if ((!shop || !host) && window.__SHOPIFY__) {
    shop = window.__SHOPIFY__.shop;
    host = window.__SHOPIFY__.host;
  }

  if (!shop || !host) {
    console.warn("⚠️ Not running in Shopify context. Skipping App Bridge init");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  console.log("✅ Shopify App Bridge initialized", { shop, host });
  return appInstance;
}
