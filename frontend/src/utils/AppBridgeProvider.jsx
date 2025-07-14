// components/AppBridgeProvider.jsx
import React from "react";
import { AppBridgeProvider as ShopifyAppBridgeProvider } from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";

export const AppBridgeProvider = ({ config, children }) => {
  return (
    <ShopifyAppBridgeProvider config={config}>
      <PolarisProvider>
        {children}
      </PolarisProvider>
    </ShopifyAppBridgeProvider>
  );
};
