import { useEffect } from "react";

const useShopifyInstallRedirect = () => {
  useEffect(() => {
    const isShopifyUser = localStorage.getItem("shopifyUser") === "true";
    const hasInstalled = localStorage.getItem("shopifyInstalled") === "true";
    const shop = localStorage.getItem("shop");

    if (isShopifyUser && !hasInstalled && shop) {
      localStorage.setItem("shopifyInstalled", "true");

      const installRedirect = `https://api.botassistai.com/shopify/install?shop=${shop}`;
      console.log("🔁 Redirecting to install via backend:", installRedirect);
      window.location.href = installRedirect;
    }
  }, []);
};

export default useShopifyInstallRedirect;
