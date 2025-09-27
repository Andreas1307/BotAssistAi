// utils/shopifyToast.js
import { Toast } from "@shopify/app-bridge/actions";
import { getAppBridgeInstance } from "./initShopifyAppBridge";

/**
 * Show a Shopify App Bridge toast.
 * Works only inside Shopify iframe.
 * If outside Shopify, falls back to alert().
 * 
 * @param {string} message The message to show
 * @param {boolean} isError Optional error styling
 */
export function showToast(message, isError = false) {
  const app = getAppBridgeInstance();

  if (app) {
    const toast = Toast.create(app, {
      message,
      duration: 4000,
      isError,
    });
    toast.dispatch(Toast.Action.SHOW);
  } else {
    // fallback outside Shopify
    alert(message);
  }
}
