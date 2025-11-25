import { useEffect } from "react";
import { initShopifyAppBridge, safeRedirect } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop) {
      return; // Shopify will add it automatically
    }

    (async () => {
      const app = await initShopifyAppBridge();

      if (!app) {
        safeRedirect(`${directory}/shopify/install?shop=${shop}&host=${host}`);
        return;
      }

      safeRedirect(`/${shop}/dashboard?shop=${shop}&host=${host}`);
    })();
  }, []);

  return <div>Loading Shopify App…</div>;
}
