import axios from "axios";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const app = getAppBridgeInstance();
    const token = await getSessionToken(app);

    // Decode JWT
    const payload = JSON.parse(atob(token.split(".")[1]));
    const dest = payload.dest; // e.g. https://admin.shopify.com/store/andrei-store205/apps/botassistai

    // 🔥 Extract ONLY the required host value
    const host = btoa(dest.replace("https://", ""));

    console.log("Correct HOST:", host);

    const res = await axios.post(`${directory}/create-subscription2`, {
      userId,
      host,
    });

    const confirmationUrl = res.data?.confirmationUrl;
    if (!confirmationUrl) throw new Error("Missing confirmationUrl");

    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);

  } catch (err) {
    console.error("❌ Billing activation failed:", err);
    alert("Billing failed — see console");
  }
}

