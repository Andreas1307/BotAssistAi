// App.jsx
import React from "react";
import { Helmet } from "react-helmet";
import { AppBridgeProvider } from "./utils/AppBridgeProvider";
import Integrations from "./UserComponents/Integrations";

function App() {
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

      <AppBridgeProvider>
        <div style={{ padding: "1rem" }}>
          <h1>BotAssist Dashboard</h1>
          <Integrations />
        </div>
      </AppBridgeProvider>
    </>
  );
}

export default App;
