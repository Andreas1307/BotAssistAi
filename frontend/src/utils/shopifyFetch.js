import { getSessionToken } from '@shopify/app-bridge-utils';
import createApp from '@shopify/app-bridge';
import axios from 'axios';

function getAppBridgeHost() {
  // Try to get host param from URL
  const host = new URLSearchParams(window.location.search).get('host');

  if (!host) {
    console.warn("⚠️ No 'host' parameter found in URL — skipping App Bridge init.");
    return null;
  }
  return host;
}

const host = getAppBridgeHost();

let appBridgeApp = null;
if (host) {
  appBridgeApp = createApp({
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,  
    host,
  });
} else {
  appBridgeApp = null;
}

export async function shopifyAxios(config) {
  if (!appBridgeApp) {
    throw new Error("App Bridge app not initialized because 'host' param is missing.");
  }
  const token = await getSessionToken(appBridgeApp);
  return axios({
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
