import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ⬇️ LOAD APP BRIDGE SCRIPT FIRST
    const script = document.createElement("script");
    script.src = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
    script.async = true;

    script.onload = () => {
      const AppBridge = window["ShopifyAppBridge"];
      const createApp = AppBridge.createApp;
      const Redirect = AppBridge.actions.Redirect;

      const app = createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      });

      const redirect = Redirect.create(app);

      // ✅ THIS TRIGGERS INSTALL
      redirect.dispatch(
        Redirect.Action.APP,
        `/shopify/install?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`
      );
    };

    document.body.appendChild(script);
  }, []);

  return <div>Installing app…</div>;
}
