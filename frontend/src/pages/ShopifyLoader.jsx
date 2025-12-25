import { useEffect } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { initShopifyAppBridge } from "../utils/initShopifyAppBridge"

export default function ShopifyLoader() {
  useEffect(() => {
    const app = initShopifyAppBridge();
    if (!app) return;
  
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");
  
    if (!shop) return;
  
    const redirect = Redirect.create(app);
    redirect.dispatch(
      Redirect.Action.REMOTE,
      `https://api.botassistai.com/shopify/install?shop=${shop}&host=${host}`
    );
  }, []);
  return <div>Loading Shopify App…</div>;
}
