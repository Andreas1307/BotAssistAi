import axios from "axios";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const app = getAppBridgeInstance();

    const token = await getSessionToken(app);

    const payload = JSON.parse(atob(token.split(".")[1]));

    // The correct host source
    const dest = payload.dest.replace("https://", ""); // shop.myshopify.com/admin

    const host = btoa(dest);

    console.log("✔ Extracted host from JWT:", host);

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
