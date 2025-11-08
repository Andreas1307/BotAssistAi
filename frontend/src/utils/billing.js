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

      // 🧩 Shopify-safe redirect breakout
      const breakoutUrl = `https://botassistai.com/redirect.html?target=${encodeURIComponent(
        res.confirmationUrl
      )}`;

      // Always open this via user gesture (button click)
      window.open(breakoutUrl, "_top");
      return;
    }

    console.error("❌ No confirmationUrl returned:", res);
    alert("Failed to create subscription. Please try again.");
  } catch (err) {
    console.error("❌ handleBilling failed:", err);
    alert("Billing setup failed. Check console for details.");
  }
}
