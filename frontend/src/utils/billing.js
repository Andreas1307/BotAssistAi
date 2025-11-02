import { safeRedirect } from "./initShopifyAppBridge";
import directory from "../directory";
import axios from "axios";
import { fetchWithAuth } from "./initShopifyAppBridge";

export async function handleBilling(userId) {
  try {
    const res = await fetchWithAuth(`${directory}/create-subscription2`, {
      method: "POST",
      body: { userId },
    });

    const confirmationUrl = res?.confirmationUrl;
    if (confirmationUrl) {
      safeRedirect(confirmationUrl); // 🔹 THIS WORKS
    } else {
      console.error("No confirmationUrl returned", res);
    }
  } catch (err) {
    console.error("Billing activation failed:", err.message);
  }
}
