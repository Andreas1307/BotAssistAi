import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import directory from './src/directory';
import { ToastContainer, toast } from "react-toastify";
function OpenAi() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [user, setUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [satisfactionPrompt, setSatisfactionPrompt] = useState("");
  const [popUp, setPopUp] = useState(false)
  const [apiKey, setApiKey] = useState(null)
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${directory}/auth-check`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const getApiKey = async () => {
      if(!user) return
      try {
        const userId = user?.user_id
        const res = await axios.get(`${directory}/get-api`, {
          params: { userId }
        })
        setApiKey(res.data.key)
      } catch(e) {
        console.log("Error fetching api", e)
        showErrorNotification()
      }
    }
    getApiKey()
  }, [user])

  useEffect(() => {
    const fetchConvCount = async () => {
      if (!user) {
        return;
      }
      try {
        const userId = user.user_id;
        const res = await axios.get(`${directory}/daily-messages`, {
          params: { userId },
        });
        let count = res.data.dailyMessages;
        if (count >= 30 && user?.subscription_plan === "Free") {
            setPopUp(true)
        } else {
            setPopUp(false)
            count = 0
        }
      } catch (e) {
        console.log(
          "An error occured with retreiving the conversation numbers",
          e
        );
        showErrorNotification();
      }
    };
    fetchConvCount();
  }, [user]);
  const askAI = async () => {
    try {
      const res = await axios.post(`${directory}/ask-ai`, {
        message,
        apiKey: user.api_key,
      });
      setResponse(res.data.response);
      setSatisfactionPrompt(res.data.satisfaction_prompt);
      setLimitReached(false); // Reset on success
    } catch (error) {
      if (error.response?.data?.error) {
        const serverError = error.response.data.error;
        console.error("Server Error:", serverError);

        setResponse(serverError);
        if (serverError.includes("Finished your 30 conversations")) {
          setLimitReached(true); 
        }
      } else {
        console.error("Unexpected Error:", error);
        setResponse("Something went wrong. Please try again later.");
      }
    }
  };

  const submitFeedback = async (rating) => {
    try {
      await axios.post(`${directory}/submit-feedback`, {
        userId: user.user_id,
        rating: rating,
      });
      alert("Thank you for your feedback!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div>
      <h1>AI Chatbot</h1>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />
      <ToastContainer />
      <button onClick={askAI}>Ask AI</button>

      <h2>Response:</h2>
      <p>{response}</p>
      {satisfactionPrompt && (
        <div>
          <h3>{satisfactionPrompt}</h3>
          <button onClick={() => submitFeedback(1)}>1</button>
          <button onClick={() => submitFeedback(2)}>2</button>
          <button onClick={() => submitFeedback(3)}>3</button>
          <button onClick={() => submitFeedback(4)}>4</button>
          <button onClick={() => submitFeedback(5)}>5</button>
        </div>
      )}
      {popUp && (
  <div className="renew-overlay">
    <div className="renew-box">
      <h2>⚠️ Daily Limit Reached</h2>
      <p>You’ve used all your conversations for today on the <span>Free Plan</span>.</p>
      <p>Come back tomorrow or <span>upgrade</span>  to continue chatting.</p>

      <div className="renew-buttons">
        <button onClick={() => window.location.href = "/upgrade"}>Upgrade</button>
        <button className="close-btn" onClick={() => setPopUp(false)}>Close</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default OpenAi;
