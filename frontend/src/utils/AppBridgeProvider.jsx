// components/AppBridgeProvider.jsx
import React from "react";
import AppBridgeReactProvider from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";

export const AppBridgeProvider = ({ config, children }) => {
  return (
    <AppBridgeReactProvider config={config}>
      <PolarisProvider>
        {children}
      </PolarisProvider>
    </AppBridgeReactProvider>
  );
};
