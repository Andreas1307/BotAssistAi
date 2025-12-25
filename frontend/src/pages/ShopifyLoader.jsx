import { useEffect } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { initShopifyAppBridge } from "../utils/initShopifyAppBridge"

export default function ShopifyLoader() {
  useEffect(() => {
    const app = initShopifyAppBridge();
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (window.__NEEDS_INSTALL__ === true && shop) {
      const redirect = Redirect.create(app);
      redirect.dispatch(
        Redirect.Action.REMOTE,
        `/shopify/install?shop=${shop}`
      );
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
