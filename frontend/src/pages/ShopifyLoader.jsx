import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // 🚫 DO NOTHING inside Shopify iframe
    if (window.top !== window.self) {
      console.log("[ShopifyLoader] Embedded context detected — no redirect");
      return;
    }

    // ✅ Only allow redirect when opened OUTSIDE Shopify Admin
    window.location.href =
      `/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
  }, []);

  return <div>Loading Shopify App…</div>;
}
