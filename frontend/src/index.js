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
  const host = new URLSearchParams(window.location.search).get("host");
  if (!host || window.self === window.top) {
    // Not embedded or no host param — skip App Bridge
    return;
  }

  // Wait for App Bridge to load (avoid race condition)
  const waitForAppBridge = () => {
    return new Promise((resolve, reject) => {
      const maxRetries = 100;
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const AppBridge = window["app-bridge"];
        if (AppBridge?.createApp) {
          clearInterval(interval);
          resolve(AppBridge);
        } else if (attempts > maxRetries) {
          clearInterval(interval);
          reject(new Error("App Bridge did not load in time"));
        }
      }, 50);
    });
  };

  try {
    const AppBridge = await waitForAppBridge();
    const app = AppBridge.createApp({
      apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
      host,
      forceRedirect: true, // ✅ use true for production — but test with false to avoid dev redirect loop
    });

    window.appBridge = app;
    console.log("✅ Shopify App Bridge initialized");
  } catch (err) {
    console.error("🚫 Failed to initialize App Bridge:", err);
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
