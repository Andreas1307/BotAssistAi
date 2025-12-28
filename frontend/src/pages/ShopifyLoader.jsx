import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    const installUrl = `https://api.botassistai.com/shopify?shop=${encodeURIComponent(
      shop
    )}&host=${encodeURIComponent(host)}`;

    // ✅ Always escape iframe
    if (window.top !== window.self) {
      window.top.location.href = installUrl;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
