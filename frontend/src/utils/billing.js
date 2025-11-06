import { fetchWithAuth, safeRedirect } from "./initShopifyAppBridge";
import directory from "../directory";
import axios from "axios";

export async function handleBilling(userId) {
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");

  try {
    // 🔹 fetchWithAuth already returns the JSON body (not { data })
    const res = await fetchWithAuth(`${directory}/create-subscription2`, {
      method: "POST",
      body: { userId, host },
    });

    // res === { confirmationUrl: "https://..." } or { errors: [...] }
    if (res?.confirmationUrl) {
      safeRedirect(res.confirmationUrl);
    } else {
      console.error("❌ No confirmationUrl returned from backend", res);
      alert("Failed to create subscription. Please try again or contact support.");
    }
  } catch (err) {
    console.error("❌ Billing activation failed:", err);
  }
}