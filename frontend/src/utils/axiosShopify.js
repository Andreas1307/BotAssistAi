// utils/axiosShopify.js
import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appBridgeInstance = null;

export function setAppBridge(app) {
  appBridgeInstance = app;
}

const instance = axios.create({
  baseURL: "https://api.botassistai.com",
  withCredentials: true,
});

instance.interceptors.request.use(async (config) => {
  try {
    if (appBridgeInstance) {
      const token = await getSessionToken(appBridgeInstance);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
