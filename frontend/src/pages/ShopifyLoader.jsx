import { useEffect, useState } from "react";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import directory from "../directory";

export default function ShopifyLoader() {
    
  const [installed, setInstalled] = useState(null);
  const [appBridgeReady, setAppBridgeReady] = useState(false);
  
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
        if (!appBridgeReady) return;
      
        const fetchUser = async () => {
          try {
            const data = await fetchWithAuth("/auth-check");
            setUser(data.user);
          } catch (err) {
            console.error("❌ Auth check error:", err);
            setUser(null);
          }
        };
        fetchUser();
      }, [appBridgeReady, shop]);
      
      
      useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shopParam = params.get("shop");
        const hostParam = params.get("host");
        const hasTopLevel = document.cookie.includes("shopify_toplevel=true");
      
        if (!shopParam) return;
      
        if (!hasTopLevel && window.top === window.self) {
            // ALWAYS send them to top-level-auth instead of /auth
            window.top.location.href =
              `${directory}/shopify/top-level-auth?shop=${shopParam}`;
            return;
          }
          
      
        // Otherwise init App Bridge normally
        (async () => {
          const app = await initShopifyAppBridge();
          window.appBridge = app;
          setAppBridgeReady(true);
        })();
      }, []);
    
      useEffect(() => {
    
        if (!appBridgeReady) return; 
    
        const params = new URLSearchParams(window.location.search);
        const shopParam = params.get("shop");
        const hostParam = params.get("host");
      
        if (!shopParam || !hostParam) {
          console.warn("❌ Not running inside Shopify context.");
          return;
        }
      
        setShop(shopParam);
      
        const checkShop = async () => {
          try {
            const data = await fetchWithAuth(`/check-shopify-store?shop=${encodeURIComponent(shopParam)}`);
           
            if (!data.installed) {

                await fetchWithAuth(`/chatbot-config-shopify`, {
                  method: "POST",
                  body: {
                    shop: shopParam,
                    colors,
                  },
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
          } 
        };
      
        checkShop();
      }, [appBridgeReady, user]); 

  return <div>Loading Shopify App…</div>;
}


