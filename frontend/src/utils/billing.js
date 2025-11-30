import axios from "axios";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import directory from "../directory";

function getHostFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("host");
}


export async function handleBilling(userId) {
  try {
    const app = getAppBridgeInstance();
    const token = await getSessionToken(app);

    // Get host directly from the URL — TRUST THIS ONE
    const host = getHostFromURL();

    if (!host) throw new Error("Missing host in URL");

    console.log("USING URL HOST:", host);

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


