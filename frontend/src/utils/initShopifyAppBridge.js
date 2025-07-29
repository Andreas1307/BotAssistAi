// initShopifyAppBridge.js

export async function initShopifyAppBridge() {
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    const shop = params.get("shop");
    const hmac = params.get("hmac");
  
    // Check if app is embedded inside Shopify Admin iframe
    const isEmbedded = window.top !== window.self;
  
    // We need host and shop params and app must be embedded to init App Bridge
    if (!host || !shop || !isEmbedded) {
      console.log("🛑 App Bridge init skipped. Not embedded or missing host/shop");
      return null;
    }
  
    // Wait for the App Bridge script to load
    const waitForAppBridge = () =>
      new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const AppBridge = window["app-bridge"];
          if (AppBridge?.createApp || AppBridge?.default) {
            clearInterval(interval);
            resolve(AppBridge);
          }
        }, 50);
        setTimeout(() => reject(new Error("App Bridge load timeout")), 5000);
      });
  
    try {
      const AppBridge = await waitForAppBridge();
      const createAppFn = AppBridge.createApp || AppBridge.default;
  
      const app = createAppFn({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host,
        forceRedirect: true, // required for production embedded apps
      });
  
      window.appBridge = app;
      console.log("✅ Shopify App Bridge initialized");
  
      // Return the app instance for further use if needed
      return app;
    } catch (err) {
      console.error("🚫 App Bridge init failed:", err);
      return null;
    }
  }
  