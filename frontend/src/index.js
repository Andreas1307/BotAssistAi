
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Homepage from './pages/homepage';
import Error from './pages/errorPage';
import FeaturesPage from './pages/featuresPage';
import Contact from './pages/contact';
import About from './pages/about';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Pricing from './pages/pricing';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import Dashboard from './UserPages/dashboard';
import UpgradeDetails from './UserPages/Upgrade';
import UnsubscribePage from './pages/UnsubscribePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const router = createBrowserRouter([
  {
    path: "/:user/dashboard",
    element: <Dashboard />
  },
  {
    path: "/:user/upgrade-plan",
    element: <UpgradeDetails />
  },
  {
    path: "/unsubscribe",
    element: <UnsubscribePage />
  },
  {
    path: "/",
    element: <Homepage />
  },
  {
    path: "/features",
    element: <FeaturesPage />
  },
  {
    path: "/contact",
    element: <Contact />
  },
  {
    path: "/about",
    element: <About />
  },
  {
    path: "pricing", 
    element: <Pricing />
  },
  {
    path: "/sign-up",
    element: <SignUp />
  },
  {
    path: "log-in",
    element: <LogIn />
  },
  {
    path: "privacy-policy",
    element: <PrivacyPolicy />
  },
  {
    path: "/terms",
    element: <TermsOfService />
  },
  {
    path: "*", 
    element: <Error />
  }
])


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

