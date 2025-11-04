import { getAppBridgeInstance, isEmbedded, fetchWithAuth, safeRedirect } from "./initShopifyAppBridge";
import { Redirect } from "@shopify/app-bridge/actions";
import axios from "axios";
import directory from "../directory";


export async function handleBilling(userId) {
  try {
    const host = window.shopifyAppHost;
    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });

    const confirmationUrl = res.data?.confirmationUrl;
    if (!confirmationUrl) {
      console.error("No confirmation URL returned", res.data);
      return;
    }

    // Use safe redirect to escape iframe if needed
    safeRedirect(confirmationUrl);
  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
  }
}
