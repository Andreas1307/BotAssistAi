import axios from "axios";
import { safeRedirect, initShopifyAppBridge, getAppBridgeInstance } from "./initShopifyAppBridge";
import directory from "../directory";

import { Redirect } from "@shopify/app-bridge/actions";

export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;
    if (!confirmationUrl) throw new Error("Missing confirmationUrl");

    const app = getAppBridgeInstance();

    if (app && host) {
      // ✅ Inside Shopify iframe → use App Bridge redirect
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
      return;
    }

    // 🪟 Embedded but AppBridge failed → use breakout message
    const embedded = window.top !== window.self;
    if (embedded && shop) {
      const target = encodeURIComponent(confirmationUrl);
      const bounceUrl = `https://api.botassistai.com/shopify/bounce?shop=${encodeURIComponent(shop)}&target=${target}`;

      console.log("🪟 Sending breakout request for billing:", bounceUrl);
      window.parent.postMessage(
        { type: "botassistai_redirect", target: bounceUrl },
        "*"
      );
      return;
    }

    // ✅ Outside iframe → direct navigation
    window.location.href = confirmationUrl;
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}
