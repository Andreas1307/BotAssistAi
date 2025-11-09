import axios from "axios";
import { safeRedirect, initShopifyAppBridge } from "./initShopifyAppBridge";
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
      // ✅ Use App Bridge Redirect — safe for embedded apps
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
    } else {
      // Non-embedded fallback
      const redirectUrl = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(
        shop
      )}&target=${encodeURIComponent(confirmationUrl)}`;
      window.location.href = redirectUrl;
    }
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}