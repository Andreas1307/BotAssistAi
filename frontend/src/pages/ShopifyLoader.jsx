import { useEffect, useState } from "react";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {
  const [loading, setLoading] = useState(true);
  const [appBridgeReady, setAppBridgeReady] = useState(false);
  const [shop, setShop] = useState(null);

  const [colors] = useState({
    background: "#f2f2f2",
    chatbotBackground: "#092032",
    chatBoxBackground: "#112B3C",
    chatInputBackground: "#ffffff",
    chatInputTextColor: "#000000",
    chatBtn: "#00F5D4",
    websiteChatBtn: "#00F5D4",
    websiteQuestion: "#ffffff",
    needHelpTextColor: "#00F5D4",
    textColor: "#cccccc",
    borderColor: "#00F5D4",
  });

  // -------------------------------
  // STEP 1 — Extract params
  // -------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");
    const hostParam = params.get("host");
    const hasTopLevel = document.cookie.includes("shopify_toplevel=true");

    if (!shopParam) return;

    setShop(shopParam);

    // 1️⃣ If host missing → install phase → break iframe ONCE
    if (!hostParam && !hasTopLevel) {
      window.top.location.href = `${directory}/shopify/top-level-auth?shop=${shopParam}`;
      return;
    }

    // 2️⃣ If host exists → embedded mode → now load App Bridge
    (async () => {
      const app = await initShopifyAppBridge();
      if (!app) return;

      window.appBridge = app;
      setAppBridgeReady(true);
    })();
  }, []);

  // -------------------------------
  // STEP 2 — After App Bridge is ready, check install
  // -------------------------------
  useEffect(() => {
    if (!appBridgeReady || !shop) return;

    const checkInstall = async () => {
      try {
        const status = await fetchWithAuth(`/check-shopify-store?shop=${encodeURIComponent(shop)}`);

        // 3️⃣ NOT INSTALLED → start OAuth
        if (!status.installed) {
          window.top.location.href = `${directory}/shopify/install?shop=${shop}`;
          return;
        }

        // 4️⃣ INSTALLED → sync chatbot config
        await fetchWithAuth(`/chatbot-config-shopify`, {
          method: "POST",
          body: JSON.stringify({ shop, colors }),
          headers: { "Content-Type": "application/json" },
        });

        // 5️⃣ Continue to app/dashboard (user will be logged in via callback)
        const hostParam = new URLSearchParams(window.location.search).get("host");
        safeRedirect(`/${status.username}/dashboard?shop=${shop}&host=${hostParam}`);

      } catch (err) {
        console.error("❌ Installation check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkInstall();
  }, [appBridgeReady, shop]);

  return <div>Loading Shopify App…</div>;
}
