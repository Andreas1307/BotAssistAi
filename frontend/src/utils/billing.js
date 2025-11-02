import { safeRedirect } from "./initShopifyAppBridge";
import directory from "../directory";
import axios from "axios";
import { fetchWithAuth } from "./initShopifyAppBridge";

export async function handleBilling(userId) {
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host"); // get host from Shopify URL

  const res = await fetchWithAuth(`${directory}/create-subscription2`, {
    method: "POST",
    body: { userId, host }, // pass host to backend
  });

  const confirmationUrl = res?.confirmationUrl;
  if (confirmationUrl) {
    safeRedirect(confirmationUrl);
  } else {
    console.error("No confirmationUrl returned", res);
  }
}
