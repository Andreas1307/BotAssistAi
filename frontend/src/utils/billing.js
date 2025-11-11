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
      // ✅ Inside Shopify iframe → use App Bridge redirect (preferred)
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
      return;
    }

    const embedded = window.top !== window.self;

    if (embedded && shop) {
      // 🪟 Step through a same-origin redirect.html on botassistai.com
      const target = encodeURIComponent(confirmationUrl);
      const safeBounce = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop)}&target=${target}`;

      console.log("🪟 Embedded breakout via redirect.html →", safeBounce);
      window.location.assign(safeBounce);
      return;
    }

    // ✅ Outside iframe (normal browser tab)
    window.location.href = confirmationUrl;
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}
