// App.jsx
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { ShopifyAppBridgeProvider } from "./utils/AppBridgeProvider"; // renamed for clarity
import Integrations from "./UserComponents/Integrations";
import { ensureEmbeddedApp } from './utils/redirectToEmbeddedApp';

function App() {
  useEffect(() => {
    ensureEmbeddedApp(); // only runs once on mount
  }, []);

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

      <ShopifyAppBridgeProvider>
        <div style={{ padding: "1rem" }}>
          <h1>BotAssist Dashboard</h1>
          <Integrations />
        </div>
      </ShopifyAppBridgeProvider>
    </>
  );
}

export default App;
