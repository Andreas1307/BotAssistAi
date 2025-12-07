import { useEffect, useState } from "react";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");
  
    if (!shop || !host) return;
  
    if (window.top !== window.self) {
      // Already embedded — do nothing
      return;
    }
  
    // Only redirect once
    if (!shop.endsWith(".myshopify.com")) return;
  
    window.top.location.href = `${directory}/shopify/force-top-level-auth?shop=${shop}&host=${host}`;
  }, []);
  
      

  return <div>Loading Shopify App…</div>;
}
