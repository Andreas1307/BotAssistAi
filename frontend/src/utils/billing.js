import axios from "axios";
import { safeRedirect, initShopifyAppBridge } from "./initShopifyAppBridge";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    let shop = params.get("shop");
    let host = params.get("host");

    // Initialize App Bridge (if embedded)
    initShopifyAppBridge();

    // If shop missing, try fetching it from backend using userId
    if (!shop) {
      console.warn("⚠️ Missing shop param → fetching from backend…");
      const resShop = await axios.get(`${directory}/get-shop?userId=${userId}`);
      shop = resShop.data?.shop;
    }

    if (!shop) {
      console.error("❌ Cannot handle billing: no shop found");
      window.top.location.href = "https://botassistai.com/redirect.html";
      return;
    }

    // Create billing session
    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;

    if (!confirmationUrl) {
      console.error("❌ No confirmationUrl returned from backend", res.data);
      return;
    }

    console.log("✅ Got billing confirmation URL:", confirmationUrl);

    // Redirect safely (with guaranteed shop param)
    safeRedirect(confirmationUrl, shop);

  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
  }
}
