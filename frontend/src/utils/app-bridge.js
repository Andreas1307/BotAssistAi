import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

export function createAppBridge() {
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  if (!host) throw new Error("Missing host parameter in URL");

  return createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });
}

export async function authenticatedFetch(url, options = {}) {
  const app = createAppBridge();
  const token = await getSessionToken(app);

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
