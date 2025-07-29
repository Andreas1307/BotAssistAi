import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

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


const initShopifyAppBridge = async () => {
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");

  const isEmbedded = window.top !== window.self;

  if (!host || !isEmbedded) {
    console.log("🛑 Skipping App Bridge init (not embedded or missing host)");
    return;
  }

  const waitForAppBridge = () =>
    new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const AppBridge = window["app-bridge"];
        if (AppBridge?.createApp || AppBridge?.default) {
          clearInterval(interval);
          resolve(AppBridge);
        }
      }, 50);
      setTimeout(() => reject(new Error("App Bridge load timeout")), 5000);
    });

  try {
    const AppBridge = await waitForAppBridge();
    const createAppFn = AppBridge.createApp || AppBridge.default;

    const app = createAppFn({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true, // must be true in production
    });

    window.appBridge = app;
    console.log("✅ Shopify App Bridge initialized");
  } catch (err) {
    console.error("🚫 App Bridge init failed:", err);
  }
};

initShopifyAppBridge();





// 🧭 Define your routes
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

// 📦 Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
