//loadAppBridge.js

export function loadAppBridge(callback) {
    // Already loaded?
    if (window.ShopifyAppBridge && window.ShopifyAppBridgeUtils) {
      return callback();
    }
  
    // Load main App Bridge library
    const appBridgeScript = document.createElement("script");
    appBridgeScript.src = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
  
    // Load utilities after main script
    const utilsScript = document.createElement("script");
    utilsScript.src = "https://cdn.shopify.com/shopifycloud/app-bridge-utils.js";
  
    utilsScript.onload = () => callback();
  
    document.head.appendChild(appBridgeScript);
    document.head.appendChild(utilsScript);
  }
  