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
      // ✅ ALWAYS break out to top-level using redirect.html
      const breakoutUrl = `https://botassistai.com/redirect.html?target=${encodeURIComponent(res.confirmationUrl)}&host=${encodeURIComponent(host)}`;
      window.open(breakoutUrl, "_top"); // 🔥 critical line
    } else {
      console.error("❌ No confirmationUrl returned:", res);
      alert("Failed to create subscription. Please try again.");
    }
  } catch (err) {
    console.error("❌ handleBilling failed:", err);
  }
}
