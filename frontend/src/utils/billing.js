import { safeRedirect } from "./initShopifyAppBridge";
import { ToastContainer, toast } from 'react-toastify';
import directory from "../directory";
import axios from "axios";

export async function handleBilling(userId) {
  try {
    const res = await axios.post(`${directory}/create-subscription2`, { userId });
    const data = res.data;

    if (data?.confirmationUrl) {
      // show toast first
      toast.info("Redirecting to Shopify billing...", { autoClose: 2000 });
      setTimeout(() => {
        safeRedirect(data.confirmationUrl);
      }, 500); // small delay to let toast render
    } else {
      console.error("No confirmationUrl returned from backend", data);
      toast.error("Billing could not be initiated.");
    }
  } catch (err) {
    console.error("❌ Billing activation failed:", err.response?.data || err.message);
    toast.error("Billing activation failed. Please try again.");
  }
}
