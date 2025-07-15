import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import { AppBridgeReactProvider } from "@shopify/app-bridge-react";
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

  const appBridgeInstance = useMemo(() => {
    return appBridgeConfig ? createApp(appBridgeConfig) : null;
  }, [appBridgeConfig]);

  if (!appBridgeInstance) return <>{children}</>; // fallback for non-Shopify users

  return (
    <AppBridgeReactProvider appBridge={appBridgeInstance}>
      <PolarisProvider i18n={{}}>
        {children}
      </PolarisProvider>
    </AppBridgeReactProvider>
  );
};
