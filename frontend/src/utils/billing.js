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
      // ✅ Use App Bridge redirect inside iframe
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
    } else {
      // ✅ Fallback outside iframe
      window.top.location.href = confirmationUrl; // instead of redirect.html
    }
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}
