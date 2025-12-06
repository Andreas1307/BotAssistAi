import { useEffect, useState } from "react";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");
    const hostParam = params.get("host");
    const hmacParam = params.get("hmac");
  
    // 1. Missing params → stop
    if (!shopParam || !hostParam) {
      console.warn("🚫 Missing shop or host");
      return;
    }
  
    // 2. Inside Shopify iframe → NEVER redirect
    if (window.top !== window.self) {
      console.log("📌 Inside iframe → skipping top-level redirect");
      return;
    }
  
    // 3. Validate shop domain
    const validShopRegex = /^[a-z0-9-]+\.myshopify\.com$/i;
    const isValidShop = validShopRegex.test(shopParam);
  
    if (!isValidShop) {
      console.warn(`⛔ Invalid shop param (likely a session token): ${shopParam}`);
      return;
    }
  
    // 4. If already returned from OAuth (no hmac), do NOT redirect again
    if (!hmacParam) {
      console.log("📌 No HMAC → already authenticated once, skipping redirect");
      return;
    }
  
    // 5. First-time install → redirect
    console.log("➡️ Redirecting to top-level OAuth…");
  
    window.location.replace(
      `${directory}/shopify/force-top-level-auth?shop=${shopParam}&host=${hostParam}`
    );
  }, []); 
      

  return <div>Loading Shopify App…</div>;
}
