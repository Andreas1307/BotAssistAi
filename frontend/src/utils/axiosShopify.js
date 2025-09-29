// utils/axiosShopify.js
import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appBridgeInstance = null;

/**
 * Set the App Bridge instance from a React component or init function
 */
export function setAppBridge(app) {
  appBridgeInstance = app;
}

// Create Axios instance
const instance = axios.create({
  baseURL: "https://api.botassistai.com",
  withCredentials: true,
});

// Request interceptor
instance.interceptors.request.use(async (config) => {
  try {
    if (appBridgeInstance) {
      // Get a fresh session token from App Bridge
      const token = await getSessionToken(appBridgeInstance);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Also attach shop domain if present
      const shop = new URLSearchParams(window.location.search).get("shop");
      if (shop) {
        config.headers["X-Shopify-Shop-Domain"] = shop;
      }
    }
  } catch (err) {
    console.error("❌ Error attaching Shopify session token:", err);
  }

  return config;
});

export default instance;
