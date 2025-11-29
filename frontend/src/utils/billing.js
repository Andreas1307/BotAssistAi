import axios from "axios";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const params = new URLSearchParams(window.location.search);
    const app = getAppBridgeInstance();
    const token = await getSessionToken(app);

    // Decode host from JWT
    const payload = JSON.parse(atob(token.split(".")[1]));
    const host = payload?.dest?.split("/admin")[0].replace("https://", "");

    const res = await axios.post(`${directory}/create-subscription2`, { userId, host });
    const confirmationUrl = res.data?.confirmationUrl;
    if (!confirmationUrl) throw new Error("Missing confirmationUrl");

    const isEmbedded = window.top !== window.self;

    if (app && host) {
      // ✅ Preferred: App Bridge handles breakout correctly
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
      return;
    }

    if (isEmbedded) {
      // ✅ Force open in top window
      console.log("🪟 Forcing top-level navigation to:", confirmationUrl);
      window.open(confirmationUrl, "_top");
      return;
    }

    // ✅ Normal case (not embedded)
    window.location.href = confirmationUrl;
  } catch (err) {
    console.error("❌ Billing activation failed:", err);
    alert("Billing failed — check console for details");
  }
}
