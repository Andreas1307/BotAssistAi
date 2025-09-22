// utils/axiosShopify.js
import axios from "axios";

let appBridgeInstance = null;

/**
 * Set the App Bridge instance from a React component
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
    // Only attach Shopify token if we have App Bridge and Shopify global
    if (appBridgeInstance && typeof window !== "undefined" && window.shopify) {
      const token = await window.shopify.idToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const shop = new URLSearchParams(window.location.search).get("shop");
      if (shop) {
        config.headers["X-Shopify-Shop-Domain"] = shop;
      }
    } else {
      // Non-Shopify request, just normal API call
      // console.log("🟢 Non-Shopify request.");
    }
  } catch (err) {
    console.error("Error attaching Shopify token:", err);
  }

  return config;
});

export default instance;
