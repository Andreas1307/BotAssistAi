import { useEffect } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { initShopifyAppBridge } from "../utils/initShopifyAppBridge";

export default function ShopifyLoader() {
  useEffect(() => {
    const app = initShopifyAppBridge();
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (!shop) {
      console.error("❌ Missing shop param");
      return;
    }

    const redirect = Redirect.create(app);

    // ✅ ALWAYS redirect — backend decides install vs dashboard
    redirect.dispatch(
      Redirect.Action.REMOTE,
      `/shopify/auth?shop=${shop}`
    );
  }, []);

  return <div>Loading Shopify App…</div>;
}
