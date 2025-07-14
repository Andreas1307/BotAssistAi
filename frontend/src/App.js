// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  AppBridgeProvider
} from "./utils/AppBridgeProvider.jsx";
import Integrations from "./UserComponents/Integrations";

const urlParams = new URLSearchParams(window.location.search);
const host = urlParams.get("host");
const shop = urlParams.get("shop");

const config = {
  apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
  host,
  forceRedirect: true,
};

function App() {

  return (
    <AppBridgeProvider config={config}>
      <Helmet>
        <title>BotAssist AI</title>
        <meta name="description" content="BotAssist AI — the ultimate AI chatbot to enhance your website support." />
        <meta name="keywords" content="AI chatbot, customer support, automation" />
        <link rel="canonical" href="https://www.botassistai.com" />
        <script
          src="https://unpkg.com/@shopify/app-bridge@3.7.10/umd/index.js"
          crossOrigin="anonymous"
        ></script>
      </Helmet>
      <Router>
        <Routes>
          <Route path="/integrations" element={<Integrations />} />
        </Routes>
      </Router>
    </AppBridgeProvider>
  );
}

export default App;
