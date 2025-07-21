// loadAppBridge.js
const APP_BRIDGE_SRC = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
const APP_BRIDGE_UTILS_SRC = "https://cdn.shopify.com/shopifycloud/app-bridge-utils.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(); // Already loaded
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadAppBridge() {
  await loadScript(APP_BRIDGE_SRC);
  await loadScript(APP_BRIDGE_UTILS_SRC);

  if (!window.Shopify?.AppBridge?.createApp) {
    throw new Error("App Bridge failed to initialize after script load.");
  }
}
