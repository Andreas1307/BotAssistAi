import { useEffect, useState } from "react";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {


      useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shopParam = params.get("shop");
        const hostParam = params.get("host");
      
        if (!shopParam || !hostParam) return;
      
        // ❗ DO NOT redirect if Shopify already injected a token
        const isToken = !shopParam.endsWith(".myshopify.com");
      
        if (isToken) {
          console.warn("❌ Shopify returned a session token, skipping redirect:", shopParam);
          return;
        }
      
        // Otherwise → do the top-level redirect ONCE
        window.location.replace(
          `${directory}/shopify/force-top-level-auth?shop=${shopParam}&host=${hostParam}`
        );
      }, []);
      

  return <div>Loading Shopify App…</div>;
}
