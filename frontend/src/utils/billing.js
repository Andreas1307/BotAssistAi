import { fetchWithAuth, safeRedirect } from "./app-bridge";
import directory from "../directory";

export async function handleBilling(userId) {
    try {
      const res = await fetchWithAuth(`${directory}/create-subscription2`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${text}`);
      }
  
      const data = await res.json();
  
      if (data?.confirmationUrl) {
        safeRedirect(data.confirmationUrl);
      } else {
        console.error("No confirmationUrl returned from backend", data);
      }
    } catch (err) {
      console.error("❌ Billing activation failed:", err);
    }
  }
  