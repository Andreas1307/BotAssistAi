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
    const rawDest = payload.dest;

    let host;

    if (rawDest.includes("admin.shopify.com")) {
      // admin.shopify.com/store/... style → must base64 encode
      host = btoa(rawDest.replace("https://", ""));
    } else {
      // myshopify.com store
      host = rawDest.split("/admin")[0].replace("https://", "");
    }

    alert("HOST = " + host);

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
    alert("Billing failed — check console for details");
  }
}
