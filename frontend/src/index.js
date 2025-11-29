import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./styling/homepage.css";

import { initShopifyAppBridge } from './utils/initShopifyAppBridge';

import Homepage from './pages/homepage';
import Error from './pages/errorPage';
import FeaturesPage from './pages/featuresPage';
import Contact from './pages/contact';
import About from './pages/about';
import Pricing from './pages/pricing';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import Dashboard from './UserPages/dashboard';
import AdminPage from './UserPages/admin';
import UpgradeDetails from './UserPages/Upgrade';
import UnsubscribePage from './pages/UnsubscribePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ShopifyLoader from './pages/ShopifyLoader';

const router = createBrowserRouter([
  { path: "/:user/dashboard", element: <Dashboard /> },
  { path: "/shopify/dashboard", element: <Dashboard /> },
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
  { path: `/admin/:key`, element: <AdminPage /> },
  { path: `/shopify`, element: <ShopifyLoader /> },
  { path: "*", element: <Error /> }
]);

const params = new URLSearchParams(window.location.search);
const shop = params.get("shop");
const host = params.get("host");


if (shop && host) {
  await initShopifyAppBridge();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ToastContainer position="top-center" portalTarget={document.body} />
  </React.StrictMode>
);