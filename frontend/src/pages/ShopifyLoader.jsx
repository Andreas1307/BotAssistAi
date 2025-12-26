import { useEffect } from "react";
import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";

export default function ShopifyLoader() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    if (!shop || !host) return;

    // ✅ MUST initialize App Bridge here
    const app = createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    });

    // 🔁 Kick off install ONLY if needed
    const redirect = Redirect.create(app);
    redirect.dispatch(
      Redirect.Action.REMOTE,
      `https://api.botassistai.com/shopify/install?shop=${encodeURIComponent(
        shop
      )}&host=${encodeURIComponent(host)}`
    );
  }, []);

  return <div>Installing BotAssistAI…</div>;
}
