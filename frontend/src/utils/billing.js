import axios from "axios";
import { safeRedirect, initShopifyAppBridge } from "./initShopifyAppBridge";
import directory from "../directory";
import { Redirect } from "@shopify/app-bridge/actions";

export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    let shop = params.get("shop");
    let host = params.get("host");

    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;

    if (!confirmationUrl) throw new Error("Missing confirmationUrl");

    const app = window.appBridge; // initialized via initShopifyAppBridge()

    if (app && host) {
      // Embedded context — use App Bridge redirect
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
    } else {
      // Top-level context — safe redirect
      window.location.href = confirmationUrl;
    }
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}
