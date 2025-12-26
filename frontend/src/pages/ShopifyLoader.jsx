import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop) return;

    // 🚨 ALWAYS force TOP LEVEL redirect
    window.top.location.href =
      `https://api.botassistai.com/shopify/install` +
      `?shop=${encodeURIComponent(shop)}` +
      (host ? `&host=${encodeURIComponent(host)}` : "");
  }, []);

  return <div>Installing BotAssistAI…</div>;
}
