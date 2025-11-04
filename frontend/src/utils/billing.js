import { getAppBridgeInstance, isEmbedded, fetchWithAuth, safeRedirect } from "./initShopifyAppBridge";
import { Redirect } from "@shopify/app-bridge/actions";
import axios from "axios";
import directory from "../directory";


export async function handleBilling(userId) {
  try {
    const host = window.shopifyAppHost;
    const res = await fetch(`${directory}/create-subscription2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, host }),
    }).then(r => r.json());

    const confirmationUrl = res.confirmationUrl;
    if (!confirmationUrl) {
      console.error("No confirmation URL returned", res);
      return;
    }

    // ✅ Use App Bridge safe redirect
    safeRedirect(confirmationUrl);
  } catch (err) {
    console.error("❌ Billing activation failed:", err.message);
  }
} 