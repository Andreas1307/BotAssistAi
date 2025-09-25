import createApp from "@shopify/app-bridge";

export async function initShopifyAppBridge() {
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");
    const embedded = params.get("embedded");

    if (!embedded || !shop || !host) {
      console.warn("⚠️ Not embedded or missing 'shop'/'host' params — skipping App Bridge init");
      return null;
    }

    const app = createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY, // ✅ must be defined in .env
      host,
      forceRedirect: true, // ✅ ensures it stays in the iframe
    });

    window.appBridge = app;
    console.log("✅ Shopify App Bridge initialized");
    return app;
  } catch (err) {
    console.error("❌ Failed to init App Bridge:", err);
    return null;
  }
}
