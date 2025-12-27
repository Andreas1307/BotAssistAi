import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ✅ Shopify-approved: App Bridge redirect ONLY
    if (window.ShopifyAppBridge) {
      const app = window.ShopifyAppBridge.createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      });

      const Redirect = window.ShopifyAppBridge.actions.Redirect;
      const redirect = Redirect.create(app);

      redirect.dispatch(
        Redirect.Action.APP,
        `/shopify/install?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`
      );
    }
  }, []);

  return <div>Installing app…</div>;
}
