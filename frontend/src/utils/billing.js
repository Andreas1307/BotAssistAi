import { safeRedirect } from "./initShopifyAppBridge";
import directory from "../directory";
import axios from "axios";
import { fetchWithAuth } from "./initShopifyAppBridge";

export async function handleBilling(userId) {
  const host = window.shopifyAppHost;

  const res = await fetchWithAuth(`${directory}/create-subscription2`, {
    method: "POST",
    body: { userId, host },
  });

  const confirmationUrl = res?.confirmationUrl;
  if (!confirmationUrl) return console.error("No confirmation URL returned", res);

  // ✅ Redirect safely
  safeRedirect(confirmationUrl);
}
