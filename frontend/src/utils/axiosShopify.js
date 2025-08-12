import axios from "axios";
import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

let app = null;

function isEmbeddedApp() {
  // Shopify embedded apps run inside an iframe inside Shopify Admin.
  // Check if window is inside iframe AND if URL has shop & host params
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get("shop");
  const host = urlParams.get("host");
  
  const inIframe = window.self !== window.top;
  
  return inIframe && shop && host;
}

function getAppInstance() {
  if (app) return app;

  if (!isEmbeddedApp()) {
    // Not in embedded Shopify app context, do not create App Bridge instance
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host");

  app = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
  });
  return app;
}

const instance = axios.create({
  baseURL: "https://api.botassistai.com",
  withCredentials: true,
});

instance.interceptors.request.use(async (config) => {
  try {
    const app = getAppInstance();
    if (app) {
      const token = await getSessionToken(app);
      config.headers.Authorization = `Bearer ${token}`;

      const urlParams = new URLSearchParams(window.location.search);
      const shop = urlParams.get("shop");
      if (shop) {
        config.headers["X-Shopify-Shop-Domain"] = shop;
      }
    }
  } catch (error) {
    console.error("Error getting Shopify session token", error);
  }
  return config;
});

export default instance;
