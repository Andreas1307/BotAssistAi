// src/utils/app-bridge-instance.js
import createApp from '@shopify/app-bridge';

export const getAppBridge = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  return createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });
};
