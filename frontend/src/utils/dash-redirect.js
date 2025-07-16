import { useEffect } from "react";

// Optional: Use a random string generator if crypto is not available
function generateState() {
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

const useShopifyInstallRedirect = () => {
  useEffect(() => {
    const isShopifyUser = localStorage.getItem("shopifyUser") === "true";
    const hasInstalled = localStorage.getItem("shopifyInstalled") === "true";
    const shop = localStorage.getItem("shop");
    const clientId = process.env.REACT_APP_SHOPIFY_API_KEY;
    const redirectUri = "https://api.botassistai.com/shopify/callback";

    if (isShopifyUser && !hasInstalled && shop && clientId) {
     // const state = generateState();
    //  localStorage.setItem("shopifyInstalled", "true");
     // localStorage.setItem("shopifyOAuthState", state);

      const scope = [
        "read_products",
        "write_products",
        "read_customers",
        "write_customers",
        "read_script_tags",
        "write_script_tags",
      ].join(",");

      const installUrl = `https://api.botassistai.com/shopify/install?shop=${shop}`;
      //window.location.href = installUrl;
      window.location.href = `https://api.botassistai.com/shopify/install?shop=${shop}`;

      
    }
  }, []);
};

export default useShopifyInstallRedirect;
