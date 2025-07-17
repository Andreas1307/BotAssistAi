import { useEffect, useState } from "react";
import axios from "axios";

const useShopifyInstallRedirect = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${directory}/auth-check`, { withCredentials: true });
        setUser(response.data.user);
      } catch (e) {
        console.log("Error fetching the user", e);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const isShopifyUser = localStorage.getItem("shopifyUser") === "true";
    const hasInstalled = localStorage.getItem("shopifyInstalled") === "true";
    const shop = localStorage.getItem("shop");

    const redirectToInstall = async () => {
      try {
        if (user?.user_id && shop) {
          // 🔐 Attach user ID to session before redirect
          await axios.post(
            "https://api.botassistai.com/shopify/session-attach",
            { userId: user.user_id },
            { withCredentials: true }
          );

          const installRedirect = `https://api.botassistai.com/shopify/install?shop=${shop}`;
          console.log("🔁 Redirecting to install via backend:", installRedirect);
          window.location.href = installRedirect;
        }
      } catch (err) {
        console.error("Failed to attach session before install", err);
      }
    };

    if (isShopifyUser && !hasInstalled && shop) {
      localStorage.setItem("shopifyInstalled", "true");
      redirectToInstall();
    }
  }, [user]);
};

export default useShopifyInstallRedirect;
