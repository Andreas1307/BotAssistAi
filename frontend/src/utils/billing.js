import { safeRedirect } from "./initShopifyAppBridge";
import directory from "../directory";
import axios from "axios";
import { fetchWithAuth } from "./initShopifyAppBridge";

export async function handleBilling(userId) {
  const host = window.shopifyAppHost;
  console.log("💳 [handleBilling] Starting billing flow...");
  console.log("🧑‍💻 [handleBilling] userId:", userId);
  console.log("🏠 [handleBilling] host:", host);

  const res = await fetchWithAuth(`${directory}/create-subscription2`, {
    method: "POST",
    body: { userId, host },
  });

  console.log("📦 [handleBilling] Server response:", res);

  const confirmationUrl = res?.confirmationUrl;
  console.log("✅ [handleBilling] confirmationUrl:", confirmationUrl);

  if (confirmationUrl) {
    safeRedirect(confirmationUrl);
  } else {
    console.error("❌ [handleBilling] No confirmationUrl returned", res);
  }
}
