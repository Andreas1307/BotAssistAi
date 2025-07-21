import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';

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

const router = createBrowserRouter([
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

// Wait for App Bridge before rendering React
function waitForAppBridge(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (typeof window?.Shopify?.AppBridge?.createApp === "function") {
        resolve();
      } else if (Date.now() - start >= timeout) {
        reject(new Error("App Bridge load timed out"));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

waitForAppBridge()
  .catch((err) => {
    console.warn("⚠️ Proceeding without App Bridge:", err.message);
  })
  .finally(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    );
  });
