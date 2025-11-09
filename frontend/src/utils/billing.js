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
      // ✅ SAFE WAY – tell Shopify to open the confirmation URL
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
    } else {
      // ✅ Non-embedded fallback (e.g. testing outside Shopify)
      window.location.href = confirmationUrl;
    }
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}