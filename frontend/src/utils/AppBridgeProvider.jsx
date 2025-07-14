// components/AppBridgeProvider.jsx
import React, { useMemo } from "react";
import { Provider as AppBridgeReactProvider } from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";

export const AppBridgeProvider = ({ config, children }) => {
  // useMemo ensures the appBridge config doesn't get recreated on every render
  const appBridgeConfig = useMemo(() => config, [config]);

  return (
    <AppBridgeReactProvider config={appBridgeConfig}>
      <PolarisProvider>
        {children}
      </PolarisProvider>
    </AppBridgeReactProvider>
  );
};
