import { fetchWithAuth } from "./initShopifyAppBridge";

export async function handleBilling(userId) {
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");

  try {
    const res = await fetchWithAuth(`https://api.botassistai.com/create-subscription2`, {
      method: "POST",
      body: { userId, host },
    });

    if (res?.confirmationUrl) {
      console.log("✅ Billing confirmation URL:", res.confirmationUrl);

      // 🔥 CRITICAL FIX: breakout to top-level page
      const breakoutUrl = `https://botassistai.com/redirect.html?target=${encodeURIComponent(
        res.confirmationUrl
      )}`;

      // Make sure this is triggered by a user gesture (click)
      window.open(breakoutUrl, "_top");
    } else {
      console.error("❌ No confirmationUrl returned:", res);
      alert("Failed to create subscription. Please try again.");
    }
  } catch (err) {
    console.error("❌ handleBilling failed:", err);
    alert("Billing setup failed. Check console for details.");
  }
}