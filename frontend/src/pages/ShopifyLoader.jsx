import { useEffect } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { initShopifyAppBridge } from "../utils/initShopifyAppBridge";

export default function ShopifyLoader() {
  useEffect(() => {
    const app = initShopifyAppBridge();
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (!shop) return;

    const redirect = Redirect.create(app);

    // ✅ Always let backend decide install vs dashboard
    redirect.dispatch(
      Redirect.Action.REMOTE,
      `/shopify/install?shop=${shop}`
    );
  }, []);

  return <div>Loading Shopify App…</div>;
}
