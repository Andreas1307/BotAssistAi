import createApp from "@shopify/app-bridge";

export async function initShopifyAppBridge() {
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get("shop");
  const host = urlParams.get("host");

  // If not embedded, this will be empty
  const embedded = !!host;

  if (!embedded || !shop || !host) {
    console.warn("⚠️ Not embedded or missing 'shop'/'host' params — skipping App Bridge init");
    return null;
  }

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true, // usually true inside embedded apps
  });

  window.appBridge = app;
  console.log("✅ Shopify App Bridge initialized");
  return app;
}
