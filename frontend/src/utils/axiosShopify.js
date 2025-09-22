// utils/axiosShopify.js
import axios from "axios";

// We'll store the App Bridge instance once
let appBridgeInstance = null;

/**
 * Set the App Bridge instance from a React component
 * Call this once in a component using useAppBridge()
 */
export function setAppBridge(app) {
  appBridgeInstance = app;
}

// Axios instance
const instance = axios.create({
  baseURL: "https://api.botassistai.com",
  withCredentials: true,
});

// Interceptor to attach Shopify session info (if inside Shopify)
instance.interceptors.request.use(async (config) => {
  try {
    if (appBridgeInstance && window.shopify) {
      // ✅ Use direct API access via the Shopify global
      const token = await window.shopify.idToken(); // Shopify gives ID token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const shop = new URLSearchParams(window.location.search).get("shop");
      if (shop) {
        config.headers["X-Shopify-Shop-Domain"] = shop;
      }
    } else {
      // ✅ Non-Shopify users (regular axios request)
      console.log("🟢 Non-Shopify request (no appBridgeInstance).");
    }
  } catch (err) {
    console.error("Error preparing Shopify request:", err);
  }

  return config;
});

export default instance;
