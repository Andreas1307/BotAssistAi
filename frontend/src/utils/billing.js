import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { Redirect } from "@shopify/app-bridge/actions";
import { fetchWithAuth } from "./initShopifyAppBridge";

export async function handleBilling(userId) {
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");

  try {
    const res = await fetchWithAuth(`https://api.botassistai.com/create-subscription2`, {
      method: "POST",
      body: { userId, host },
    });

    if (res?.confirmationUrl) {
      console.log("✅ Billing confirmation URL:", res.confirmationUrl);

      // ✅ Use App Bridge Redirect (Shopify-safe breakout)
      const app = getAppBridgeInstance();
      if (app) {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.REMOTE, res.confirmationUrl);
      } else {
        // Fallback if AppBridge isn't ready
        window.location.assign(res.confirmationUrl);
      }
    } else {
      console.error("❌ No confirmationUrl returned:", res);
      alert("Failed to create subscription. Please try again.");
    }
  } catch (err) {
    console.error("❌ handleBilling failed:", err);
    alert("Billing setup failed. Check console for details.");
  }
}
