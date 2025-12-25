import { useEffect } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { initShopifyAppBridge } from "../utils/initShopifyAppBridge";

export default function ShopifyLoader() {
  useEffect(() => {
    const app = initShopifyAppBridge();
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    const redirect = Redirect.create(app);

    // ✅ Let backend decide install vs dashboard
    redirect.dispatch(
      Redirect.Action.REMOTE,
      `/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`
    );
  }, []);

  return <div>Loading Shopify App…</div>;
}
