import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (!shop) return;

    const installUrl = `https://api.botassistai.com/shopify?shop=${encodeURIComponent(shop)}`;

    if (window.top !== window.self) {
      window.top.location.href = installUrl;
    } else {
      window.location.href = installUrl;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
