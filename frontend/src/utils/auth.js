import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

export async function authenticatedFetch() {
  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");
  const shop = urlParams.get("shop");

  if (!host || !shop) {
    throw new Error("Missing shop or host param");
  }

  const app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  const token = await getSessionToken(app);

  return async function (url, options = {}) {
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
