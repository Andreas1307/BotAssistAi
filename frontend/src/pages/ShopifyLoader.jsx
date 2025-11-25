import { useEffect, useState } from "react";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {
    
  const [installed, setInstalled] = useState(null);
  const [appBridgeReady, setAppBridgeReady] = useState(false);
  const [loading, setLoading] = useState(true);
    const [colors, setColors] = useState({
        background: '#f2f2f2',
        chatbotBackground: '#092032',
        chatBoxBackground: '#112B3C',
        chatInputBackground: '#ffffff',        
        chatInputTextColor: '#000000',
        chatBtn: '#00F5D4',
        websiteChatBtn: '#00F5D4',
        websiteQuestion: '#ffffff',
        needHelpTextColor: '#00F5D4',
        textColor: '#cccccc',
        borderColor: '#00F5D4'
      });


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    
    const shopParam = params.get("shop");
    const hostParam = params.get("host");

    if (!shop) {
      return; // Shopify will add it automatically
    }
    const checkShop = async () => {
        try {
          const data = await fetchWithAuth(`/check-shopify-store?shop=${encodeURIComponent(shopParam)}`);
         
          if (!data.installed) {
            window.location.assign(`${directory}/shopify/top-level-auth?shop=${shopParam}&host=${hostParam}`);

            await fetchWithAuth(`/chatbot-config-shopify`, {
              method: "POST",
              body: JSON.stringify({
                shop: shopParam,
                colors,
              }),
              headers: { "Content-Type": "application/json" },
            });
    
            return; 
          }
    
          if (!data.hasBilling) {
            console.warn("⚠️ Store installed but missing billing setup.");
            return;
          }
    
          console.log("✅ Shopify store ready");
          setInstalled(true);
  
          if (shop) {
            safeRedirect(`/${shop}/dashboard?shop=${shopParam}&host=${hostParam}`);
          }
    
        } catch (err) {
          console.error("❌ Shopify flow failed:", err);
          setInstalled(false);
        } finally {
          setLoading(false);
        }
      };

      checkShop()

      (async () => {
        const app = await initShopifyAppBridge();
        if (!app) {
            window.location.assign(`${directory}/shopify/top-level-auth?shop=${shopParam}&host=${hostParam}`);

          return;
        }
        
        setAppBridgeReady(true);
        window.appBridge = app;
        try {
          // No /api/ping anymore — just assume App Bridge works
          console.log("✅ Shopify App Bridge initialized and embedded app session confirmed");
    
          // Optionally, you can trigger install if shop is not installed yet
          // safeRedirect(`${directory}/install?shop=${shopParam}&host=${hostParam}`);
        } catch (err) {
          console.error("❌ Shopify App Bridge init error:", err);
          safeRedirect(`${directory}/shopify/install?shop=${shopParam}&host=${hostParam}`);
        }
      })();
  }, []);

  return <div>Loading Shopify App…</div>;
}
