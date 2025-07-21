// appBridgeClient.js

const createApp = window.appBridge.default;
const { authenticatedFetch } = window.appBridgeUtils;


let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");

  if (!host) {
    console.warn("❌ Missing host param in URL or localStorage");
    return null;
  }

  localStorage.setItem("host", host);

  const isEmbedded = window.top !== window.self;

  appInstance = window.appBridge.default({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: isEmbedded,
  });

  return appInstance;
}

export function fetchWithAuth(url, options = {}) {
  const app = getAppBridgeInstance();

  if (!app) {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  const authenticatedFetch = window.appBridgeUtils.authenticatedFetch;
  const fetchFunction = authenticatedFetch(app);

  return fetchFunction(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
