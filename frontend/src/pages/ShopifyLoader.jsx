import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ✅ REQUIRED: escape iframe FIRST
    if (window.top !== window.self) {
      window.top.location.href =
        `/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
    }
  }, []);

  return <div>Loading app…</div>;
}
