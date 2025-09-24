// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { getAppBridgeInstance } from "./utils/app-bridge";

import Homepage from "./pages/homepage";
import FeaturesPage from "./pages/featuresPage";
import Contact from "./pages/contact";
import About from "./pages/about";
import Pricing from "./pages/pricing";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Dashboard from "./UserPages/dashboard";
import AdminPage from "./UserPages/admin";
import UpgradeDetails from "./UserPages/Upgrade";
import UnsubscribePage from "./pages/UnsubscribePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Error from "./pages/errorPage";

// Initialize App Bridge
getAppBridgeInstance();

// Router
const router = createBrowserRouter([
  { path: "/", element: <Homepage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/contact", element: <Contact /> },
  { path: "/about", element: <About /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/log-in", element: <LogIn /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/unsubscribe", element: <UnsubscribePage /> },
  { path: "/:user/dashboard", element: <Dashboard /> },
  { path: "/:user/upgrade-plan", element: <UpgradeDetails /> },
  { path: "/admin/:key", element: <AdminPage /> },
  // Fallback: redirect to homepage (ignores query params)
  { path: "*", element: <Navigate to="/" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
