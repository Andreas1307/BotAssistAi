import { useEffect } from "react";
import directory from "../directory";

export default function ShopifyLoader() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop) return; // shop is the only required param

    // If already embedded, DO NOTHING
    if (window.top !== window.self) return;

    // Redirect only if it's a real shop domain
    if (!shop.endsWith(".myshopify.com")) return;

    // Host may be missing — that's fine
    const url = `${directory}/shopify/force-top-level-auth?shop=${shop}`;
    window.top.location.href = url;

  }, []);

  return <div>Loading Shopify App…</div>;
}
