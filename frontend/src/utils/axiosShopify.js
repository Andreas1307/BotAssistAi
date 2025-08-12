// src/utils/axiosInstance.js
import axios from "axios";
import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

const instance = axios.create({
  baseURL: "https://api.botassistai.com", // your backend API base
  withCredentials: true, // so cookies still work for non-Shopify users
});

instance.interceptors.request.use(async (config) => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get("shop");
    const host = urlParams.get("host");

    // Only attach token if in Shopify embedded app context
    if (shop && host) {
      const app = createApp({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host,
      });

      const token = await getSessionToken(app);
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Shopify-Shop-Domain"] = shop; // optional for backend checks
    }
  } catch (err) {
    console.error("Error getting Shopify session token", err);
  }

  return config;
});

export default instance;
