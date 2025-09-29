import { safeRedirect } from "./initShopifyAppBridge";
import directory from "../directory";
import axios from "axios";

export async function handleBilling(userId) {
  try {
    const res = await axios.post(`${directory}/create-subscription2`, {
      userId,
    });

    const data = res.data;

    if (data?.confirmationUrl) {
      safeRedirect(data.confirmationUrl);
    } else {
      console.error("No confirmationUrl returned from backend", data);
    }
  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
  }
}
