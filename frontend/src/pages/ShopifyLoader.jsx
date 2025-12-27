import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ✅ Prevent infinite redirect loop
    if (sessionStorage.getItem("shopify_oauth_started")) {
      return;
    }

    // ✅ Escape iframe only ONCE
    if (window.top !== window.self) {
      sessionStorage.setItem("shopify_oauth_started", "true");

      window.top.location.href =
        `/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
    }
  }, []);

  return <div>Loading app…</div>;
}
