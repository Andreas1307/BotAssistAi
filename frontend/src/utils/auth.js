// 📄 utils/auth.js
import { getSessionToken } from "@shopify/app-bridge-utils";
const createApp = window['app-bridge'].default;

export async function authenticatedFetch() {
    const app = createApp({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host: new URLSearchParams(window.location.search).get("host"),
        forceRedirect: true
      });
      

  const token = await getSessionToken(app);

  return async function (url, options = {}) {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  };
}
