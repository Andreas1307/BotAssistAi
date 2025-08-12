// shopifyFetch.js
import { getSessionToken } from '@shopify/app-bridge-utils';
import createApp from '@shopify/app-bridge';

const appBridgeApp = createApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  host: new URLSearchParams(window.location.search).get('host'),
});

export async function shopifyAxios(config) {
  const token = await getSessionToken(appBridgeApp);
  return axios({
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`, 
    },
  });
}
