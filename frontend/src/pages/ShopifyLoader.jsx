import { useEffect } from "react";
import directory from "../directory";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ✅ Prevent running multiple times
    if (sessionStorage.getItem("shopify_oauth_started")) return;
    sessionStorage.setItem("shopify_oauth_started", "true");

    // ✅ If inside iframe, escape to top-level
    if (window.top !== window.self) {
      window.top.location.href = `${directory}/shopify?shop=${encodeURIComponent(
        shop
      )}&host=${encodeURIComponent(host)}`;
      return;
    }

    // ✅ If already top-level, trigger App Bridge redirect
    const script = document.createElement("script");
    script.src = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
    script.async = true;

    script.onload = () => {
      const AppBridge = window["ShopifyAppBridge"];
      const createApp = AppBridge.createApp;
      const Redirect = AppBridge.actions.Redirect;

      const app = createApp({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      });

      const redirect = Redirect.create(app);

      redirect.dispatch(
        Redirect.Action.APP,
        `${directory}/shopify/install?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`
      );
    };

    document.body.appendChild(script);
  }, []);

  return <div>Installing app…</div>;
}
