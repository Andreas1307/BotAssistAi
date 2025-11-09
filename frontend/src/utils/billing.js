import axios from "axios";
import { safeRedirect, initShopifyAppBridge } from "./initShopifyAppBridge";
import directory from "../directory";


export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    let shop = params.get("shop");
    let host = params.get("host");

    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;

    if (!confirmationUrl) throw new Error("Missing confirmationUrl");

    // ✅ Always break out to top-level redirect.html (same origin)
    // This avoids the X-Frame-Options "deny" error completely
    window.top.location.href = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop)}&target=${encodeURIComponent(confirmationUrl)}`;
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}