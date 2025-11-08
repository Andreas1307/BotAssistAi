import { safeRedirect } from "./initShopifyAppBridge";
import axios from "axios";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const res = await axios.post(`${directory}/create-subscription2`, { userId });
    const data = res.data;

    if (data?.confirmationUrl) {
      console.log("✅ Got billing URL:", data.confirmationUrl);
      safeRedirect(data.confirmationUrl);
    } else {
      console.error("❌ No confirmationUrl returned from backend", data);
    }
  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
  }
}
