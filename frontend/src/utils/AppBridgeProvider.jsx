// AppBridgeProvider.js
import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

export const ShopifyAppBridgeProvider = ({ children }) => {
  const searchParams = new URLSearchParams(window.location.search);
  const host = searchParams.get("host");
  const shop = searchParams.get("shop");

  const isEmbedded = window.top !== window.self;

  const appBridgeConfig = useMemo(() => {
    if (!host || !process.env.REACT_APP_SHOPIFY_API_KEY) return null;
    return {
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    };
  }, [host]);

  if (isEmbedded && (!host || !shop)) {
    // Optional: force re-entry via /auth/embedded if not launched properly
    window.location.href = `/auth/embedded?shop=${shop || ""}`;
    return null;
  }

  return (
    <PolarisProvider i18n={{}}>
      {appBridgeConfig ? (
        <AppBridgeProvider config={appBridgeConfig}>{children}</AppBridgeProvider>
      ) : (
        children // Public access (non-embedded)
      )}
    </PolarisProvider>
  );
};
