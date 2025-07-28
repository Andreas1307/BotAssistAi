import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createHashRouter,
  RouterProvider,
} from 'react-router-dom';

import Homepage from './pages/homepage';
import FeaturesPage from './pages/featuresPage';
import Contact from './pages/contact';
import About from './pages/about';
import Pricing from './pages/pricing';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import Dashboard from './UserPages/dashboard';
import UpgradeDetails from './UserPages/Upgrade';
import UnsubscribePage from './pages/UnsubscribePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ErrorPage from './pages/errorPage';

// Inject the Shopify API key
function injectShopifyApiKeyMetaTag() {
  const existingMeta = document.querySelector('meta[name="shopify-api-key"]');
  if (!existingMeta) {
    const meta = document.createElement('meta');
    meta.name = 'shopify-api-key';
    meta.content = process.env.REACT_APP_SHOPIFY_API_KEY || '';
    document.head.appendChild(meta);
  }
}

// Initialize Shopify App Bridge
function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');

  if (!host) return;

  if (window.self !== window.top) {
    const waitForBridge = () => {
      const bridge = window['app-bridge'];
      const apiKey = process.env.REACT_APP_SHOPIFY_API_KEY;

      if (!bridge || !bridge.default || !apiKey) {
        return setTimeout(waitForBridge, 50);
      }

      const AppBridge = bridge.default;
      const app = AppBridge({
        apiKey,
        host,
        forceRedirect: true,
      });

      window.appBridge = app;
    };

    waitForBridge();
  }
}

injectShopifyApiKeyMetaTag();
initShopifyAppBridge();

// ✅ Router: Use wildcard match for dashboard and upgrade URLs
const router = createHashRouter([
  { path: '/', element: <Homepage /> },
  { path: '/features', element: <FeaturesPage /> },
  { path: '/contact', element: <Contact /> },
  { path: '/about', element: <About /> },
  { path: '/pricing', element: <Pricing /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/log-in', element: <LogIn /> },
  { path: '/unsubscribe', element: <UnsubscribePage /> },
  { path: '/privacy-policy', element: <PrivacyPolicy /> },
  { path: '/terms', element: <TermsOfService /> },

  // ✅ Match dashboard and upgrade pages under /user/...
  { path: '/dashboard/*', element: <Dashboard /> },
  { path: '/upgrade-plan/*', element: <UpgradeDetails /> },

  { path: '*', element: <ErrorPage /> },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
