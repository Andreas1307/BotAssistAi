import { useEffect } from "react";
import directory from "../directory";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ✅ Only escape once per session
    if (!sessionStorage.getItem("shopify_oauth_started") && window.top !== window.self) {
      sessionStorage.setItem("shopify_oauth_started", "true");

      // ✅ Escape iframe to backend OAuth entry
      window.top.location.href = `${directory}/shopify?shop=${encodeURIComponent(
        shop
      )}&host=${encodeURIComponent(host)}`;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
