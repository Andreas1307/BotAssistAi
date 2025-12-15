import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (!shop) return;

    window.location.href =
      `https://api.botassistai.com/shopify/install?shop=${shop}`;
  }, []);

  return <div>Loading…</div>;
}
