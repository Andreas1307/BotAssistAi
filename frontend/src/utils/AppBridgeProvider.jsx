// AppBridgeProvider.jsx
import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";

export const AppBridgeProvider = ({ children }) => {
  const config = useMemo(() => {
    const host = new URLSearchParams(window.location.search).get("host");
    const apiKey = process.env.REACT_APP_SHOPIFY_API_KEY;

    if (!host || !apiKey) return null;

    return {
      apiKey,
      host,
      forceRedirect: true,
    };
  }, []);

  if (!config) return <>{children}</>; // Non-Shopify path

  return (
    <AppBridgeProvider config={config}>
      <PolarisProvider i18n={{}}>
        {children}
      </PolarisProvider>
    </AppBridgeProvider>
  );
};
