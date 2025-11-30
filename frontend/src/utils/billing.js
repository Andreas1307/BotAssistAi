import axios from "axios";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const app = getAppBridgeInstance();
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");

    if (!host) {
      console.error("❌ No host found in URL");
      alert("Missing host parameter");
      return;
    }

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

