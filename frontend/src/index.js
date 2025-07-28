import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  createHashRouter,
  RouterProvider,
  Navigate,
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

+
const injectShopifyMetaTag = () => {
  const existingMeta = document.querySelector('meta[name="shopify-api-key"]');
  if (!existingMeta) {
    const meta = document.createElement('meta');
    meta.name = 'shopify-api-key';
    meta.content = process.env.REACT_APP_SHOPIFY_API_KEY;
    document.head.appendChild(meta);
    console.log("✅ Injected shopify-api-key meta tag");
  }
};
injectShopifyMetaTag();




function initShopifyAppBridge() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');
  const shop = params.get('shop');

  if (!host || !shop) {
    console.warn('Missing Shopify host or shop params', { host, shop });
    return;
  }

  if (window.self !== window.top) {
    const waitForBridge = () => {
      const bridge = window['app-bridge'];
      if (!bridge || !bridge.default) {
        return setTimeout(waitForBridge, 50);
      }

      const AppBridge = bridge.default;
      const app = AppBridge({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      });

      window.appBridge = app;
      console.log('✅ Shopify App Bridge initialized:', app);
    };

    waitForBridge();
  }
}

initShopifyAppBridge();

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
  { path: '/:user/dashboard', element: <Dashboard /> },
  { path: '/:user/upgrade-plan', element: <UpgradeDetails /> },
  { path: '*', element: <ErrorPage /> },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
