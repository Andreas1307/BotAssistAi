import axios from "axios";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const app = getAppBridgeInstance();

    // ❗ App Bridge not ready yet
    if (!app) {
      console.warn("App Bridge not ready yet");
      return;
    }

    // ✔ Always get host from Shopify JWT, never from URL
    const token = await getSessionToken(app);
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Extract dest → "andrei-store205.myshopify.com/admin"
    const dest = payload.dest.replace("https://", "");
    const params = new URLSearchParams(window.location.search);
    let host = params.get("host");
    
    if (!host) {
      // build correct admin host for App Bridge
      const store = payload.dest.split(".myshopify.com")[0];  
      const adminHost = `admin.shopify.com/store/${store}`;
      host = btoa(adminHost);
    }
    
    console.log("✔ Using host:", host);
    

    const res = await axios.post(`${directory}/create-subscription2`, {
      userId,
      host,
    });

    const confirmationUrl = res.data?.confirmationUrl;
    if (!confirmationUrl) throw new Error("Missing confirmationUrl");

    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);

  } catch (err) {
    console.error("Billing failed:", err);
    alert("Billing failed — check console");
  }
}

