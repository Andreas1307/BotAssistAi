(function () {
  const script = document.currentScript;
  const apiKey = window.BOTASSIST_API_KEY;
  const shop = window.BOTASSIST_SHOP;


  if (!apiKey) {
    console.error("❌ Missing API key on chatbot-loader.js script tag");
    return;
  }
  
  if (!shop) {
    console.error("❌ Missing shop on chatbot-loader.js script tag");
    return;
  }
  
  if (!apiKey || !shop) {
    console.error("❌ BotAssist missing apiKey or shop on loader");
    return;
  }
  

const directory = "https://api.botassistai.com"
  

  // Fetch customization
  fetch(`https://api.botassistai.com/public/chatbot-config?shop=${shop}`)
    .then(res => res.json())
    .then(config => {
      window.BOTASSIST_CONFIG = config;

      const root = document.documentElement;

root.style.setProperty("--ai-background", config.background);
root.style.setProperty("--ai-chatbot-bg", config.chatbotBackground);
root.style.setProperty("--conversation-boxes", config.chatBoxBackground);
root.style.setProperty("--ai-input", config.chatInputBackground);
root.style.setProperty("--ai-button", config.chatBtn);
root.style.setProperty("--ai-website-chat-btn", config.websiteChatBtn);
root.style.setProperty("--ai-website-question", config.websiteQuestion);
root.style.setProperty("--need-help-text", config.needHelpTextColor);
root.style.setProperty("--font-color", config.textColor);
root.style.setProperty("--ai-border", config.borderColor);



      const s = document.createElement("script");
      s.src = "https://api.botassistai.com/client-chatbot.js";
      s.defer = true;
      document.body.appendChild(s);
    })
    .catch(err => console.error("BotAssist config load failed", err));

  })