export async function initShopifyAppBridge() {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");
    const embedded = window.top !== window.self;
  
    if (!embedded || !shop || !host) {
      console.log("⚠️  Not in valid embedded context — skipping App Bridge init.");
      return null;
    }
  
    // Wait until App Bridge script fully initializes
    await new Promise((resolve) => {
      const attempt = setInterval(() => {
        if (window['app-bridge']?.createApp) {
          clearInterval(attempt);
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
    console.log("✅ App Bridge initialized successfully");
    return app;
  }
  