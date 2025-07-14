import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

// Creates and returns App Bridge instance
export function createAppBridge() {
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  if (!host) {
    throw new Error("Missing host parameter in URL");
  }

  return createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host: host,
    forceRedirect: true,
  });
}

// Creates a fetch function that injects session token
export async function authenticatedFetch() {
  const app = createAppBridge();
  const token = await getSessionToken(app);

  return async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };
}
