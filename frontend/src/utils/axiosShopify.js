// utils/axiosShopify.js
import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

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

// Interceptor to automatically attach Shopify token
instance.interceptors.request.use(async (config) => {
  try {
    if (!appBridgeInstance) {
      console.warn(
        "⚠️ App Bridge instance not set. Call setAppBridge(app) in your component first."
      );
      return config;
    }

    const token = await getSessionToken(appBridgeInstance);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const shop = new URLSearchParams(window.location.search).get("shop");
    if (shop) {
      config.headers["X-Shopify-Shop-Domain"] = shop;
    }
  } catch (err) {
    console.error("Error fetching Shopify session token:", err);
  }

  return config;
});

export default instance;
