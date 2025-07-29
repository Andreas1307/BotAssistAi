export async function initShopifyAppBridge() {
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    const shop = params.get("shop");
  
    const isEmbedded = window.top !== window.self;
  
    // Only init if host & shop & embedded
    if (!isEmbedded || !host || !shop) {
      console.log("🛑 Skipping App Bridge init (not embedded or missing shop/host)");
      return null;
    }
  
    const waitForAppBridge = () =>
      new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const AppBridge = window["app-bridge"];
          if (AppBridge?.createApp) {
            clearInterval(interval);
            resolve(AppBridge);
          }
        }, 50);
        setTimeout(() => reject(new Error("App Bridge load timeout")), 5000);
      });
  
    try {
      const AppBridge = await waitForAppBridge();
      const app = AppBridge.createApp({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host,
        forceRedirect: false  // Set false to avoid nested redirect loops after OAuth
      });
      window.appBridge = app;
      console.log("✅ Shopify App Bridge initialized in frontend");
      return app;
    } catch (err) {
      console.error("🚫 Failed to init App Bridge frontend:", err);
      return null;
    }
  }
  