import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // Build install URL
    const installUrl = `https://api.botassistai.com/shopify/install?shop=${encodeURIComponent(
      shop
    )}&host=${encodeURIComponent(host)}`;

    // Redirect top window if embedded
    if (window.top !== window.self) {
      window.top.location.href = installUrl;
    } else {
      window.location.href = installUrl;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
