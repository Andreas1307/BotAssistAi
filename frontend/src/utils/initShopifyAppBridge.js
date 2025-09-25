export async function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");
  const embedded = params.get("embedded");

  if (!embedded || !shop || !host) {
    console.warn("⚠️ Not embedded or missing 'shop'/'host' params — skipping App Bridge init");
    return null;
  }

  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window["app-bridge"]?.createApp) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });

  const AppBridge = window["app-bridge"];
  const app = AppBridge.createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true, // 👈 force redirect into iframe if needed
  });

  window.appBridge = app;
  console.log("✅ Shopify App Bridge initialized");
  return app;
}
