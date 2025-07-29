export async function initShopifyAppBridge() {
    const isEmbedded = window.top !== window.self;
  
    if (!isEmbedded) {
      console.log("🛑 Not in embedded context – skipping App Bridge init");
      return null;
    }
  
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    const shop = params.get("shop");
  
    if (!host || !shop) {
      console.log("🛑 Missing host/shop in URL – app won't initialize properly");
      return null;
    }
  
    // Wait for App Bridge to load (since we deferred it)
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
    console.log("✅ App Bridge initialized");
    return app;
  }
  