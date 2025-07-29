export async function initShopifyAppBridge() {
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    const shop = params.get("shop");
  
    const isEmbedded = window.top !== window.self;
  
    if (!isEmbedded || !host || !shop) {
      console.log("🛑 Skipping App Bridge frontend init");
      return null;
    }
  
    // Wait until Shopify defined the global
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.shopify || window["app-bridge"]) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  
    const AppBridge = window.shopify || window["app-bridge"];
    const app = AppBridge.createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: false,
    });
  
    window.appBridge = app;
    console.log("✅ App Bridge initialized frontend");
    return app;
  }
  