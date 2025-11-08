// billing.js
import axios from "axios";
import { safeRedirect, initShopifyAppBridge, isEmbedded } from "./initShopifyAppBridge";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    let params = new URLSearchParams(window.location.search);
    let shop = params.get("shop");
    let host = params.get("host");

    // Initialize App Bridge if embedded
    initShopifyAppBridge();

    // If shop is missing → redirect to get it
    if (!shop) {
      console.error("❌ Cannot handle billing: missing shop in URL → redirecting to top-level");
      window.top.location.href = `https://botassistai.com/redirect.html`;
      return;
    }

    // Call backend
    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;

    if (!confirmationUrl) {
      console.error("❌ No confirmationUrl returned from backend", res.data);
      return;
    }

    console.log("✅ Got billing URL:", confirmationUrl);

    // Redirect safely
    safeRedirect(confirmationUrl);

  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
  }
}
