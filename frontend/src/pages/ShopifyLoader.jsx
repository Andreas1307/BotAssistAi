import { useEffect } from "react";
import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";
import directory from "../directory";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (!shop) return;

    // Always redirect to backend entry
    window.location.href =
      `https://api.botassistai.com/shopify?shop=${encodeURIComponent(shop)}`;
  }, []);

  return <div>Loading Shopify App…</div>;
}
