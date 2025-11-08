import axios from "axios";
import { safeRedirect } from "./initShopifyAppBridge";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    let host = params.get("host");
    const shop = params.get("shop");

    if (!shop) {
      console.error("❌ Cannot handle billing: missing shop in URL");
      return;
    }

    // Call backend
    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const data = res.data;

    if (!data?.confirmationUrl) {
      console.error("❌ No confirmationUrl returned from backend", data);
      return;
    }

    console.log("✅ Got billing URL:", data.confirmationUrl);

    // Ensure host is set for embedded redirect
    if (!host && window.top !== window.self) {
      // try to grab host from App Bridge if possible
      const app = window.appBridge;
      host = app?.host;
    }

    // Always pass shop + host to safeRedirect
    safeRedirect(data.confirmationUrl);

  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
  }
};

