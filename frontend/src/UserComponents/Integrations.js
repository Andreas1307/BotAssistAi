import React, { useEffect, useState } from "react";
import {
  FaLink,
  FaCopy,
  FaCode,
  FaPowerOff,
  FaSyncAlt,
  FaSlidersH,
  FaEyeSlash,
  FaEye,
} from "react-icons/fa";
import "../styling/Integrations.css";
import directory from '../directory';
import { ToastContainer, toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";

const Integrations = () => {
  const [bgColor, setBgColor] = useState("#007bff");
  const [position, setPosition] = useState("bottom-right");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi! How can I help you?"
  );
  const [copied, setCopied] = useState(false);
  const [errorLogs, setErrorLogs] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("Html");
  const [apiKey, setApiKey] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [copiedApi, setCopiedApi] = useState(false);
  const [lastConnected, setLastConnected] = useState(null);
  const [connected, setConnected] = useState(false);
  const [aiBot, setAiBot] = useState(false);
  let toastId;

  const showErrorNotification = () => {
    toast.error("Something went wrong. Please try again.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        borderRadius: "8px",
        fontSize: "16px",
        backgroundColor: "#330000",
        color: "#fff",
      },
      progressStyle: {
        background: "#ff4d4f",
      },
    });
  };

  const codeSnippets = [
    {
      proTip: "Add this just before the closing </body> tag of your HTML file for best performance. Make sure to replace 'YOUR API KEY HERE' with your actual API key from BotAssistAI.",
      Html: `
      <style>
       :root {
       /* Change to your preffered colors */
     --ai-background: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
     --ai-button: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
     --ai-input: #000;
 --ai-input-font-color: #fff;
 --ai-border: #f8f8f8;
 --ai-website-chat-btn: #000;
 --ai-website-question: linear-gradient(135deg, #1E3A8A 20%, #3A7EFF 60%, #00A9FF 100%);
 --font-color: #ff0000;
 --conversation-boxes: blue;
    }
      </style>
       <script src="https://api.botassistai.com/client-chatbot.js" api-key="YOUR API KEY HERE" defer></script>
    `,
    },
    {
      proTip: "Add <Chatbot /> to your main layout or App.js to load the chatbot across all pages.",
      React: `
      import { useEffect } from "react";
    
      function Chatbot() {
        useEffect(() => {
          // Add dynamic CSS style to the document head
          const style = document.createElement("style");
          style.innerHTML = \`
            :root {
               --ai-background: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-button: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-input: #000;
 --ai-input-font-color: #fff;
 --ai-border: #f8f8f8;
 --ai-website-chat-btn: #000;
 --ai-website-question: linear-gradient(135deg, #1E3A8A 20%, #3A7EFF 60%, #00A9FF 100%);
 --font-color: #ff0000;
 --conversation-boxes: blue;
            }
          \`;
          document.head.appendChild(style);
    
          // Dynamically load the chatbot script
          const script = document.createElement("script");
          script.src = "https://api.botassistai.com/client-chatbot.js";
          script.setAttribute("api-key", "YOUR_API_KEY_HERE");
          script.defer = true;
          document.body.appendChild(script);
    
          // Cleanup: Remove the script when the component unmounts
          return () => {
            document.body.removeChild(script);
            document.head.removeChild(style);  // Clean up the dynamically added style as well
          };
        }, []);  // Empty dependency array ensures this runs only once when the component mounts
    
        return null;
      }
    
      export default Chatbot;
      `
    },
    {
      proTip: "Place this in a layout or root component to load the chatbot globally across your Vue app.",
      Vue: `
      mounted() {
        const style = document.createElement("style");
        style.innerHTML = \`
          :root {
             --ai-background: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-button: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-input: #000;
 --ai-input-font-color: #fff;
 --ai-border: #f8f8f8;
 --ai-website-chat-btn: #000;
 --ai-website-question: linear-gradient(135deg, #1E3A8A 20%, #3A7EFF 60%, #00A9FF 100%);
 --font-color: #ff0000;
 --conversation-boxes: blue;
          }
        \`;
        document.head.appendChild(style);
    
        const script = document.createElement("script");
        script.src = "https://api.botassistai.com/client-chatbot.js";
        script.setAttribute("api-key", "YOUR_API_KEY_HERE");
        script.defer = true;
        script.async = true;
        document.body.appendChild(script);
      }
      `
    }
,         
    {
      proTip: "Add this to base.html to load the chatbot on all pages. Pass needed variables in the template context.",
      Python: `
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Integration</title>

    <style>
        :root {
            --ai-background: {{ ai_background | default("linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%)") }};
            --ai-button: {{ ai_button | default("linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%)") }};
            --ai-input: {{ ai_input | default("#000") }};
            --ai-input-font-color: {{ ai_input_font_color | default("#fff") }};
            --ai-border: {{ ai_border | default("#f8f8f8") }};
            --ai-website-chat-btn: {{ ai_website_chat_btn | default("#000") }};
            --ai-website-question: {{ ai_website_question | default("linear-gradient(135deg, #1E3A8A 20%, #3A7EFF 60%, #00A9FF 100%)") }};
            --font-color: {{ font_color | default("#ff0000") }};
            --conversation-boxes: {{ conversation_boxes | default("blue") }};
        }
    </style>

</head>
<body>

<!-- Chatbot Script -->
<script>
    (function() {
        var script = document.createElement("script");
        script.src = "https://api.botassistai.com/client-chatbot.js";
        script.defer = true;

        // Required attributes passed from Django/Jinja
        script.dataset.apiKey = "{{ apiKey }}";
        script.dataset.bgColor = "{{ bgColor | default('#ffffff') }}";
        script.dataset.position = "{{ position | default('bottom-right') }}";
        script.dataset.welcomeMessage = "{{ welcomeMessage | default('Hi! How can I help you today?') }}";

        document.body.appendChild(script);
    })();
</script>

</body>
</html>
    `,
    },
    {
      proTip: "Insert into your layout file (e.g. layout.html or base.jsp) before </body> to load globally.",
      Java: `
      <style>
  :root {
     --ai-background: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-button: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-input: #000;
 --ai-input-font-color: #fff;
 --ai-border: #f8f8f8;
 --ai-website-chat-btn: #000;
 --ai-website-question: linear-gradient(135deg, #1E3A8A 20%, #3A7EFF 60%, #00A9FF 100%);
 --font-color: #ff0000;
 --conversation-boxes: blue;
  }
</style>
<script src="https://api.botassistai.com/client-chatbot.js" api-key="YOUR_API_KEY_HERE" defer></script>
    `,
    },
    {
      proTip: "Add this in your theme’s footer.php file before the closing </body> tag, or  You can also inject it using a plugin like “Insert Headers and Footers”",
      Php: `
      <?php echo '
<style>
  :root {
    --ai-background: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-button: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-input: #000;
 --ai-input-font-color: #fff;
 --ai-border: #f8f8f8;
 --ai-website-chat-btn: #000;
 --ai-website-question: linear-gradient(135deg, #1E3A8A 20%, #3A7EFF 60%, #00A9FF 100%);
 --font-color: #ff0000;
 --conversation-boxes: blue;
  }
</style>
<script src="https://api.botassistai.com/client-chatbot.js" api-key="YOUR_API_KEY_HERE" defer></script>
'; ?>
      `,
    }, {
      proTip: "Place this in pages/_app.js to load the chatbot globally in your Next.js app.",
      NextJs: `
    import { useEffect } from 'react';
    
    function MyApp({ Component, pageProps }) {
      useEffect(() => {
        // Inject styles
        const style = document.createElement('style');
        style.innerHTML = \`
          :root {
             --ai-background: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-button: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-input: #000;
 --ai-input-font-color: #fff;
 --ai-border: #f8f8f8;
 --ai-website-chat-btn: #000;
 --ai-website-question: linear-gradient(135deg, #1E3A8A 20%, #3A7EFF 60%, #00A9FF 100%);
 --font-color: #ff0000;
 --conversation-boxes: blue;
          }
        \`;
        document.head.appendChild(style);
    
        // Inject script
        const script = document.createElement('script');
        script.src = "https://api.botassistai.com/client-chatbot.js";
        script.setAttribute("api-key", "YOUR_API_KEY_HERE");
        script.defer = true;
        script.async = true;
        document.body.appendChild(script);
    
        // Cleanup
        return () => {
          document.body.removeChild(script);
          document.head.removeChild(style);
        };
      }, []);
    
      return <Component {...pageProps} />;
    }
    
    export default MyApp;
      `
    },
    {
      proTip: "(Online Store 2.0 – via theme.liquid). Add this to layout/theme.liquid right before </body>:",
      Shopify: `
     <style>
  :root {
     --ai-background: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-button: linear-gradient(135deg, #2D5FD0 20%, #4F8BFF 60%, #1CA3FF 100%);
 --ai-input: #000;
 --ai-input-font-color: #fff;
 --ai-border: #f8f8f8;
 --ai-website-chat-btn: #000;
 --ai-website-question: linear-gradient(135deg, #1E3A8A 20%, #3A7EFF 60%, #00A9FF 100%);
 --font-color: #ff0000;
 --conversation-boxes: blue;
  }
</style>
<script src="https://api.botassistai.com/client-chatbot.js" api-key="YOUR_API_KEY_HERE" defer></script>
      `,
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${directory}/auth-check`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
        showErrorNotification();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const getApiKey = async () => {
      if (!user) return;
      try {
        const userId = user?.user_id;
        const res = await axios.get(`${directory}/get-api`, {
          params: { userId },
        });
        setApiKey(res.data.key);
      } catch (e) {
        console.log("Error fetching api", e);
        showErrorNotification();
      }
    };
    getApiKey();
  }, [user]);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopiedApi(true);
      setTimeout(() => setCopiedApi(false), 2000);
    });
  };

  const handleCopy = () => {
    const snippet = codeSnippets.find(snippet => snippet[selectedLanguage])?.[selectedLanguage];
    if (snippet) {
      navigator.clipboard.writeText(snippet).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchBotStatus = async () => {
      const userId = user.user_id;
      try {
        const res = await axios.get(`${directory}/get-bot-status`, {
          params: { userId },
        });
        const botEnabled = !!res.data.bool; // Ensure boolean
        setAiBot(botEnabled);
      } catch (e) {
        console.log("Error getting the status of bot", e);
        showErrorNotification();
      }
    };

    fetchBotStatus();
  }, [user]);

  const setBotStatus = async (status) => {
    if (!user) return;
    const userId = user.user_id;
    try {
      await axios.get(`${directory}/set-bot-status`, {
        params: { userId, aiBot: status ? 1 : 0 }, // convert to  1/0 for DB
      });
    } catch (e) {
      console.log("Error occurred with setting bot on or off", e);
      showErrorNotification();
    }
  };

  useEffect(() => {
    const fetchApi = async () => {
      if (!user) {
        return;
      }
      const userId = user.user_id;
      try {
        const res = await axios.get(`${directory}/get-api`, {
          params: { userId },
        });
        setApiKey(res.data.key);
      } catch (e) {
        console.log("Error fetching api", e);
        showErrorNotification();
      }
    };
    fetchApi();
  }, []);

  const LogoutConfirmToast = ({
    closeToast,
    onConfirm,
    reason = "Clear all bot customizations?",
  }) => (
    <div>
      <p>⚠️ {reason}</p> {/* Fallback to default message */}
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => {
            onConfirm();
            closeToast();
          }}
          style={{
            padding: "9px 18px",
            backgroundColor: "#d9534f",
            border: "none",
            fontWeight: 700,
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Yes
        </button>
        <button
          onClick={closeToast}
          style={{
            padding: "9px 18px",
            fontWeight: 700,
            backgroundColor: "#6c757d",
            border: "none",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const showNotification = (m) => {
    if (!toast.isActive(toastId)) {
      toastId = toast.success(m, {
        toastId: "unique-notification-id", // Helps prevent duplicates
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const showLogoutConfirm = (onConfirm, reason) => {
    try {
      toast.info(
        ({ closeToast }) => (
          <LogoutConfirmToast
            closeToast={closeToast}
            onConfirm={onConfirm}
            reason={reason}
          />
        ),
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          draggable: false,
          toastId: "logout-confirm",
        }
      );
    } catch (error) {
      console.log("Error displaying logout confirmation toast:", error);
    }
  };

  const handleReset = async () => {
    if (!user) {
      showErrorNotification();
    }
    const userId = user.user_id;
    try {
      await axios.get(`${directory}/reset-bot`, {
        params: { userId },
      });
      setTimeout(() => {
        showNotification("Note , your bot will not work unless you train it");
      }, 1500);
    } catch (e) {
      console.log("Error with reseting bot data", e);
      showErrorNotification();
    }
  };

  //checkIf Api is connected
  useEffect(() => {
    if (!user) return;

    const checkConnected = async () => {
      try {
        const res = await axios.get(`${directory}/get-connected`, {
          params: { userId: user.user_id },
        });

        if (res.data.connected) {
          setConnected(true);
          setLastConnected(res.data.last_connected);
        } else {
          setConnected(false);
        }
      } catch (e) {
        console.log("Error fetching the bot status (connected)", e);
        showErrorNotification();
      }
    };

    checkConnected();

    const interval = setInterval(checkConnected, 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <main className="integrations-page">
      <div className="dashboard-widgets">
        <div className="status-panel">
          <h2>System Status</h2>
          <ul>
            <li>✅ AI Bot: {aiBot ? "Online" : "Offline"}</li>
            <li>✅ API: {connected ? "Connected" : "Not Connected"}</li>
            <li>
              ⏱️ Last Active:{" "}
              {lastConnected
                ? formatDistanceToNow(new Date(lastConnected), {
                    addSuffix: true,
                  })
                : "N/A"}
            </li>
          </ul>
        </div>

        <div className="quick-actions">
          <h2>Quick AI Actions</h2>
          <div className="action-btns">
            <button
              style={{
                background: aiBot ? "red" : "green",
              }}
              className="quick-btn"
              onClick={() => {
                const newStatus = !aiBot;
                setAiBot(newStatus);
                setBotStatus(newStatus);
              }}
            >
              <FaPowerOff className="quick-icon" />
              {aiBot ? "Disable AI" : "Enable AI"}
            </button>
            <button
              className="quick-btn"
              onClick={() => showLogoutConfirm(handleReset)}
            >
              <FaSyncAlt /> Reset Bot
            </button>
            <button className="quick-btn">
              <a href="#botTraining">
                <FaSlidersH /> Customize Bot
              </a>
            </button>
          </div>
        </div>
      </div>

      <div className="api-div">
        <span>
          <h2 className="api-title">
            <FaLink className="api-icon" /> Your Unique Api
          </h2>
          <div className="api-btns">
            <button onClick={() => setShow(!show)}>
              {show ? (
                <>
                  <FaEyeSlash
                    style={{
                      marginRight: "6px",
                      fontSize: "18.5px",
                      marginBottom: "-3.5px",
                    }}
                  />
                  Hide
                </>
              ) : (
                <>
                  <FaEye
                    style={{
                      marginRight: "6px",
                      fontSize: "18.5px",
                      marginBottom: "-3.5px",
                    }}
                  />
                  Show
                </>
              )}
            </button>
            <button onClick={handleCopyApiKey}>
              <FaCopy style={{ marginBottom: "-3px" }} />{" "}
              {copiedApi ? "Copied!" : "Copy"}
            </button>
          </div>
        </span>
        <input type={show ? "text" : "password"} value={apiKey} readOnly />
      </div>

      <div className="code-snippet">
        <div className="languages">
          <h3>
            <FaCode className="code-icon" />
            Copy & Embed Code
          </h3>
          <select className="inteSelect" onChange={(e) => setSelectedLanguage(e.target.value)} value={selectedLanguage}>
  {codeSnippets.map((snippet, index) => {
    const language = Object.keys(snippet).find(key => key !== "proTip");
    return (
      <option key={index}  value={language}>
        {language}
      </option>
    );
  })}
</select>
        </div>
        {codeSnippets.find(snippet => snippet[selectedLanguage])?.proTip && (
  <p className="pro-tip">
    💡 {codeSnippets.find(snippet => snippet[selectedLanguage])?.proTip}
  </p>
)}
        <pre>{codeSnippets.find(snippet => snippet[selectedLanguage])?.[selectedLanguage]}</pre>
        <button className="copy-btn" onClick={handleCopy}>
          <FaCopy /> {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      <div>
        <ToastContainer />
      </div>
    </main>
  );
};

export default Integrations;
