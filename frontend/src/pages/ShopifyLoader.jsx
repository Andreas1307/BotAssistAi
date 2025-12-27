import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // If inside iframe, redirect top window
    const installUrl = `https://api.botassistai.com/shopify/install?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
    if (window.top !== window.self) {
      window.top.location.href = installUrl;
    } else {
      window.location.href = installUrl;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
