import axios from "axios";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import directory from "../directory";

export async function handleBilling(shop) {
  try {

    const store = shop.replace(".myshopify.com", "");
    const pricingUrl = `https://admin.shopify.com/store/${store}/charges/botassistai/pricing_plans`;
    window.top.location.href = pricingUrl;


    /*
    const app = getAppBridgeInstance();

    let host;
    let confirmationUrl;

    // --------------------------
    // 🟢 CASE 1: Inside iframe
    // --------------------------
    if (app) {
      const token = await getSessionToken(app);
      const payload = JSON.parse(atob(token.split(".")[1]));

      const store = payload.dest
        .replace("https://", "")
        .split(".myshopify.com")[0];

      host = btoa(`admin.shopify.com/store/${store}`);

      const res = await axios.post(`${directory}/create-subscription2`, {
        userId,
        host,
      });

      confirmationUrl = res.data.confirmationUrl;

      const redirect = Redirect.create(app);
      return redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
    }

    // --------------------------
    // 🔴 CASE 2: NOT inside iframe
    // --------------------------
    console.warn("App Bridge unavailable → doing top-level redirect");

    const res = await axios.post(`${directory}/create-subscription2`, {
      userId,
      host: null,
    });

    confirmationUrl = res.data.confirmationUrl;

    // Shopify requires top redirect here
    window.location.href = confirmationUrl;
*/
  } catch (err) {
    console.error("Billing failed:", err);
    alert("Billing failed — check console");
  }
}
