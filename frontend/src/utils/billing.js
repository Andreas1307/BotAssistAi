import axios from "axios";
import { safeRedirect, initShopifyAppBridge } from "./initShopifyAppBridge";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    let shop = params.get("shop");
    let host = params.get("host");

    // If shop missing, fetch it from backend (optional)
    if (!shop) {
      const resShop = await axios.get(`${directory}/get-shop?userId=${userId}`);
      shop = resShop.data?.shop;
    }

    if (!shop) {
      console.error("No shop available; aborting billing.");
      // fallback to top-level landing
      window.top.location.href = "https://botassistai.com/redirect.html";
      return;
    }

    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;

    if (!confirmationUrl) {
      console.error("No confirmationUrl returned:", res.data);
      return;
    }

    // IMPORTANT: force top-level breakout to redirect.html (same origin) which then navigates to Shopify
    window.top.location.href = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop)}&target=${encodeURIComponent(confirmationUrl)}`;
  } catch (err) {
    console.error("Billing activation failed:", err.response?.data || err.message);
  }
}
