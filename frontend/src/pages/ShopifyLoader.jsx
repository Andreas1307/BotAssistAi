import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop) return;

    
      window.location.href = `https://api.botassistai.com/shopify/install?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
    
  }, []);

  return <div>Loading Shopify App…</div>;
}
