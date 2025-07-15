import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";

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

  return (
    <PolarisProvider i18n={{}}>
      {children}
    </PolarisProvider>
  );
};
