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
    const host = window.shopifyAppHost; // ✅ pass host
    const res = await fetchWithAuth(`${directory}/create-subscription2`, {
      method: "POST",
      body: { userId, host }
    });

    const confirmationUrl = res.confirmationUrl;
    if (!confirmationUrl) return console.error("No confirmation URL returned", res);

    safeRedirect(confirmationUrl);
  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
  }
}
