export function loadAppBridge(apiKey, callback) {
    if (window.ShopifyAppBridge) {
      callback(window.ShopifyAppBridge);
    } else {
      console.error("App Bridge not found on window.");
    }
  }
  