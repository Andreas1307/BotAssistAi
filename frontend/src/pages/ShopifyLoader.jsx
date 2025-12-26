import { useEffect } from "react";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    const installUrl =
      `https://api.botassistai.com/shopify/install` +
      `?shop=${encodeURIComponent(shop)}` +
      `&host=${encodeURIComponent(host)}`;

    // 🔑 MUST be top-level
    if (window.top === window.self) {
      window.location.href = installUrl;
    } else {
      window.top.location.href = installUrl;
    }
  }, []);

  return <div>Installing BotAssistAI…</div>;
}
