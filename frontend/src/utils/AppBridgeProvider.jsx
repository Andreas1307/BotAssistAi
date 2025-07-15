// AppBridgeProvider.js
import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import createApp from "@shopify/app-bridge";

export const AppBridgeProvider = ({ children }) => {
  const host = new URLSearchParams(window.location.search).get("host");
  const shop = new URLSearchParams(window.location.search).get("shop");

  const appBridgeConfig = useMemo(() => {
    if (!host || !process.env.REACT_APP_SHOPIFY_API_KEY) return null;
    return {
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    };
  }, [host]);

  if (!host || !shop) {
    // redirect to the embedded Shopify admin app
    window.location.href = `/auth/embedded?shop=${shop}`;
    return null;
  }

  return (
    <PolarisProvider i18n={{}}>
      {children}
    </PolarisProvider>
  );
};
