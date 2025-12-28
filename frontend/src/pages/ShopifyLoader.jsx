import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    const isInstalled = document.cookie.includes("shopify_installed=1");

    // 🚫 First install → do NOTHING
    if (!isInstalled) return;

    // ✅ Post-install iframe recovery ONLY
    if (window.top !== window.self) {
      window.top.location.href =
        `https://www.botassistai.com/shopify/dashboard?shop=${encodeURIComponent(
          shop
        )}&host=${encodeURIComponent(host)}`;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
