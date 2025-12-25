import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ✅ Force top-level redirect for install or dashboard
    const targetUrl = `/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
    
    if (window.top !== window.self) {
      window.top.location.href = targetUrl; // top-level required for OAuth
    } else {
      window.location.href = targetUrl;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
