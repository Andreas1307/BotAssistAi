import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import { getSessionToken } from '@shopify/app-bridge-utils';

let appInstance = null;

export function getAppBridgeInstance() {
  if (appInstance) return appInstance;

  const params = new URLSearchParams(window.location.search);
  const shop = params.get('shop');
  const host = params.get('host');

  // Only initialize App Bridge if Shopify context exists
  if (!shop || !host) {
    console.warn('⚠️ Not running in Shopify context. Skipping App Bridge.');
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
  if (!isEmbedded) return null;
  return getAppBridgeInstance();
}

export async function fetchWithAuth(url, options = {}) {
  const app = await waitForAppBridge();
  if (!app) return fetch(url, options); // fallback for non-Shopify users

  try {
    const token = await getSessionToken(app);
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error('❌ Token error:', err);
    return new Response(null, { status: 401 });
  }
}

export function safeRedirect(url) {
  const app = getAppBridgeInstance();
  const isEmbedded = window.top !== window.self;

  if (isEmbedded && app) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, url);
  } else {
    window.top.location.href = url;
  }
}
