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
  const params = new URLSearchParams(window.location.search);
  const shopParam = params.get("shop");
  const hostParam = params.get("host");

  if (!shopParam || !hostParam) return;

  // 🔥 This triggers only ONCE, BEFORE App Bridge loads or API calls happen
  window.location.replace(
    `${directory}/shopify/force-top-level-auth?shop=${shopParam}&host=${hostParam}`
  );
}, []);


  /*  
      useEffect(() => {
        if (!appBridgeReady) return; // ⚡ wait for App Bridge
      
        const fetchUser = async () => {
          try {
            const data = await fetchWithAuth("/auth-check");
            setUser(data.user);
          } catch (err) {
            console.error("❌ Auth check error:", err);
            setUser(null);
          } finally {
            setLoading(false);
          }
        };
      
        fetchUser();
      }, [appBridgeReady]);
      


      useEffect(() => {
        const init = async () => {
          const params = new URLSearchParams(window.location.search);
          const shopParam = params.get("shop");
          const hostParam = params.get("host");
          if (!shopParam || !hostParam) return;
      
          const app = await initShopifyAppBridge();
          if (!app) {
            console.warn("App Bridge init failed, fallback to install");
            safeRedirect(`${directory}/shopify/install?shop=${shopParam}&host=${hostParam}`);
            return;
          }
      
          setAppBridgeReady(true);
          setShop(shopParam);
        };
      
        init();
      }, []);
      
      */
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
              safeRedirect(`/shopify/dashboard?shop=${shopParam}&host=${hostParam}`);
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
