// AppBridgeProvider.jsx
import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import createApp from "@shopify/app-bridge";

export const AppBridgeProvider = ({ children }) => {
  const appBridgeConfig = useMemo(() => {
    const host = new URLSearchParams(window.location.search).get("host");
    const apiKey = process.env.REACT_APP_SHOPIFY_API_KEY;

    if (!host || !apiKey) return null;

    return {
      apiKey,
      host,
      forceRedirect: true,
    };
  }, []);

  const appBridge = useMemo(() => {
    if (!appBridgeConfig) return null;
    return createApp(appBridgeConfig);
  }, [appBridgeConfig]);

  if (!appBridge) return <>{children}</>; // Non-Shopify path

  return (
    <PolarisProvider i18n={{}} appBridge={appBridge}>
      {children}
    </PolarisProvider>
  );
};
