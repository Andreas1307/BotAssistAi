import { getAppBridgeInstance, isEmbedded, fetchWithAuth, safeRedirect } from "./initShopifyAppBridge";
import { Redirect } from "@shopify/app-bridge/actions";
import axios from "axios";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const host = window.shopifyAppHost;

    const response = await fetch(`/create-subscription2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, host }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server returned ${response.status}: ${text}`);
    }

    const data = await response.json();
    const confirmationUrl = data.confirmationUrl;

    if (!confirmationUrl) {
      console.error("No confirmation URL returned from backend", data);
      return;
    }

    // ✅ Use App Bridge to redirect safely inside Shopify iframe
    safeRedirect(confirmationUrl);

  } catch (err) {
    console.error("❌ Billing activation failed:", err.message);
  }
}