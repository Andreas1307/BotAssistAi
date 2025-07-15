import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AppBridgeProvider } from "./utils/AppBridgeProvider";
import Integrations from "./UserComponents/Integrations";

const urlParams = new URLSearchParams(window.location.search);
const host = urlParams.get("host");

const config = {
  apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
  host,
  forceRedirect: true,
};

function AppContent() {
  return (
    <>
      <Helmet>
        <title>BotAssist AI</title>
        <meta
          name="description"
          content="BotAssist AI — the ultimate AI chatbot to enhance your website support."
        />
        <meta name="keywords" content="AI chatbot, customer support, automation" />
        <link rel="canonical" href="https://www.botassistai.com" />
      </Helmet>

      <Router>
        <Routes>
          <Route path="/integrations" element={<Integrations />} />
        </Routes>
      </Router>
    </>
  );
}

function App() {
  if (host) {
    // Shopify user — wrap with App Bridge
    return (
      <AppBridgeProvider config={config}>
        <AppContent />
      </AppBridgeProvider>
    );
  }

  // Non-Shopify user — skip App Bridge
  return <AppContent />;
}

export default App;
