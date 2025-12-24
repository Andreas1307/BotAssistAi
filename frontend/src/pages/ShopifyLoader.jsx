import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    // ❗ DO NOTHING unless explicitly installing
    if (!shop || !host) {
      console.log("ℹ️ No shop/host — staying on page");
      return;
    }

    // ❗ Only redirect if user clicked "Connect Shopify"
    if (params.get("install") === "1") {
      const url = `https://api.botassistai.com/shopify/install?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;

      if (window.top !== window.self) {
        window.top.location.href = url;
      } else {
        window.location.href = url;
      }
    }
  }, []);

  return <div>Loading…</div>;
}
