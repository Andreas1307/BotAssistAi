import { useEffect } from "react";
import directory from "../directory";

export default function ShopifyLoader() {
  useEffect(() => {
    const { pathname, search } = window.location;

    // ❌ Never run during OAuth or backend routes
    if (
      pathname.startsWith("/shopify") ||
      pathname.includes("callback") ||
      pathname.includes("install")
    ) {
      return;
    }

    const params = new URLSearchParams(search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ❌ Already top-level → do nothing
    if (window.top === window.self) return;

    // ❌ Prevent loop
    if (sessionStorage.getItem("shopify_oauth_started")) return;

    sessionStorage.setItem("shopify_oauth_started", "true");

    // ✅ Escape iframe to Shopify auth entry
    window.top.location.href =
      `${directory}/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
  }, []);

  return <div>Loading app…</div>;
}
