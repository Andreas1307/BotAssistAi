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

    const app = window.appBridge;

    if (app && host) {
      // ✅ Use Shopify App Bridge Redirect — safest method
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
      return;
    }

    // Fallback (not embedded)
    const redirectUrl = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(
      shop
    )}&target=${encodeURIComponent(confirmationUrl)}`;

    window.location.href = redirectUrl;
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}