import { useEffect } from "react";
import directory from "../directory";

export default function ShopifyLoader() {
  useEffect(() => {
    // 🔒 Only run on the embedded app entry route
    // CHANGE THIS to match the page Shopify loads first
    if (window.location.pathname !== "/") return;

    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // 🔒 Do NOT run inside top-level browser
    if (window.top === window.self) return;

    // 🔒 Run once per session
    if (sessionStorage.getItem("shopify_iframe_escaped")) return;

    sessionStorage.setItem("shopify_iframe_escaped", "true");

    // ✅ ONLY job: escape iframe to backend OAuth entry
    window.top.location.href =
      `${directory}/shopify?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
  }, []);

  return <div>Loading app…</div>;
}
