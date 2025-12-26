import { useEffect } from "react";
import { safeRedirect } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop) return;

    safeRedirect(
      `${directory}/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`
    );
    

  }, []);

  return <div>Loading Shopify App…</div>;
}
