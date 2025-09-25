import createApp from "@shopify/app-bridge";

export function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");

  if (!shop || !host) {
    console.warn("⚠️ Not embedded or missing 'shop'/'host' params — skipping App Bridge init");
    return null;
  }

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  console.log("✅ Shopify App Bridge initialized");
  return app;
}
