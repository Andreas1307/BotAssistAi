import { useEffect } from "react";
import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";
import directory from "../directory";

export default function ShopifyLoader() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (!shop || !shop.endsWith(".myshopify.com")) return;

    /*
     * If inside iframe → use App Bridge redirect
     */
    if (window.top !== window.self) {
      const host = params.get("host") || btoa(`admin.shopify.com/store/${shop.replace(".myshopify.com","")}`);

      const app = createApp({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      });

      const redirect = Redirect.create(app);
      redirect.dispatch(
        Redirect.Action.REMOTE,
        `${directory}/shopify/force-top-level-auth?shop=${shop}`
      );

      return;
    }

    window.location.href = `${directory}/shopify/install?shop=${shop}`;
  }, []);

  return <div>Loading Shopify App…</div>;
}
