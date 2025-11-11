import axios from "axios";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { Redirect } from "@shopify/app-bridge/actions";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");

    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;
    if (!confirmationUrl) throw new Error("Missing confirmationUrl");

    const app = getAppBridgeInstance();

    // ✅ Case 1: inside iframe with working App Bridge
    if (app && host) {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
      return;
    }

    // ✅ Case 2: inside iframe, but App Bridge didn’t initialize
    const embedded = window.top !== window.self;
    if (embedded && shop) {
      const target = encodeURIComponent(confirmationUrl);

      // 🔹 We go through botassistai.com (not api.botassistai.com)
      const safeRedirect = `https://botassistai.com/redirect.html?shop=${encodeURIComponent(shop)}&target=${target}`;

      console.log("🪟 Redirecting via redirect.html →", safeRedirect);
      window.location.assign(safeRedirect);
      return;
    }

    // ✅ Case 3: outside Shopify admin
    window.location.href = confirmationUrl;
  } catch (err) {
    console.error("❌ Billing activation failed:", err);
    alert("Billing failed — check console for details");
  }
}
