(function () {
  const script = document.currentScript;
  const apiKey = window.BOTASSIST_API_KEY;
  const shop = window.BOTASSIST_SHOP;


  if (!apiKey) {
    console.error("❌ Missing API key on chatbot-loader.js script tag");
    return;
  }

  let conversationId = localStorage.getItem("botassist_conversation_id");
  if (!conversationId) {
    conversationId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random();
    localStorage.setItem("botassist_conversation_id", conversationId);
  }

  
  if (!shop) {
    console.error("❌ Missing shop on chatbot-loader.js script tag");
    return;
  }
  

const directory = "https://api.botassistai.com"
  

  // Fetch customization
  fetch(`https://api.botassistai.com/public/chatbot-config?shop=${shop}`)
    .then(res => res.json())
    .then(config => {
      window.BOTASSIST_CONFIG = config;

      const root = document.documentElement;

      root.style.setProperty("--ai-background", config.chatbotBackground);
      root.style.setProperty("--conversation-boxes", config.chatBoxBackground);
      root.style.setProperty("--ai-input", config.chatInputBackground);
      root.style.setProperty("--ai-input-font-color", config.chatInputTextColor);
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



  const style = document.createElement("style");
  style.textContent = `
    #botassist-chatlog::-webkit-scrollbar {
      width: 8px;
    }
    #botassist-chatlog::-webkit-scrollbar-track {
      background: transparent;
    }
    #botassist-chatlog::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.35);
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    #botassist-chatlog::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0.6);
    }
    #botassist-chatlog {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.4) transparent;
    }
      .diagonal-button::before {
content: "";
position: absolute;
top: 0;
left: 0;
width: 11px;
height: 100%;
background: #fff;
transform: skew(-14deg);
transform-origin: top left;
}

.botassist-message {
  margin-bottom: 12px;
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 15px;
  line-height: 1.4;
  display: inline-block;
  clear: both;
}

.botassist-user {
  background-color: var(--conversation-boxes);
  align-self: flex-end;
  float: right;
  text-align: right;
  color: var(--font-color);
}

.botassist-bot {
  background-color: var(--conversation-boxes);
  align-self: flex-start;
  float: left;
  text-align: left;
  color: var(--font-color);
}
  #botassist-chatlog::after {
content: "";
display: table;
clear: both;
}

  `;
  document.head.appendChild(style);

  const toggleBtn = document.createElement("button");
  toggleBtn.innerHTML = "💬";
  toggleBtn.title = "Chat with us";
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 52px;
    border-radius: 50%;
    border: none;
    background: var(--ai-website-chat-btn);
    color: white;
    font-size: 26px;
    z-index: 10000;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    color: var(--font-color);
  `;
  document.body.appendChild(toggleBtn);

  const helperText = document.createElement("div");
  const closeIcon = document.createElement("span");
  closeIcon.innerHTML = "&#8594;";
  closeIcon.style.cssText = `margin-left: 10px; font-size: 22px;`;
  helperText.innerText = "Need Help?";
  helperText.style.cssText = `
    position: fixed;
    bottom: 27px;
    right: 85px;
    font-size: 14.5px;
    z-index: 10000;
    cursor: pointer;
    padding: 0px 16px 0px;
    border-radius: 22px;
    background: var(--ai-website-question);
    font-weight: 600;
    font-family: "Space Grotesk", sans-serif;
    color: var(--need-help-text);
    max-height: 37px;
    height: 37px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  helperText.appendChild(closeIcon);
  setTimeout(() => document.body.appendChild(helperText), 8000);
  closeIcon.onclick = () => document.body.removeChild(helperText);

  // Satisfaction UI
  const satisfactionDiv = document.createElement("div");
  satisfactionDiv.style.cssText = `
    position: absolute;
    bottom: 47px;
    left: 0;
    width: 95%;
    display: none;
    align-items: center;
    text-align: center;
    justify-content: space-between;
    padding: 0 15px 10px;
    border-radius: 10px;
  `;

  const satisfactionHeading = document.createElement("h2");
  satisfactionHeading.innerText = "Was this helpful?";
  satisfactionHeading.style.cssText = `
    color: var(--need-help-text);
    font-weight: 600;
    font-size: 17px;
  `;

  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.cssText = `
    display: flex;
    gap: 15px;
    margin-top: -15px;
  `;

  const likeButton = document.createElement("button");
  likeButton.innerHTML = "👍";
  likeButton.title = "Like";
  likeButton.style.cssText = `
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 23px;
    color: #fff;
    padding: 5px;
  `;
  likeButton.onclick = async () => {
      satisfactionDiv.style.display = "none"
      try {
          const res = await fetch(`${directory}/submit-feedback`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rating: 5, apiKey }),
          });   
      } catch (e) {
          chatLog.innerHTML += `<div style="color:red;"><strong>Error:</strong> Couldn't send feedback.</div>`;
      
      }
  }

  const disLikeButton = document.createElement("button");
  disLikeButton.innerHTML = "👎";
  disLikeButton.title = "Dislike";
  disLikeButton.style.cssText = likeButton.style.cssText;
  disLikeButton.onclick = async () => {
      satisfactionDiv.style.display = "none"
      try {
          const res = await fetch(`${directory}/submit-feedback`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rating: 1, apiKey }),
          });   
      } catch (e) {
          chatLog.innerHTML += `<div style="color:red;"><strong>Error:</strong> Couldn't send feedback.</div>`;
      
      }
  }

  buttonsDiv.appendChild(likeButton);
  buttonsDiv.appendChild(disLikeButton);
  satisfactionDiv.appendChild(satisfactionHeading);
  satisfactionDiv.appendChild(buttonsDiv);

  // Chatbot box
  const chatbotBox = document.createElement("div");
  chatbotBox.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 17px;
    width: 335px;
    height: 550px;
    background: var(--ai-background);
    z-index: 9999;
    display: none;
    flex-direction: column;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    font-family: sans-serif;
    color: var(--font-color);
    padding-top: 0px;
    padding-bottom: 95px;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 13px;
    border-bottom-left-radius: 13px;
    border-bottom-right-radius: 13px;
  `;















  const chatBotHeader = document.createElement("div")
  chatBotHeader.style.cssText = `
  max-width: 101%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7.5px 22px 7.7px;
  background: var(--conversation-boxes);
  border-top-left-radius: 13px;
  border-top-right-radius: 13px;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  `

  const divHead = document.createElement("div")
  divHead.style.cssText = `
  display: flex;
  align-items: center;
  `




  const img = document.createElement("img")
  img.src = "https://www.botassistai.com/img/headChatbot.png"
  img.style.cssText = `
  width: 46.5px;
  height: 46.5px;
  border-radius: 50%;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  `
  divHead.appendChild(img)

  const cleanShopName = shop
.replace(/^https?:\/\//, "") // remove protocol if present
.split(".")[0];  

  const website = document.createElement("h2") 
  website.innerText = cleanShopName
  website.style.cssText = `
  font-size: 21.1px;
  font-weight: 600;
  margin-left: 14px;
  color: var(--font-color);
  `
  divHead.appendChild(website)


  const iconHead = document.createElement("span")
  iconHead.innerHTML = `
<svg viewBox="0 0 24 24" width="16.5" height="16.5"
     fill="none" stroke="currentColor" stroke-width="4"
     stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
`;
  iconHead.style.cssText = `  
  width: 31px;
  height: 31px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
      background: #f8f8f8;
  `
  

chatBotHeader.appendChild(divHead)
chatBotHeader.appendChild(iconHead)

chatbotBox.appendChild(chatBotHeader);













  chatbotBox.appendChild(satisfactionDiv);



  const chatLog = document.createElement("div");
  chatLog.id = "botassist-chatlog";
  chatLog.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    padding-top: 22px;
    height: 270px;
  `;

  const submit = document.createElement("div");
  submit.style.cssText = `
         width: 92%;
        max-height: 43px;
        margin: 0 15px 13px;
  display: flex;
  background: var(--ai-input);
  justify-content: space-between;
  margin-top: 50px;
  border-radius: 14px;
  overflow: hidden; /* 💡 prevents button overflow causing white space */
  position: absolute;
  bottom: 0;
  left: 0;
  `;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ask something...";
  input.style.cssText = `
 padding: 12.5px;
  border: none;
  min-width: 300px
  background: var(--ai-input);
  color: var(--ai-input-font-color);
  outline: none;
  font-size: 16px;
  flex: 1; 
  `;
  input.onfocus = () => {
    input.style.outline = "none";
    input.style.boxShadow = "none";
  };
  

  const button = document.createElement("button");
    button.innerHTML = `
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
`;
    button.className = "diagonal-button"; 
    button.style.cssText = `
          border: none;
  outline: none;
  cursor: pointer;
  color: var(--font-color);
  font-weight: 600;
  font-size: 16px;
  background: var(--ai-button);
  border-radius: 0;
  height: 100%; 
  width: 33px;
  height: 33px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 37%;
  margin: auto 0;
  margin-right: 8px
    `;
  

  submit.appendChild(input);
  submit.appendChild(button);
  chatbotBox.appendChild(chatLog);
  chatbotBox.appendChild(submit);
  document.body.appendChild(chatbotBox);

  function showWelcomeMessageIfEmpty() {
    if (chatLog.children.length !== 0) return;
  
    // Show typing indicator first
    const typingId = `typing-${Date.now()}`;
    chatLog.innerHTML += `
      <div id="${typingId}" class="botassist-message botassist-bot">
        <em>Typing...</em>
      </div>
    `;
    chatLog.scrollTop = chatLog.scrollHeight;
  
    // Replace typing with welcome message after delay
    setTimeout(() => {
      const typingEl = document.getElementById(typingId);
      if (typingEl) {
        typingEl.innerHTML = `How can we help you today?`;
      }
      chatLog.scrollTop = chatLog.scrollHeight;
    }, 600); // 👈 adjust (500–1000ms is ideal)
  }
  

  toggleBtn.addEventListener("click", () => {
    const isOpening = chatbotBox.style.display === "none";
    chatbotBox.style.display = isOpening ? "flex" : "none";
  
    if (isOpening) {
      showWelcomeMessageIfEmpty();
    }
  });
  

  iconHead.addEventListener("click", () => {
    const isOpening = chatbotBox.style.display === "none";
    chatbotBox.style.display = isOpening ? "flex" : "none";
  
    if (isOpening) {
      showWelcomeMessageIfEmpty();
    }
  });
  
  

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;
    chatLog.innerHTML += `<div class="botassist-message botassist-user">${message}</div>`;
    input.value = "";
  
    const loadingId = `loading-${Date.now()}`;
    chatLog.innerHTML += `<div id="${loadingId}" class="botassist-message botassist-bot"><em>Typing...</em></div>`;
    chatLog.scrollTop = chatLog.scrollHeight;
  
    try {
      const res = await fetch(`${directory}/ask-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, apiKey: window.BOTASSIST_API_KEY, conversationId }),
      });
      const data = await res.json();
      const botResponse = data.response;
  
      const loadingElem = document.getElementById(loadingId);
      if (botResponse === "undefined" || !botResponse) {
        if (loadingElem) loadingElem.innerHTML = `<strong>Bot:</strong> Bot is disabled`;
        satisfactionDiv.style.display = "none";
      } else {
        if (loadingElem) {
          loadingElem.className = "botassist-message botassist-bot";
          loadingElem.innerHTML = `${botResponse}`;
        }
        satisfactionDiv.style.display = "flex";
      }
  
      chatLog.scrollTop = chatLog.scrollHeight;
    } catch (err) {
      const loadingElem = document.getElementById(loadingId);
      if (loadingElem) loadingElem.innerHTML = `<div style="color:red;"><strong>Error:</strong> Couldn't reach the server.</div>`;
      console.error("Fetch error:", err);
      satisfactionDiv.style.display = "none";
    }
  }
  


  (async () => {
    try {
      const res = await fetch(`${directory}/ping-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey })
      });
    
      const text = await res.text(); 
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned non-JSON: " + text.slice(0, 100));
      }
    
    } catch (err) {
      console.error("Bot connection failed:", err);
    }
    
  })();





  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  button.addEventListener("click", sendMessage);
})();


