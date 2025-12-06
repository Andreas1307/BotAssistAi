import { useEffect, useState } from "react";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");
    const hostParam = params.get("host");
    const hmacParam = params.get("hmac");
  
    if (!shopParam || !hostParam) return;
  
    // Already inside Shopify admin iframe → DO NOTHING
    if (window.top !== window.self) {
      console.log("📌 In iframe, not triggering install redirect");
      return;
    }
  
    // Already returning from OAuth → DO NOTHING
    if (!hmacParam) {
      console.log("📌 No hmac, meaning Shopify already authenticated.");
      return;
    }
  
    // Prevent redirect loops caused by session tokens
    const looksLikeToken = !shopParam.endsWith(".myshopify.com");
    if (looksLikeToken) {
      console.warn("⛔ Received session token instead of shop domain. Skipping redirect.");
      return;
    }
  
    // FIRST-TIME INSTALL ONLY
    console.log("➡️ Redirecting to top level auth…");
  
    window.location.replace(
      `${directory}/shopify/force-top-level-auth?shop=${shopParam}&host=${hostParam}`
    );
  }, []);
  
      

  return <div>Loading Shopify App…</div>;
}
