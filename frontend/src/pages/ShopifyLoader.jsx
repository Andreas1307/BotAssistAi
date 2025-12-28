import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // 🔑 Only escape iframe, do NOT force OAuth blindly
    if (window.top !== window.self) {
      window.top.location.href =
        `https://api.botassistai.com/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
