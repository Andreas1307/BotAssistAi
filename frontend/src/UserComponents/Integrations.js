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
  FaTimes
} from "react-icons/fa";
import "../styling/Integrations.css";
import directory from '../directory';
import { ToastContainer, toast } from "react-toastify";
import { formatDistanceToNow, set } from "date-fns";
import axios from "../utils/axiosShopify.js"
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
  const [chatBotConfig, setChatBotConfig] = useState(false)
  const [shopifyUser, setShopifyUser] = useState(false)
  const [shopifyDomain, setShopifyDomain] = useState("")
  const [colors, setColors] = useState({
    background: '#f2f2f2',
    chatbotBackground: '#092032',
    chatBoxBackground: '#112B3C',
    chatInputBackground: '#ffffff',
    chatInputTextColor: '#000000',
    chatBtn: '#00F5D4',
    websiteChatBtn: '#00F5D4',
    websiteQuestion: '#ffffff',
    needHelpTextColor: '#00F5D4',
    textColor: '#cccccc',
    borderColor: '#00F5D4'
  });
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
      proTip:
        "Add this just before the closing </body> tag of your HTML file for best performance. Make sure to replace 'YOUR API KEY HERE' with your actual API key from BotAssistAI.",
      Html: `
      <style>
       :root {
      --ai-background: ${colors.chatbotBackground}; 
      --ai-button: ${colors.chatBtn};
      --ai-input: ${colors.chatInputBackground};
      --ai-input-font-color: ${colors.chatInputTextColor};             
      --ai-border: #000;                         
      --ai-website-chat-btn: ${colors.websiteChatBtn};              
      --ai-website-question: ${colors.websiteQuestion};              
      --font-color: ${colors.textColor};                        
      --conversation-boxes: ${colors.chatBoxBackground};
      --need-help-text: ${colors.needHelpTextColor};
    }
      </style>
       <script src="https://api.botassistai.com/client-chatbot.js" api-key="YOUR API KEY HERE" defer></script>
    `,
    },
    {
      proTip:
        "Add <Chatbot /> to your main layout or App.js to load the chatbot across all pages.",
      React: `
      import { useEffect } from "react";
    
      function Chatbot() {
        useEffect(() => {
          // Add dynamic CSS style to the document head
          const style = document.createElement("style");
          style.innerHTML = \`
            :root {
               --ai-background: ${colors.chatbotBackground}; 
               --ai-button: ${colors.chatBtn};
               --ai-input: ${colors.chatInputBackground};
               --ai-input-font-color: ${colors.chatInputTextColor};             
               --ai-border: #000;                         
               --ai-website-chat-btn: ${colors.websiteChatBtn};              
               --ai-website-question: ${colors.websiteQuestion};              
               --font-color: ${colors.textColor};                        
               --conversation-boxes: ${colors.chatBoxBackground};
               --need-help-text: ${colors.needHelpTextColor};
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
      `,
    },
    {
      proTip:
        "Place this in a layout or root component to load the chatbot globally across your Vue app.",
      Vue: `
      mounted() {
        const style = document.createElement("style");
        style.innerHTML = \`
          :root {
          --ai-background: ${colors.chatbotBackground}; 
          --ai-button: ${colors.chatBtn};
          --ai-input: ${colors.chatInputBackground};
          --ai-input-font-color: ${colors.chatInputTextColor};             
          --ai-border: #000;                         
          --ai-website-chat-btn: ${colors.websiteChatBtn};              
          --ai-website-question: ${colors.websiteQuestion};              
          --font-color: ${colors.textColor};                        
          --conversation-boxes: ${colors.chatBoxBackground};
          --need-help-text: ${colors.needHelpTextColor};
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
      `,
    },
    {
      proTip:
        "Add this to base.html to load the chatbot on all pages. Pass needed variables in the template context.",
      Python: `
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Integration</title>

    <style>
        :root {
          --ai-background: {{ chatbotBackground | default("#2D5FD0") }};
          --ai-button: {{ chatBtn | default("#4F8BFF") }};
          --ai-input: {{ chatInputBackground | default("#000") }};
          --ai-input-font-color: {{ chatInputTextColor | default("#fff") }};
          --ai-border: {{ ai_border | default("#000") }};
          --ai-website-chat-btn: {{ websiteChatBtn | default("#000") }};
          --ai-website-question: {{ websiteQuestion | default("#3A7EFF") }};
          --font-color: {{ textColor | default("#ff0000") }};
          --conversation-boxes: {{ chatBoxBackground | default("blue") }};
          --need-help-text: {{ needHelpTextColor | default("white") }};
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
      proTip:
        "Insert into your layout file (e.g. layout.html or base.jsp) before </body> to load globally.",
      Java: `
      <style>
          :root {
            --ai-background: ${colors.chatbotBackground}; 
            --ai-button: ${colors.chatBtn};
            --ai-input: ${colors.chatInputBackground};
            --ai-input-font-color: ${colors.chatInputTextColor};             
            --ai-border: #000;                         
            --ai-website-chat-btn: ${colors.websiteChatBtn};              
            --ai-website-question: ${colors.websiteQuestion};              
            --font-color: ${colors.textColor};                        
            --conversation-boxes: ${colors.chatBoxBackground};
            --need-help-text: ${colors.needHelpTextColor};
  }
</style>
<script src="https://api.botassistai.com/client-chatbot.js" api-key="YOUR_API_KEY_HERE" defer></script>
    `,
    },
    {
      proTip:
        "Add this in your theme’s footer.php file before the closing </body> tag, or  You can also inject it using a plugin like “Insert Headers and Footers”",
      Php: `
      <?php echo '
<style>
  :root {
      --ai-background: ${colors.chatbotBackground}; 
      --ai-button: ${colors.chatBtn};
      --ai-input: ${colors.chatInputBackground};
      --ai-input-font-color: ${colors.chatInputTextColor};             
      --ai-border: #000;                         
      --ai-website-chat-btn: ${colors.websiteChatBtn};              
      --ai-website-question: ${colors.websiteQuestion};              
      --font-color: ${colors.textColor};                        
      --conversation-boxes: ${colors.chatBoxBackground};
      --need-help-text: ${colors.needHelpTextColor};
  }
</style>
<script src="https://api.botassistai.com/client-chatbot.js" api-key="YOUR_API_KEY_HERE" defer></script>
'; ?>
      `,
    },
    {
      proTip:
        "Place this in pages/_app.js to load the chatbot globally in your Next.js app.",
      NextJs: `
    import { useEffect } from 'react';
    
    function MyApp({ Component, pageProps }) {
      useEffect(() => {
        // Inject styles
        const style = document.createElement('style');
        style.innerHTML = \`
          :root {
            --ai-background: ${colors.chatbotBackground}; 
            --ai-button: ${colors.chatBtn};
            --ai-input: ${colors.chatInputBackground};
            --ai-input-font-color: ${colors.chatInputTextColor};             
            --ai-border: #000;                         
            --ai-website-chat-btn: ${colors.websiteChatBtn};              
            --ai-website-question: ${colors.websiteQuestion};              
            --font-color: ${colors.textColor};                        
            --conversation-boxes: ${colors.chatBoxBackground};
            --need-help-text: ${colors.needHelpTextColor};
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
      `,
    },
    {
      proTip:
        "(Online Store 2.0 – via theme.liquid). Add this to layout/theme.liquid right before </body>:",
      Shopify: `
     <style>
  :root {
      --ai-background: ${colors.chatbotBackground}; 
      --ai-button: ${colors.chatBtn};
      --ai-input: ${colors.chatInputBackground};
      --ai-input-font-color: ${colors.chatInputTextColor};             
      --ai-border: #000;                         
      --ai-website-chat-btn: ${colors.websiteChatBtn};              
      --ai-website-question: ${colors.websiteQuestion};              
      --font-color: ${colors.textColor};                        
      --conversation-boxes: ${colors.chatBoxBackground};
      --need-help-text: ${colors.needHelpTextColor};
  }
</style>
<script src="https://api.botassistai.com/client-chatbot.js" api-key="YOUR_API_KEY_HERE" defer></script>
      `,
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/auth-check`, {
          withCredentials: true,
        });
        setUser(res.data.user);
        setShopifyDomain(res.data.user.shopify_shop_domain)
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
        const res = await axios.get(`/get-api`, {
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


  useEffect(() => {
    const fetchShopifyUser = async () => {
      if (!user || !user.user_id) return;
      try {
        const response = await axios.get(`/check-shopify-user`, {params: { id: user.user_id }})
        setShopifyUser(response.data.data)
        setShopifyDomain(response.data.domain)
      } catch(e) {
        console.log("An error occured checking the shopify user", e)
      }
    } 
    fetchShopifyUser()
  }, [user])


  useEffect(() => {
    const getShopifyStyles = async () => {
      if (!shopifyDomain) return;
      try {
        const response = await axios.get(`/get-shopify-styles`, {
          params: { shop: shopifyDomain }
        });
        setColors(response.data.data);
      } catch (e) {
        console.log("Error occurred while trying to fetch the Shopify styles", e);
      }
    };
    getShopifyStyles();
  }, [user]);



  const redirectToInstall = async (shop) => {
    try {
      const response = await axios.post(`/chatbot-config-shopify`, {
        shop,
        colors,
      });
      if (response.data.data === true) {
        setChatBotConfig(false)
      }
    } catch (e) {
      console.log("An error occured while trying to send the chatbot config", e)
    }
  };
  

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
        const res = await axios.get(`/get-bot-status`, {
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
      await axios.get(`/set-bot-status`, {
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
        const res = await axios.get(`/get-api`, {
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
      await axios.get(`/reset-bot`, {
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
        const res = await axios.get(`/get-connected`, {
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
      {chatBotConfig && (
  <div className="chatbotConfigBigDiv">
  <div className="chatbotConfigDiv">
    <div className="chabotConfig">
      <span onClick={() => setChatBotConfig(false)} className="chatConfig-x"><FaTimes /></span>
      <div className="config">
        <h2>Customize Your Chatbot</h2>
        <span>
          <div>
<p>Background:</p>
<input type="color" 
value={colors.background}
onChange={(e) => setColors({ ...colors, background: e.target.value })}
/>
</div>
<div>
<p>Chatbot Background:</p>
<input type="color" 
value={colors.chatbotBackground}
onChange={(e) => setColors({ ...colors, chatbotBackground: e.target.value })}
/>
</div>
<div>
<p>ChatBox Background:</p>
<input type="color" 
value={colors.chatBoxBackground}
onChange={(e) => setColors({ ...colors, chatBoxBackground: e.target.value })}
/>
</div>
<div>
<p>Chat Input:</p>
<input type="color" 
value={colors.chatInputBackground}
onChange={(e) => setColors({ ...colors, chatInputBackground: e.target.value })}
/>
</div>
<div>
<p>Chat Input Color:</p>
<input type="color" 
value={colors.chatInputTextColor}
onChange={(e) => setColors({ ...colors, chatInputTextColor: e.target.value })}
/>
</div>
<div>
<p>Chat Btn:</p>
<input type="color" 
value={colors.chatBtn}
onChange={(e) => setColors({ ...colors, chatBtn: e.target.value })}
/>
</div>
<div>
<p>Website Chat Btn:</p>
<input type="color" 
value={colors.websiteChatBtn}
onChange={(e) => setColors({ ...colors, websiteChatBtn: e.target.value })}
/>
</div>
<div>
<p>Website question:</p>
<input type="color" 
value={colors.websiteQuestion}
onChange={(e) => setColors({ ...colors, websiteQuestion: e.target.value })}
/>
</div>
<div>
<p>Need Help Text Color:</p>
<input type="color" 
value={colors.needHelpTextColor}
onChange={(e) => setColors({ ...colors, needHelpTextColor: e.target.value })}
/>
</div>
<div>
<p>Text Color:</p>
<input type="color" 
value={colors.textColor}
onChange={(e) => setColors({ ...colors, textColor: e.target.value })}
/>
</div>
        </span>

      </div>


     <div className="chatbot" style={{ backgroundColor: colors.background }}>
<div className="chatbot-div" style={{ backgroundColor: colors.chatbotBackground }}>
<img draggable="false" src={`${process.env.PUBLIC_URL}/img/BigLogo.png`} />
<div className="chat-div" >
<div className="chat-1" style={{ color: colors.textColor, backgroundColor: colors.chatBoxBackground }}>Hey, cau you help me ?</div>
<div className="chat-2" style={{ color: colors.textColor, backgroundColor: colors.chatBoxBackground }}>Yes, sure . Let me know about what product</div>
</div>
<div className="chat-inputs" style={{ backgroundColor: colors.chatInputBackground }}>
<input
  type="text"
  placeholder="Enter your question"
  style={{
    backgroundColor: colors.chatInputBackground,
    color: colors.chatInputTextColor,
    borderColor: colors.borderColor
  }}
/>
<button style={{ backgroundColor: colors.chatBtn, color: colors.textColor }}>
  Send
</button>
</div>
</div>
<div
className="div-chatbot"
style={{
color: colors.needHelpTextColor,
borderColor: colors.borderColor
}}
>
<div style={{
background: colors.websiteQuestion}}><p style={{
color: colors.needHelpTextColor }}>Need Help?</p></div>
<span  style={{ backgroundColor: colors.websiteChatBtn }}>💬</span>
</div>
<button onClick={() => {
  if(shopifyUser) {
    redirectToInstall(shopifyDomain)
    setChatBotConfig(false)
  } else {
    setChatBotConfig(false)
  }
}} className="chatbot-config-save">Save</button>
      </div>
    </div>
  </div>
</div>
)}
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
            {shopifyUser ? "Chatbot Customization" : "Copy & Embed Code"}
          </h3>
          <button
  className="configChatBtn"
  onClick={() => {
    if (window.top !== window.self) {
      alert("This action is not available inside the Shopify admin. Please open the app in a new tab.");
    } else {
      setChatBotConfig(true);
    }
  }}
>
  Configure Chatbot
</button>

{!shopifyUser && (
  <>   
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
  </>
      )}
        </div>
      

    {!shopifyUser && (
  <>    
        {codeSnippets.find(snippet => snippet[selectedLanguage])?.proTip && (
  <p className="pro-tip">
    💡 {codeSnippets.find(snippet => snippet[selectedLanguage])?.proTip}
  </p>
)}
        <pre>{codeSnippets.find(snippet => snippet[selectedLanguage])?.[selectedLanguage]}</pre>
        <button className="copy-btn" onClick={handleCopy}>
          <FaCopy /> {copied ? "Copied!" : "Copy Code"}
        </button>

</>
)}

      </div>
      
   

      <div>
        <ToastContainer />
      </div>
    </main>
  );
};

export default Integrations;
