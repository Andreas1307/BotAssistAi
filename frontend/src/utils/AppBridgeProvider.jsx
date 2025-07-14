// components/AppBridgeProvider.jsx
import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import createApp from "@shopify/app-bridge";

export const AppBridgeProvider = ({ config, children }) => {
  const app = useMemo(() => createApp(config), [config]);

  return (
    <PolarisProvider>
      {children}
    </PolarisProvider>
  );
};
