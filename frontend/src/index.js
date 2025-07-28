import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import Homepage from './pages/homepage';
import Error from './pages/errorPage';
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

const initShopifyAppBridge = () => {
  const query = new URLSearchParams(window.location.search);
  const host = query.get("host");
  const shop = query.get("shop");

  if (!host || !shop) {
    console.warn("Missing host/shop in query");
    return;
  }

  // ✅ Redirect to root with hash router if deep link
  if (window.location.pathname !== "/" && !window.location.hash) {
    window.location.replace(`/#/?shop=${shop}&host=${host}`);
    return;
  }

  if (window.self !== window.top) {
    const checkAppBridgeReady = () => {
      if (!window["app-bridge"] || !window["app-bridge"].default) {
        return setTimeout(checkAppBridgeReady, 50);
      }

      const AppBridge = window["app-bridge"].default;

      const app = AppBridge({
        apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      });

      window.appBridge = app;
      console.log("✅ App Bridge initialized with host:", host);
    };

    checkAppBridgeReady();
  }
};

initShopifyAppBridge();


// ✅ Routes
const router = createHashRouter([
  { path: "/:user/dashboard", element: <Dashboard /> },
  { path: "/:user/upgrade-plan", element: <UpgradeDetails /> },
  { path: "/unsubscribe", element: <UnsubscribePage /> },
  { path: "/", element: <Homepage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/contact", element: <Contact /> },
  { path: "/about", element: <About /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/log-in", element: <LogIn /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "*", element: <Error /> }
]);

// ✅ Mount App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
