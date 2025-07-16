// utils/detectShopify.js
export function detectShopifyUser() {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const host = params.get("host");
  
    if (shop && shop.endsWith(".myshopify.com")) {
      // Save to localStorage or cookie
      localStorage.setItem("shopifyUser", "true");
      localStorage.setItem("shop", shop);
      localStorage.setItem("host", host);
      return true;
    }
  
    return false;
  }
  