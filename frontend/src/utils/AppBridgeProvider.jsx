// utils/ShopifyAppBridgeProvider.js
import React, { useMemo } from "react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import { Provider as AppBridgeReactProvider } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

export const ShopifyAppBridgeProvider = ({ children }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");
  const shop = urlParams.get("shop");

  const config = useMemo(() => {
    if (!host || !process.env.REACT_APP_SHOPIFY_API_KEY) return null;
    return {
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true,
    };
  }, [host]);

  if (!host || !shop) {
    // optional: redirect fallback
    window.location.href = `/auth/embedded?shop=${shop || ""}`;
    return null;
  }

  return (
    <AppBridgeReactProvider config={config}>
      <PolarisProvider i18n={{}}>
        {children}
      </PolarisProvider>
    </AppBridgeReactProvider>
  );
};



// sa fac asta cu login (pe telefon) si inloc sa imi deschida in iframe imi deschide in website-ul meu direct
// care poate sa fie bine