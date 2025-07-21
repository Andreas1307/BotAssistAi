 // utils/loadShopifyAppBridge.js
export async function loadShopifyAppBridgeScripts(timeout = 15000) {
    const injectScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve(); // Already loaded
  
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
  
    await Promise.race([
      Promise.all([
        injectScript("https://cdn.shopify.com/shopifycloud/app-bridge.js"),
        injectScript("https://cdn.shopify.com/shopifycloud/app-bridge-utils.js"),
      ]),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("App Bridge scripts timed out")), timeout)
      ),
    ]);
  }
  