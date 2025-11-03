import { safeRedirect } from "./initShopifyAppBridge";
import directory from "../directory";
import axios from "axios";
import { fetchWithAuth } from "./initShopifyAppBridge";

export async function handleBilling(userId) {
  const host = window.shopifyAppHost; 

  const res = await fetchWithAuth(`${directory}/create-subscription2`, {
    method: "POST",
    body: { userId, host }, // pass host to backend
  });

  
  const confirmationUrl = res?.confirmationUrl;
  console.log("Redirecting to confirmation URL:", confirmationUrl);

  if (confirmationUrl) {
    safeRedirect(confirmationUrl);
  } else {
    console.error("No confirmationUrl returned", res);
  }
}