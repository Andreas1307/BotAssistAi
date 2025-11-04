import { getAppBridgeInstance, isEmbedded, fetchWithAuth } from "./initShopifyAppBridge";
import { Redirect } from "@shopify/app-bridge/actions";
import axios from "axios";
import directory from "../directory";

function redirectToShopify(url) {
  const app = getAppBridgeInstance();
  if (isEmbedded() && app) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
  } else {
    // Outside iframe, normal navigation works
    window.location.href = url;
  }
}

export async function handleBilling(userId) {
  try {
    const res = await fetchWithAuth(`${directory}/create-subscription2`, { 
      method: "POST",
      body: { userId }
     });
    const confirmationUrl = res.confirmationUrl;

    if (!confirmationUrl) {
      console.error("No confirmation URL returned from backend", res.data);
      return;
    }

    redirectToShopify(confirmationUrl);
  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
  }
}
