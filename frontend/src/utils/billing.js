import { fetchWithAuth, safeRedirect } from "./app-bridge";
import directory from "../directory";

export async function handleBilling(userId) {
  try {
    const res = await fetchWithAuth(`${directory}/create-subscription2`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();

    if (data?.confirmationUrl) {
      safeRedirect(data.confirmationUrl);
    } else {
      console.error("No confirmationUrl returned from backend");
    }
  } catch (err) {
    console.error("❌ Billing activation failed:", err);
  }
}
