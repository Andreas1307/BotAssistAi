import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import Integrations from "./UserComponents/Integrations";

function App() {
  return (
    <>
      <Helmet>
        <title>BotAssist AI</title>
        <meta name="description" content="BotAssist AI — the ultimate AI chatbot to enhance your website support." />
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

export default App;
