export async function initShopifyAppBridge() {
    const { shop, host, embedded } = window.__SHOPIFY__ || {};
  
    if (!embedded || !shop || !host) {
      console.warn("⚠️ Not embedded or missing 'shop'/'host' params — skipping App Bridge init");
      return null;
    }
  
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window['app-bridge']?.createApp) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  
    const AppBridge = window['app-bridge'];
    const app = AppBridge.createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY, // Make sure this is available at build time
      host,
      forceRedirect: false,
    });
  
    window.appBridge = app;
    console.log("✅ Shopify App Bridge initialized");
    return app;
  }
  