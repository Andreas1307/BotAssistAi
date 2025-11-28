import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useConfig } from "@/components/hooks/use-config";
import { useSettings } from "@/components/hooks/use-settings";
import { fetchWithAuth } from "@/lib/utils/fetch-with-auth";
import { initShopifyAppBridge } from "@/lib/shopify/app-bridge/app-bridge-provider";

const ShopifyLoader = () => {
  const [config, setConfig] = useConfig();
  const navigate = useNavigate();
  const [settings] = useSettings();

  const [searchParams] = useSearchParams();
  const shopParam = searchParams.get("shop");

  const [isLoading, setIsLoading] = useState(true);

  const installCallback = async (shop) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/shopify/install`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shop }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Install failed", await response.text());
        return false;
      }

      const data = await response.json();

      if (data.success) {
        setConfig((prev) => ({
          ...prev,
          appId: data.appId,
          appSecret: data.appSecret,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Install error:", error);
      return false;
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!shopParam) {
        console.error("Missing shop param");
        return;
      }

      const directory = import.meta.env.VITE_API_BASE_URL;

      //
      // -------------------------------------------------------------
      // 1️⃣ CHECK SESSION COOKIE (shopify_session)
      // -------------------------------------------------------------
      //

      const cookieCheck = await fetchWithAuth(`/shopify/check-auth`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!cookieCheck?.authenticated) {
        // ❗ This is the ONLY moment we redirect to top-level-auth.
        window.top.location.href = `${directory}/shopify/top-level-auth?shop=${shopParam}`;
        return;
      }

      //
      // -------------------------------------------------------------
      // 2️⃣ INITIALIZE APP BRIDGE (embedded mode)
      // -------------------------------------------------------------
      //

      const app = await initShopifyAppBridge();

      if (!app) {
        console.warn("App Bridge not ready yet. Waiting.");
        return;
      }

      //
      // -------------------------------------------------------------
      // 3️⃣ CHECK IF STORE IS INSTALLED
      // -------------------------------------------------------------
      //

      const installStatus = await fetchWithAuth(`/shopify/install-status`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!installStatus.installed) {
        // ❗ installCallback runs EXACTLY ONCE per fresh installation
        const didInstall = await installCallback(shopParam);

        if (!didInstall) {
          console.error("Store could not be installed.");
          return;
        }
      }

      //
      // -------------------------------------------------------------
      // 4️⃣ OPEN CONFIG OR DEFAULT CHATBOT PAGE
      // -------------------------------------------------------------
      //

      const colors = settings?.appearance?.colors;

      // KEEP YOUR REQUIRED CALL
      await fetchWithAuth(`/chatbot-config-shopify`, {
        method: "POST",
        body: JSON.stringify({
          shop: shopParam,
          colors,
        }),
        headers: { "Content-Type": "application/json" },
      });

      setIsLoading(false);

      // Route inside embedded app
      navigate("/chatbot", { replace: true });
    };

    run();
  }, [shopParam, navigate, settings, setConfig]);

  return isLoading ? <div>Loading Shopify App…</div> : null;
};

export default ShopifyLoader;
