// components/AppBridgeProvider.jsx
import React from "react";
import {
  AppBridgeProvider as ShopifyAppBridgeProvider
} from "@shopify/app-bridge-react";
import { AppBridgeStateProvider } from "@shopify/app-bridge-react/context";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import { Routes } from "react-router-dom";
import { Redirect } from "@shopify/app-bridge/actions";

export const AppBridgeProvider = ({ config, children }) => {
  return (
    <ShopifyAppBridgeProvider config={config}>
      <AppBridgeStateProvider>
        <PolarisProvider>
          {children}
        </PolarisProvider>
      </AppBridgeStateProvider>
    </ShopifyAppBridgeProvider>
  );
};
