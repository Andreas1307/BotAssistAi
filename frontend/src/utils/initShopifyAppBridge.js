export async function initShopifyAppBridge() {
    const isEmbedded = window.top !== window.self;
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    const shop = params.get("shop");
  
    if (!isEmbedded || !host || !shop) {
      console.log("🛑 Skipping App Bridge init (not embedded or missing host/shop)");
      return null;
    }
  
    // Wait until AppBridge is defined
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
      forceRedirect: false,
    });
  
    window.appBridge = app;
    console.log("✅ Shopify App Bridge initialized");
    return app;
  }
  