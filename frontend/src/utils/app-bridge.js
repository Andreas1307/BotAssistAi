import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

export function initAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");

  if (!host) return null;

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  window.appBridge = app;
  return app;
}

export async function getToken() {
  const app = window.appBridge;
  if (!app) return null;
  return await getSessionToken(app);
}
