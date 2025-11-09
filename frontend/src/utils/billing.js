import axios from "axios";
import { safeRedirect, initShopifyAppBridge } from "./initShopifyAppBridge";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;
    if (!confirmationUrl) throw new Error("Missing confirmationUrl");

    // ✅ Always break out to top-level page on same domain
    const redirectUrl = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(
      shop
    )}&target=${encodeURIComponent(confirmationUrl)}`;

    // Always redirect the top-level window
    if (window.top === window.self) {
      // Not embedded — safe to navigate directly
      window.location.href = redirectUrl;
    } else {
      // Embedded — escape the iframe to top-level redirect page
      window.top.location.assign(redirectUrl);
    }
  } catch (err) {
    console.error("Billing activation failed:", err);
  }
}