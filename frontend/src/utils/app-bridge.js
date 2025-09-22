import { useAppBridge, Redirect } from "@shopify/app-bridge";
import { getSessionToken } from '@shopify/app-bridge-utils';

const app = useAppBridge();        
const redirect = Redirect.create(app);

const redirectToUrl = (url) => {
  redirect.dispatch(Redirect.Action.REMOTE, url);
};
let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const urlParams = new URLSearchParams(window.location.search);
  const host = urlParams.get("host") || localStorage.getItem("host");
  if (!host) {
    console.warn("❌ Missing host param");
    return null;
  }

  appInstance = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  return appInstance;
}

export async function waitForAppBridge() {
  const isEmbedded = window.top !== window.self;
  if (!isEmbedded) {
    console.warn("⚠️ Not in iframe (not embedded)");
    return null;
  }

  const app = getAppBridgeInstance();
  return app;
}

export async function fetchWithAuth(url, options = {}) {
  const app = await waitForAppBridge();
  if (!app) return new Response(null, { status: 401 });

  try {
    const token = await getSessionToken(app);
    if (!token) return new Response(null, { status: 401 });

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error("❌ Token error:", err);
    return new Response(null, { status: 401 });
  }
}
