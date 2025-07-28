export const loadAppBridge = () => {
    return new Promise((resolve, reject) => {
      if (window.appBridge) return resolve(window.appBridge);
  
      const existingScript = document.querySelector("#app-bridge-script");
      if (existingScript) return resolve();
  
      const script = document.createElement("script");
      script.src = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
      script.id = "app-bridge-script";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load App Bridge"));
      document.head.appendChild(script);
    });
  };
  