(function () {
    const script = document.currentScript;
    const apiKey = script.getAttribute("api-key");
  const directory = "https://api.botassistai.com"
    if (!apiKey) {
      console.error("❌ Missing API key in <script> tag.");
      return;
    }
  
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
  
    // Toggle button
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
      color: #fff;
      z-index: 10000;
      cursor: pointer;
      padding: 3px 0px 6px;
      border-radius: 22px;
      background: var(--ai-website-question);
      font-weight: 600;
      font-family: "Space Grotesk", sans-serif;
      color: var(--font-color);
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
      bottom: 35px;
      left: 0;
      width: 100%;
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
      color: var(--font-color);
      font-size: 17px;
    `;
  
    const buttonsDiv = document.createElement("div");
    buttonsDiv.style.cssText = `
      display: flex;
      gap: 15px;
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
      height: 420px;
      background: var(--ai-background);
      z-index: 9999;
      display: none;
      flex-direction: column;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      font-family: sans-serif;
      color: var(--font-color);
      padding-top: 0px;
      border-radius: 13px;
      border-bottom-left-radius: 13px;
      border-bottom-right-radius: 13px;
    `;
  
    const logoContainer = document.createElement("a");
    logoContainer.style.cssText = `
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 5px;
      background-color: transparent;
    `;
    logoContainer.href = "https://www.botassistai.com/";
    logoContainer.target = "_blank"
    
    const logo = document.createElement("img");
    logo.src = "https://botassistai.com/img/BigLogo.png"; 
    logo.style.cssText = `
      height: 60px;
      object-fit: contain;
      border-radius: 6px;
    `;
    
    logoContainer.appendChild(logo);
    chatbotBox.insertBefore(logoContainer, chatbotBox.firstChild);
    chatbotBox.appendChild(satisfactionDiv);



    const chatLog = document.createElement("div");
    chatLog.id = "botassist-chatlog";
    chatLog.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      height: 261px;
    `;
  
    const submit = document.createElement("div");
    submit.style.cssText = `
        width: 100%;
  display: flex;
  background: var(--ai-input);
  border-top: 1px solid var(--ai-border);
  justify-content: space-between;
  margin-top: 50px;
  border-bottom-right-radius: 13px; 
  border-bottom-left-radius: 13px;
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
  width: 100%;
  background: var(--ai-input);
  color: var(--font-color);
  outline: none;
  font-size: 16px;
  flex: 1; 
    `;
    input.onfocus = () => input.style.outline = "none";
    input.onfocus = () => input.style.boxShadow = "none";
  
    const button = document.createElement("button");
    button.innerHTML = "Send";
    button.className = "diagonal-button"; 
    button.style.cssText = `
          border: none;
  outline: none;
  padding: 0 30px;
  cursor: pointer;
  color: var(--font-color);
  font-weight: 500;
  font-size: 16px;
  background: var(--ai-button);
  border-radius: 0;
  clip-path: polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%);
  height: 100%; 
  height: 43px;
    `;
  
    submit.appendChild(input);
    submit.appendChild(button);
    chatbotBox.appendChild(chatLog);
    chatbotBox.appendChild(submit);
    document.body.appendChild(chatbotBox);
  
    toggleBtn.addEventListener("click", () => {
      chatbotBox.style.display = chatbotBox.style.display === "none" ? "flex" : "none";
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
          body: JSON.stringify({ message, apiKey }),
        });
    
        const data = await res.json();
        const botResponse = data.response;
    
        const loadingElem = document.getElementById(loadingId);
        if (botResponse === "undefined" || !botResponse) {
          if (loadingElem) loadingElem.innerHTML = `<strong>Bot:</strong> You've reached the limit of free conversations for today 💬`;
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
      
        const text = await res.text();  // <-- safer than .json() if you expect HTML
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server returned non-JSON: " + text.slice(0, 100));
        }
      
        console.log("Bot connected:", data);
      } catch (err) {
        console.error("Bot connection failed:", err);
      }
      
    })();




  
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  
    button.addEventListener("click", sendMessage);
  })();
  