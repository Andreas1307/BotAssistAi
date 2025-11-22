import { useEffect } from "react";
import { initShopifyAppBridge, safeRedirect } from "./utils/initShopifyAppBridge";

export default function ShopifyApp() {
  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const shop = params.get("shop");
      const host = params.get("host");

      const app = await initShopifyAppBridge();
      if (!app) return;

      // After OAuth — user is logged in, backend redirect will bring them here
      safeRedirect(`/dashboard?shop=${shop}&host=${host}`);
    })();
  }, []);

  return <div>Loading...</div>;
}
