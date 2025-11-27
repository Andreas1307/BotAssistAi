import { useEffect, useState } from "react";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from "../directory";

export default function ShopifyLoader() {
    
  const [installed, setInstalled] = useState(null);
  const [appBridgeReady, setAppBridgeReady] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [shop, setShop] = useState(null);
  const [user, setUser] = useState(null);
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
        const fetchUser = async () => {
          try {
            const data = await fetchWithAuth("/auth-check");        
            setUser(data.user);
          } catch (error) {
            console.error("❌ Auth check error:", error);
            setUser(null);
          } finally {
            setLoading(false);
          }
        };
      
        fetchUser();
      }, []);
      
      useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shopParam = params.get("shop");
      
        if (!shopParam) return;
      
        const hasTopLevelCookie = document.cookie.includes("shopify_toplevel=true");
      
        // FIX: If inside iframe AND cookie missing → force top-level
        if (window.top !== window.self && !hasTopLevelCookie) {
          window.top.location.href = `${directory}/shopify/top-level-auth?shop=${shopParam}`;
          return;
        }
      
        // Otherwise initialize App Bridge normally
        (async () => {
          const app = await initShopifyAppBridge();
          if (app) {
            setAppBridgeReady(true);
            window.appBridge = app;
          }
        })();
      }, []);
      
    
      useEffect(() => {
    
        if (!appBridgeReady) return; 
    
        const params = new URLSearchParams(window.location.search);
        const shopParam = params.get("shop");
        const hostParam = params.get("host");
      
        if (!shopParam || !hostParam) {
          console.warn("❌ Not running inside Shopify context.");
          setLoading(false);
          return;
        }
      
        setShop(shopParam);
      
        const checkShop = async () => {
          try {
            const data = await fetchWithAuth(`/check-shopify-store?shop=${encodeURIComponent(shopParam)}`);
           
            if (!data.installed) {
                const hasTopLevelCookie = document.cookie.includes("shopify_toplevel=true");
                if (hasTopLevelCookie) {
                  // Embedded install allowed
                  window.location.href = `${directory}/shopify/install?shop=${shopParam}&host=${hostParam}`;
                } else {
                  // Fallback: force top-level
                  safeRedirect(`${directory}/shopify/top-level-auth?shop=${shopParam}`);
                }
      
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
    
            if (user?.username) {
              safeRedirect(`/${user.username}/dashboard?shop=${shopParam}&host=${hostParam}`);
            }
      
          } catch (err) {
            console.error("❌ Shopify flow failed:", err);
            setInstalled(false);
          } finally {
            setLoading(false);
          }
        };
      
        checkShop();
      }, [appBridgeReady]); 

  return <div>Loading Shopify App…</div>;
}
