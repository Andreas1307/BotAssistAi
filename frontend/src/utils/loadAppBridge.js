//inside loadAppBridge.js
import React from "react";

export function loadAppBridge(apiKey, callback) {
    if (window.ShopifyAppBridge && !window.appBridgeInitialized) {
      window.appBridgeInitialized = true;
      callback(window.ShopifyAppBridge);
      return;
    }
  
    const script = document.createElement("script");
    script.src = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
    script.async = true;
  
    script.onload = () => {
      window.appBridgeInitialized = true;
      callback(window.ShopifyAppBridge);
    };
  
    script.onerror = (err) => {
      console.error("Failed to load Shopify App Bridge script:", err);
    };
  
    document.head.appendChild(script);
  }
  