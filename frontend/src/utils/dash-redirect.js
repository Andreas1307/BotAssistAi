import { useEffect, useState } from "react";
import axios from "axios";
import directory from "../directory";

const useShopifyInstallRedirect = () => {
  useEffect(() => {
    const run = async () => {
      try {
        const isShopifyUser = localStorage.getItem("shopifyUser") === "true";
        const hasInstalled = localStorage.getItem("shopifyInstalled") === "true";
        const shop = localStorage.getItem("shop");

        if (!isShopifyUser || hasInstalled || !shop) {
          return; // ⛔ No need to proceed
        }

        // 1. Fetch current user
        const response = await axios.get(`${directory}/auth-check`, {
          withCredentials: true,
        });
        const user = response.data.user;

        if (!user?.user_id) {
          console.warn("⚠️ No user_id found, skipping install redirect");
          return;
        }

        // 2. Attach userId to session
        await axios.post(
          "https://api.botassistai.com/shopify/session-attach",
          { userId: user.user_id },
          { withCredentials: true }
        );

        // 3. Proceed to redirect for installation
        const installRedirect = `https://api.botassistai.com/shopify/install?shop=${shop}`;
        console.log("🔁 Redirecting to install via backend:", installRedirect);

        localStorage.setItem("shopifyInstalled", "true"); // Set after successful session attach
        window.location.href = installRedirect;
      } catch (err) {
        console.error("❌ Shopify install redirect error:", err);
      }
    };

    run();
  }, []);
};

export default useShopifyInstallRedirect;
