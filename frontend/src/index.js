import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
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
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const AppBridgeInitializer = ({ children }) => {
  useEffect(() => {
    const initAppBridge = () => {
      if (window.top === window.self) {
        // Not inside iframe: redirect into Shopify admin
        const urlParams = new URLSearchParams(window.location.search);
        const shop = urlParams.get("shop");
        const host = urlParams.get("host");

        if (shop && host) {
          window.location.href = `https://${shop}/admin/apps/${process.env.REACT_APP_SHOPIFY_API_KEY}?shop=${shop}&host=${host}`;
        }
      } else {
        // Inside iframe: initialize App Bridge
        if (!window.appBridge && window["app-bridge"]) {
          const AppBridge = window["app-bridge"].default;
          const createApp = AppBridge;
          const app = createApp({
            apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
            host: new URLSearchParams(window.location.search).get("host"),
            forceRedirect: true,
          });
          window.appBridge = app;
        }
      }
    };

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@shopify/app-bridge';
    script.async = true;
    script.onload = initAppBridge;
    document.body.appendChild(script);
  }, []);

  return children;
};

const router = createBrowserRouter([
  { path: "/:user/dashboard", element: <Dashboard /> },
  { path: "/:user/upgrade-plan", element: <UpgradeDetails /> },
  { path: "/unsubscribe", element: <UnsubscribePage /> },
  { path: "/", element: <Homepage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/contact", element: <Contact /> },
  { path: "/about", element: <About /> },
  { path: "pricing", element: <Pricing /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "log-in", element: <LogIn /> },
  { path: "privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "*", element: <Error /> }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppBridgeInitializer>
      <RouterProvider router={router} />
    </AppBridgeInitializer>
  </React.StrictMode>
);
