// src/components/AppBridgeProvider.jsx
import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import { Provider as AppBridgeReactProvider } from "@shopify/app-bridge-react";
import createApp from "@shopify/app-bridge";

export const AppBridgeProvider = ({ children }) => {
  const config = useMemo(() => {
    const host = new URLSearchParams(window.location.search).get("host");
    return {
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    };
  }, []);

  return (
    <PolarisProvider i18n={{}}>
      <AppBridgeReactProvider config={config}>
        {children}
      </AppBridgeReactProvider>
    </PolarisProvider>
  );
};
