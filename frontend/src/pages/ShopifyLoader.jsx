import { useEffect } from "react";
import directory from "../directory"; // your backend base URL

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // Only run on first embedded entry
    if (window.top !== window.self && !sessionStorage.getItem("shopify_oauth_started")) {
      sessionStorage.setItem("shopify_oauth_started", "true");

      // Redirect top window to start OAuth
      window.top.location.href = `${directory}/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
      return;
    }

    // Only trigger App Bridge redirect if top-level and not in OAuth already
    if (window.top === window.self && !sessionStorage.getItem("shopify_oauth_started")) {
      sessionStorage.setItem("shopify_oauth_started", "true");

      const installUrl = `${directory}/shopify/install?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
      window.location.href = installUrl;
    }
  }, []);

  return <div>Loading Shopify App…</div>;
}
