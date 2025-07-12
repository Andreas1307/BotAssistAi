import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

export async function authenticatedFetch() {
  const query = new URLSearchParams(window.location.search);
  const host = query.get("host");
  
  if (!host) {
    throw new Error("Missing host param in URL");
  }

  const app = createApp({
    apiKey: process.env.SHOPIFY_API_KEY, // ⛳ Replace this with actual API Key (hardcoded or injected at build time)
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
