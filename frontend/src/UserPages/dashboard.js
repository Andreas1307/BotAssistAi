import React, { useState, useEffect, useRef } from "react";
import { 
  FaChartLine, FaComments, FaPlug, FaCogs, FaHome, 
  FaRobot, FaClipboardList, FaSearch, FaUserCircle, FaPowerOff, 
  FaSyncAlt, FaSlidersH, FaProjectDiagram, FaTasks, FaTachometerAlt, FaClock, FaThumbsUp, FaLightbulb,
  FaTimes, FaCalendarCheck 
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import "../styling/dashboard.css";
import AnalyticsPage from "../UserComponents/AnalyticsPage";
import Integration from "../UserComponents/Integrations";
import BotTraining from "../UserComponents/BotTraining";
import SettingsPage from "../UserComponents/Settings"
import directory from '../directory';
import axios from "../utils/axiosShopify.js"


import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import {
  FaBars,
  FaArrowLeft,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import Footer from "../UserComponents/footer";
import BookingSettings from "../UserComponents/BookingSettings";

import { getAppBridgeInstance } from "../utils/app-bridge";
import { Redirect } from "@shopify/app-bridge";
import { handleBilling } from "../utils/billing";

const Dashboard = () => {
  const [activeChats, setActiveChats] = useState(0);
  const [topQuestions, setTopQuestions] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const navigate = useNavigate()
  const [satisfaction, setSatisfaction] = useState([])
  const [satisfactionScore, setSatisfactionScore] = useState(0)
  const [unresolvedQueries, setUnresolvedQueries] = useState(0);
  const [positive, setPositive] = useState(0)
  const [resolvedQueries, setResolvedQueries] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [negative, setNegative] = useState(0)
  const [resTime, setResTime] = useState(0)
  const [dailyCount, setDailyCount] = useState(0);
  const [membership, setMembership] = useState(false)
  const [convHistory, setConvHistory] = useState([])
  const [collap, setCollap] = useState(false);
  const [renew, setRenew] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10);
  const [aiBot, setAiBot] = useState(false);
  const [dashPopUp, setDashPopUp] = useState(false)
  const [connected, setConnected] = useState(false)
  const [activeHash, setActiveHash] = useState(window.location.hash);
  const [lastConnected, setLastConnected] = useState(null)
  const [lastUpdated, setLastUpdated] = useState("")
  const [flaggedIssue, setFlaggedIssue] = useState("")
  const [topFAQs, setTopFAQs] = useState([
    "How do I track my order?",
    "Can I change my subscription plan?",
    "What payment methods do you accept?"
  ]);
  const [lastConv, setLastConv] = useState([]);
  const [integration, setIntegration] = useState(false)
  const [bookingIntegration, setBookingIntegration] = useState(false)
  const [shopifyUser, setShopifyUser] = useState(false)




  let toastId;
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
    setActiveChats(35); 
    setTopQuestions(["How to reset password?", "What is your refund policy?", "How to contact support?"]);
    setErrorLogs([
      { id: 1, issue: "Bot not responding", time: "2 mins ago" },
      { id: 2, issue: "API timeout error", time: "10 mins ago" }
    ]);
  }, []);

  const [userQuery, setUserQuery] = useState("");
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {   
    const fetchShopifyUser = async () => {
      try {
        const response = await axios.get(`/check-shopify-user`, {params: { id: user?.user_id }})
        console.log("SHOPIFY USER", response.data.data)
        setShopifyUser(response.data.data)
      } catch(e) {
        console.log("An error occured checking the shopify user", e)
      }
    } 
    fetchShopifyUser()

  }, [user])
  /*
  useShopifyInstallRedirect();

  const API_BASE = "https://api.botassistai.com";
  
  const [shopData, setShopData] = useState(null);
     const sessionChecked = useRef(false);
  
  useEffect(() => {
    const ensureShopifyAuthenticated = async () => {
      if (sessionChecked.current) return;
      sessionChecked.current = true; // ✅ Prevent spam
  
      const isShopifyUser = localStorage.getItem("shopifyUser") === "true";
      const shop =
        localStorage.getItem("shop") ||
        new URLSearchParams(window.location.search).get("shop");
  
      if (!isShopifyUser || !shop) return;
  
      try {
        const app = await waitForAppBridge(); // your App Bridge init
        const token = await getSessionToken(app);
  
        console.log("Session token", token);
        console.log("App", app);
  
        const res = await fetch(`${API_BASE}/api/check-session`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Shopify-Shop-Domain": shop,
          },
        });
  
        if (res.status === 401) {
          const alreadyRedirected = sessionStorage.getItem("alreadyRedirected");
          if (!alreadyRedirected) {
            console.warn("🛑 Session invalid, redirecting to auth...");
            sessionStorage.setItem("alreadyRedirected", "true");
            console.log("Redirecting to /auth for shop:", shop);
            const redirect = Redirect.create(app);
            redirect.dispatch(
              Redirect.Action.REMOTE,
              `https://api.botassistai.com/auth?shop=${shop}`
            );
          } else {
            console.warn("⚠️ Already redirected once. Skipping further redirects.");
          }
        }
         else {
          console.log("✅ Session is valid");
        }
      } catch (err) {
        console.error("❌ Session check failed:", err);
      }
    };
  
    ensureShopifyAuthenticated();
  }, []);
  
    useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const host = urlParams.get("host");
    const shop = urlParams.get("shop");
    const shopifyUser = urlParams.get("shopifyUser");
  
    if (host) localStorage.setItem("host", host);
    if (shop) localStorage.setItem("shop", shop);
    if (shopifyUser === "true") localStorage.setItem("shopifyUser", "true");
  }, []);
  
  useEffect(() => {
    const fetchShopData = async () => {
      const isShopifyUser = localStorage.getItem("shopifyUser") === "true";
      const alreadyRedirected = sessionStorage.getItem("alreadyRedirected");
  
      if (!isShopifyUser || alreadyRedirected === "true") {
        console.log("⏳ Waiting for session verification to finish");
        return;
      }
  
      try {
        const app = await waitForAppBridge();
        const token = await getSessionToken(app);
        const shop = localStorage.getItem("shop");
  
        if (!token || !shop) return;
  
        const res = await fetch(`${API_BASE}/api/shop-data`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Shopify-Shop-Domain": shop,
          },
        });
  
        if (res.status === 401) {
          console.warn("🛑 Unauthorized. Not fetching shop data.");
          return;
        }
  
        const json = await res.json();
        setShopData(json.shopData);
        sessionStorage.removeItem("alreadyRedirected");
      } catch (err) {
        console.error("❌ Error fetching shop data:", err);
      }
    };
  
    fetchShopData();
  }, []);
  
  */


  useEffect(() => {
    const fetchMembership = async () => {
      if (!user) return
      try{
        const response = await axios.get(`/get-membership`, {
          params: { userId: user?.user_id}
        })
        if(response.data.message.subscription_plan === "Pro") {
          setMembership(true)
        } else {
          setMembership(false)
        }
      } catch(e) {
        console.log("Error occured with retreiveing the membership status",e)
        showErrorNotification()
      }
    }
    fetchMembership()
  }, [user])
  
  
  

  
  //FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/auth-check`, { withCredentials: true });
        setUser(res.data.user);
        setRenew(res.data.showRenewalModal)
      } catch (error) {
        setUser(null);
        showErrorNotification()
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  //fETCH QUERIES
  useEffect(() => {
    const fetchQueries = async () => {
      if (!user) {
        return;
      }
      try {
        const response = await axios.get(`/get-queries`, {
          params: { userId: user.user_id }
        });
        setUnresolvedQueries(response.data.unresolvedQueries.length);
        setResolvedQueries(response.data.resolvedQueries.length);
      } catch (e) {
        console.log("Error occurred with fetching the queries", e);
        showErrorNotification()
      }
    };
    
    fetchQueries();
  }, [user]); 


  const activatePlan = async () => {
    await handleBilling(user.user_id);
  };



  // FETCH USER SATISFACTION
  useEffect(() => {
    if (!user) return;
  
    const fetchSatisfaction = async () => {
      try {
        const response = await axios.get(`/satisfaction`, {
          params: { userId: user.user_id }
        });
  
        const satisfactionData = response.data.message;
        setSatisfaction(satisfactionData);
  
        if (satisfactionData.length > 0) {
          const totalScore = satisfactionData.reduce((sum, item) => sum + (item.rating || 0), 0);
          const maxPossibleScore = satisfactionData.length * 5;
          const percentage = (totalScore / maxPossibleScore) * 100;
          setSatisfactionScore(percentage.toFixed(1));
  
          let positiveCount = 0, negativeCount = 0, neutralCount = 0;
          satisfactionData.forEach((sen) => {
            if (sen.rating > 3) positiveCount++;
            else if (sen.rating < 3) negativeCount++;
            else neutralCount++;
          });
  
          const total = satisfactionData.length;
          setPositive(((positiveCount / total) * 100).toFixed(1));
          setNegative(((negativeCount / total) * 100).toFixed(1));
          setNeutral(((neutralCount / total) * 100).toFixed(1));
        } else {
          setSatisfactionScore("0.00");
          setPositive(0);
          setNegative(0);
          setNeutral(0);
        }
      } catch (e) {
        console.log("Error with fetching user satisfaction", e);
        showErrorNotification()
      }
    };
  
    fetchSatisfaction(); 
    const interval = setInterval(fetchSatisfaction, 5000); // Auto-refresh every 5 seconds
  
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [user]);
  // FETCH RES TIME
  useEffect(() => {
    const fetchResTime = async () => {
      if(!user) {
        return
      }
      try {
        const userId = user.user_id
        const response = await axios.get(`/chat-history/${userId}`)
        
        const messages = response.data.messages;
        if (!messages || messages.length === 0) return;
  
        // Pair the messages correctly: User -> Bot
        const pairedConversations = [];
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].sender_type === "user" && messages[i + 1].sender_type === "bot") {
            pairedConversations.push({
              userMessage: messages[i].message_text,
              botMessage: messages[i + 1].message_text,
              timeSent: messages[i].timestamp,
              responseTime: messages[i + 1].res_duration || "N/A",
              status: messages[i + 1].status || "Chatbot handled"
            });
          }
          if (pairedConversations.length === 2) break; // Keep only the last two pairs
        }
  
        setLastConv(pairedConversations)
        
        if (response.data.messages?.length > 0) {
          const data = response.data.messages.reduce(
            (sum, item) => sum + (Number(item.res_duration) || 0), 
            0
          );
          setResTime(data / 2);
        }
      } catch(e) {
        console.log("Chat history fetch error:", e);
        showErrorNotification()
      }
    }
    fetchResTime()
  }, [user])
  // FETCH DAILY CONVERSATIONS
  useEffect(() => {
    const fetchDailyConversations = async () => {
      if(!user) {
        return
      }
      try {
        const userId = user.user_id
        const response = await axios.get(`/daily-messages` , {
          params: { userId }
        })
        setDailyCount(response.data.dailyMessages);    
      } catch (e) {
        console.log("An error occured with fetching the daily conversations", e)
        showErrorNotification()
      }
    }
    fetchDailyConversations()
  }, [user])

//fetchBotStatus
useEffect(() => {
  if (!user) return;

  const fetchBotStatus = async () => {
    const userId = user.user_id;
    try {
      const res = await axios.get(`/get-bot-status`, {
        params: { userId }
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

//check faq if completed 
useEffect(() => {
  const fetchAllFaq = async () => {
    if(!user) return
    try {
      const res = await axios.get(`/fetch-all-faq`, {
        params: { userId: user.user_id}
      })
      const data = res.data.faq;

      if (!data) {
        setFlaggedIssue("FAQ data not yet initialized");
        setLastUpdated("N/A");
        return;
      }   

      setLastUpdated(new Date(data.last_updated).toLocaleString());
let issues = [];

if (!data.businessName?.trim()) issues.push("Business name is missing");
if (!data.webUrl?.trim()) issues.push("Website URL is missing");
if (!data.response_tone?.trim()) issues.push("Response tone is not selected");
if (!data.business_context?.trim()) issues.push("Business context is missing");
if (!data.phoneNum?.trim()) issues.push("Support phone number is missing");
if (!data.fine_tuning_data?.trim()) issues.push("Fine-tuning data is missing");

// You can also check if uploaded_file is a valid file path or present
if (!data.uploaded_file || data.uploaded_file.includes("undefined")) issues.push("No valid file uploaded");

if (issues.length > 0) {
  setFlaggedIssue(issues.join(", "));
} else {
  setFlaggedIssue("");
}
    } catch (e) {
      console.log("An error occured fetching the flagged issues", e)
      showErrorNotification()
    }
  }
  fetchAllFaq()
}, [user])
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


const setBotStatus = async (status) => {
  if (!user) return;
  const userId = user.user_id;
  try {
    await axios.get(`/set-bot-status`, {
      params: { userId, aiBot: status ? 1 : 0 }, // convert to 1/0 for DB
    });
  } catch (e) {
    console.log("Error occurred with setting bot on or off", e);
    showErrorNotification();
  }
};

const handleLogout = async () => {
  try {
    await axios.post(`/logout`, {}, { withCredentials: true });
    navigate("/");
  } catch (error) {
    console.log("Logout failed", error);
  }
};

const LogoutConfirmToast2 = ({ closeToast, onConfirm, reason = "Are you sure you want to log out?" }) => (
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
        Yes, Log Out
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


const showLogoutConfirm2 = (onConfirm, reason) => {
  try {
    toast.info(({ closeToast }) => (
      <LogoutConfirmToast2 closeToast={closeToast} onConfirm={onConfirm} reason={reason} />
    ), {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
      toastId: "logout-confirm",
    });
  } catch (error) {
    console.log("Error displaying logout confirmation toast:", error);
  }
};

  //FETCH CONVERSATIONS HISTORY
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loadAll, setLoadAll] = useState(false);

const fetchConvHistory = async (loadAllChats = false) => {
  if (!user || (!hasMore && !loadAllChats)) return;

  try {
    const res = await axios.get(`/conv-history`, {
      params: { userId: user.user_id, page: loadAllChats ? undefined : page, limit: 20, all: loadAllChats }
    });


    if (loadAllChats) {
      setConvHistory(res.data.message);

      setLoadAll(true);
      setHasMore(false); // No more to load after viewing all
    } else {
      if (!res.data.message || res.data.message.length === 0) {
        setHasMore(false); // No more messages available
      } else {
        setConvHistory(prev => {
          const newMessages = res.data.message.filter(msg => 
            !prev.some(prevMsg => prevMsg.id === msg.id) // Avoid duplicates
          );
          return [...prev, ...newMessages];
        });

        setPage(prev => prev + 1);
      }
    }
  } catch (e) {
    console.log("Error occurred fetching conversation history", e);
    showErrorNotification()
  }
};
  useEffect(() => {
    fetchConvHistory();
  }, [user]);

  // LOADING
  useEffect(() => {
    if (loading) return; // Ensure the hook always runs in the same order
  
    if (user) {
      navigate(`/${user?.username}/dashboard`);
    } else {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const sendSupport = async (e) => {
    e.preventDefault()
    if(!user) return
    try {
      const res = await axios.post(`/send-question`, {
        userId: user?.user_id,
        email: user?.email,
        msg: userQuery
      })
      showNotification("Message sent successfully!")
      setUserQuery("")
    } catch(e) {
      console.log("An error occured sending the user's issue / question", e)
      showErrorNotification("Error sending message")
    }
  }

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const LogoutConfirmToast = ({ closeToast, onConfirm, reason = "Clear all bot customizations?" }) => (
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
  
  const showLogoutConfirm = (onConfirm, reason) => {
    try {
      toast.info(({ closeToast }) => (
        <LogoutConfirmToast closeToast={closeToast} onConfirm={onConfirm} reason={reason} />
      ), {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        toastId: "logout-confirm",
      });
    } catch (error) {
      console.log("Error displaying logout confirmation toast:", error);
    }
  };

const handleReset = async () => {
  if(!user) {
    showErrorNotification()
  }
  const userId = user.user_id
  try {
    await axios.get(`/reset-bot`, { 
      params: { userId }
    })
    setTimeout(() => {
      showNotification("Note , your bot will not work unless you train it")
    }, 1500)
  } catch(e) {
    console.log("Error with reseting bot data", e)
    showErrorNotification()
  }
}



const toggleBot = () => {
  const newStatus = !aiBot;
  setAiBot(newStatus);
  setBotStatus(newStatus)
};


if (loading) {
    return <h2>Loading...</h2>
  }
  return (
    <div className="dashboard-container">
      <aside className="collap-sidebar">
        <FaBars onClick={() => setCollap(!collap)} className="side-bar"/>
        <div className="sidebar-icons">
         <a target="_blank" href=""><FaFacebook/></a> 
         <a target="_blank" href="https://www.instagram.com/botassistai/"><FaInstagram /></a> 
         <a target="_blank" href="https://www.tiktok.com/@botassistai"><FaTiktok /></a> 
        </div>
      </aside>
      
      <aside className={`sidebar ${collap ? "active" : ""}`}>
  <FaArrowLeft onClick={() => setCollap(false)} className="arrow-left" />
  <h2 className="logo-dash"> BotAssistAI</h2>


  <ul className="nav-list">
  {[
    { name: "Dashboard", icon: <FaHome />, hash: "#dash" },
    { name: "Analytics", icon: <FaChartLine />, hash: "#analytics" },
    { name: "Conversations", icon: <FaComments />, hash: "#conversations" },
    { name: "Integrations", icon: <FaPlug />, hash: "#integrations" },
    // Conditionally include Bookings
    ...(shopifyUser
      ? [{ name: "Bookings", icon: <FaCalendarCheck />, hash: "#bookings" }]
      : []),
    { name: "Bot Training", icon: <FaRobot />, hash: "#botTraining" },
    { name: "Settings", icon: <FaCogs />, hash: "#settings" },
  ].map((item) => (
    <a
      href={item.hash}
      key={item.hash}
      className={`nav-item ${window.location.hash === item.hash ? "active" : ""}`}
    >
      <span className="nav-icon">{item.icon}</span> <a href={item.hash}>{item.name}</a>
    </a>
  ))}
</ul>



  {!membership && <Link to={`/${user?.username}/upgrade-plan`}><button className="upgrade-btn">Upgrade Plan</button></Link>}
</aside>

<div className="main-content">  

      {/* Main Content */}
      <main className="dashboard-content" id="dash">
  

  {renew && (
     <div className="membership-overlay">
     <div className="membership-modal">
       <h2 className="membership-title">✨ Premium Membership Expired</h2>
       <p className="membership-text">
         Your premium plan has ended. Renew now and unlock exclusive features, smarter tools, and priority access!
       </p>
       <div className="membership-buttons">
       <Link className="membership-renew-btn" to={`/${user?.username}/upgrade-plan`}>
      <button>
        Renew Now
        </button>
        </Link>
         <button className="membership-later-btn" onClick={() =>setRenew(false)}>
           Not Now
         </button>
       </div>
     </div>
   </div>
  )}
        
        <div className="dashboard-header">
          <div onClick={() => setDashPopUp(!dashPopUp)} className="user-profile">
            <FaUserCircle className="user-icon" />
            <span className="username">{user ? user?.username : "Guest"}</span>
           
          </div>
           {dashPopUp && (
              <div className="popUp">
                <p>{user?.email}</p>
                <button onClick={() => showLogoutConfirm2(handleLogout)}>Log Out</button>
                </div>
            )}
        </div>

        <h1 className="dashboard-title">  <FaTachometerAlt className="dashIcon" />Dashboard Overview</h1>
        <div>

    <ToastContainer />
  </div>

        {/* System Status & AI Quick Actions */}
        <div className="dashboard-widgets">
          <div className="status-panel">
            <h2>System Status</h2>
            <ul>
              <li>✅ AI Bot: {aiBot ? "Online" : "Offline"}</li>
              <li>✅ API: {connected ? "Connected" : "Not Connected"}</li>
              <li>
  ⏱️ Last Active:{" "}
  {lastConnected
    ? formatDistanceToNow(new Date(lastConnected), { addSuffix: true })
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
    onClick={toggleBot}
  >
    <FaPowerOff className="quick-icon" />
    {aiBot ? "Disable AI" : "Enable AI"}
  </button>


              <button className="quick-btn"  onClick={() => showLogoutConfirm(handleReset)}><FaSyncAlt /> Reset Bot</button>
              <button className="quick-btn"><a href="#botTraining"><FaSlidersH /> Customize Bot</a></button>
            </div>
          </div>

          
        </div>
{!membership && (
  <div className="upgrade-section">
      <h2>🚀 Upgrade to Premium</h2>
      <p><strong>You're on the Free Plan.</strong> Unlock AI’s full power with a premium subscription!</p>
      <div>
          <ul>
            <h3>Free Account</h3>
        <li>❌ Limited AI Conversations (30/day)</li>
        <li>❌ Slower AI Response Time</li>
        <li>❌ No Custom Branding</li>
        <li>❌ Basic AI Training Features</li>
        <li>❌ No Priority Support</li>
      </ul>

     
      <ul>
         <h3>✨ Upgrade & Get:</h3>
        <li>💬 Unlimited AI Conversations</li>
        <li>📆 Booking System</li>
        <li>📈 Real-time chat analytics</li>
        <li>🔍 Conversation history</li>
        <li>📁 More configuartion options</li>
      </ul>
      </div>
      {shopifyUser ? (
        <Link>
  <button onClick={activatePlan}>
    Activate Plan
  </button>
  </Link>
) : (
  <Link to={`/${user?.username}/upgrade-plan`}>
    <button>
      Upgrade Now
    </button>
  </Link>
)}

    </div>
)}
        

        {/* Stats & Graphs */}
        <div className="dashboard-widgets">
          <div className="graph-card">
            <h2><FaComments className="stat-icon" /> Daily Conversations</h2>
            <p className="stat-number">{dailyCount / 2}</p>
          </div>
          <div style={{opacity: !membership ? 0.5 : 1}} className="graph-card">
            <h2><FaChartLine className="stat-icon" /> Resolved Requests</h2>
            <p className="stat-number">{!membership ? (<span style={{fontSize: "21.5px"}}>Upgrade To See</span>) : resolvedQueries / 2}</p>
          </div>
          <div style={{opacity: !membership ? 0.5 : 1}} className="graph-card">
            <h2><FaClock className="stat-icon" /> Response Time</h2>
            <p className="stat-number">{!membership ? (<span style={{fontSize: "21.5px"}}>Upgrade To See</span>) : `${resTime}ms`}</p>
          </div>
        </div>
        
<div className="dashboard-widgets">
        {/* AI Improvement Tips */}
        <div className="improvement-tips">
          <h2><FaLightbulb /> Improve Your AI Responses</h2>
          <ul>
            <li>🔹 Provide more sample conversations for better training</li>
            <li>🔹 Regularly check logs for AI errors</li>
            <li>🔹 Train AI with real user questions</li>
            <li>🔹 Use customer feedback to refine responses</li>
          </ul>
        </div>
        
          <div className="faq-card">
            <h2><FaClipboardList className="stat-icon" /> Most Popular FAQs</h2>
            <ul>
              {topFAQs.map((faq, index) => (
                <li key={index}>{faq}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="dashboard-widgets">
          <div className="graph-card">
            <h2><FaThumbsUp className="stat-icon" /> Customer Satisfaction</h2>
            <p className="stat-number">{satisfactionScore}%</p>
          </div>
          <div style={{opacity: !membership ? 0.5 : 1}} className="graph-card">
            <h2><FaTasks className="stat-icon" /> Unresolved Queries</h2>
            <p className="stat-number">{!membership ? (<span style={{fontSize: "21.5px"}}>Upgrade To See</span>) : unresolvedQueries}</p>
          </div>
        </div>
        <div className="support-section">
          <form onSubmit={sendSupport}>
            <h2>Have a Question or Issue?</h2>
          <textarea
            className="support-input"
            placeholder="Enter your problem or question here..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            required
          />
          <button type="submit" className="submit-query-btn" >Submit</button>
          </form>
          
        </div>
       
      </main>

      <main className="dashboard-analytics" id="analytics">
      <h1 className="dashboard-title">📊 Analytics</h1>

<AnalyticsPage />

      </main>

      <main className="dashboard-conversations" id="conversations">
      <div className="conversations-overview">
        <h1 className="dashboard-title">
          <FaComments /> Conversations
        </h1>
        <div style={{opacity: !membership ? 0.6 : 1}} className="conversation-list">  
            <h2>Latest Conversations</h2>
            <div className="conv">
            {!membership ? ( 
  <span style={{ fontSize: "21px", fontWeight: 700, color: "#00F5D4" }}>Upgrade To See</span> 
) : (
  lastConv.map((conv, index) => (
    <div className="conversation-card" key={index}>
      <div className="conversation-header">
        <h3>Visitor</h3>
        <p><span>Status:</span> {conv.status}</p>
      </div>
      <p><span>User Message:</span> "{conv.userMessage.length > 50 ? conv.userMessage.slice(0, 50) + "..." : conv.userMessage}"</p>
      <p><span>AI Message:</span> "{conv.botMessage.length > 50 ? conv.botMessage.slice(0, 50) + "..." : conv.botMessage}"</p>
      <p><span>Time sent:</span> {new Date(conv.timeSent).toLocaleTimeString()}</p>
      <p><span>Response Time:</span> {conv.responseTime}ms</p>
    </div>
  ))
)}
  
</div>
          
        </div>
      </div>

            <div className="conv-details">
            <div  style={{opacity: !membership ? 0.5 : 1}} className="conversation-details">
  <h2>Conversation History</h2>
  {!membership ? (
  <span style={{ fontSize: "21px", fontWeight: 700, color: "#00F5D4" }}>
    Upgrade To See
  </span>
) : (
  <div className="conversation-detail">
  {convHistory.length > 0 ? (
    <>
      <ul className="chat-list">
        {convHistory.slice(0, visibleCount).map((chat, key) => (
          <li
            key={key}
            className={chat.sender_type === "bot" ? "bot-message" : "user-message"}
          >
            <strong>{chat.sender_type === "bot" ? "Bot" : "User"}:</strong> {chat.message_text}
          </li>
        ))}
      </ul>
      {visibleCount < convHistory.length && (
        <button className="load-btn" onClick={() => setVisibleCount(prev => prev + 10)}>
          Load more
        </button>
      )}
    </>
  ) : (
    <h2>No conversation history</h2>
  )}
</div>

)}

  
</div>

      <div style={{opacity: !membership ? 0.5 : 1}} className="user-sentiment">
        <h2>Sentiment Analysis</h2>
        <div className="sentiment-card">
          <p>💚 Positive: <span>{!membership? "🔒" : `${positive}%`}</span> </p>
        </div>
        <div className="sentiment-card">
          <p>⚠️ Negative: <span>{!membership? "🔒" : `${negative}%`}</span></p>
        </div>
        <div className="sentiment-card">
          <p>😐 Neutral: <span>{!membership? "🔒" : `${neutral}%`}</span></p>
        </div>
        {!membership && (
         <span style={{fontSize: "20px", fontWeight: 700, color: "#00F5D4"}}>Upgrade To See</span> 
        )}
        
      </div>
 </div>



<div className="conv-details">
  <div className="real-time-analytics">
        <h2>Chatbot Performance</h2>
        <div className="analytics-card">
          <h3>Chats Count</h3>
          <p><span>Today:</span> {dailyCount / 2}</p>
        </div>
        <div className="analytics-card">
          <h3>Avg. Response Time</h3>
          <p><span>Bot:</span> {resTime}ms</p>
        </div>
      </div>
      <div className="support-tools">
        <h2>Support Tools</h2>
        <div className="tools-card">
          <h3>⏱️Last Training Update</h3>
          <p>{lastUpdated}</p>
        </div>
        <div className="tools-card">
          <h3>🧠Brain Boosts</h3>
          <p>Every update makes your assistant smarter and better.</p>
        </div>
      </div>
      <div className="bot-training-feedback">
        <h2>Chatbot Training</h2>
        <div className="feedback-card">
          <p>⚠️<span> Flagged Issue:</span> {flaggedIssue || "No issues"}</p>
        </div>
        <div className="feedback-card">
          <p>💡<span> Suggestion:</span> Upload real chat examples and FAQs to help the AI respond more naturally and accurately.</p>
        </div>
      </div>
</div>
      

      
    </main>

    <main className="dashboard-integrations" id="integrations">
      <span className="titleBox">
        <h1 className="dashboard-title">
          <FaProjectDiagram  /> Integrations
        </h1>
        <button className="integrate-btn" onClick={() => setIntegration(true)}>
          How To Integrate
        </button>
      </span>
    
        <Integration />
    </main>


{integration && (
  <div className="integration-popUp">
    <FaTimes onClick={() => setIntegration(false)} className="close-inte" />
    <div className="inte-popUp">
      <div className="integration">





      <div className="integration-steps">
  <h2>⚙️ Integrate <span>BotAssistAI</span> with Your Website</h2>
  <p className="sub-heading">Embed your AI chatbot in minutes. Just follow these simple steps.</p>

  <div className="steps-card">
    <div className="step-number">1</div>
    <div className="step-content">
      <h3>Customize Your Chatbot</h3>
      <p>Head to your BotAssistAI Bot Training section and train your bot’s information to provide the best answers about your business</p>
      <div className="step-image">
        <img src={`${process.env.PUBLIC_URL}/img/training.png`} alt="Train your support bot" />
      </div>
    </div>
  </div>

  <div className="steps-card">
    <div className="step-number">2</div>
    <div className="step-content">
      <h3>Get Your API Key</h3>
      <p>Copy your unique API key from the <strong>Integrations</strong> section. This key links your site to your bot.</p>
      <div className="step-image">
        <img src={`${process.env.PUBLIC_URL}/img/apiKey.png`} alt="Api-Key" />
      </div>
    </div>
  </div>

      <div className="steps-card">
    <div className="step-number">3</div>
    <div className="step-content">
    <h3>Embed the Script</h3>
      <p>Go to the integrations page and find the <strong>Copy & Embed Code</strong> box and choose your website's language.Then insert the coped code into your code.</p>
      <div className="step-image">
        <img src={`${process.env.PUBLIC_URL}/img/code-integration.png`} alt="Api-Key" />
      </div>
    </div>
  </div>

  <div className="steps-card">
    <div className="step-number">4</div>
    <div className="step-content">
      <h3>Activate & Test</h3>
      <p>After adding the code along with the api key to your website, head over to your dashboard section and click <strong>Enable AI</strong>.</p>
      <div className="step-image">
        <img src={`${process.env.PUBLIC_URL}/img/enableAi.png`} alt="Enable Ai Button" />
      </div>
    </div>
  </div>

  <div className="step-final">
    <h3>🎉 Done!</h3>
    <p>Your AI assistant is now live and ready to handle support 24/7. You can monitor, train, and customize it anytime from your dashboard.</p>
  </div>
</div>




      </div>
    </div>
  </div>
)}



{shopifyUser && (

  <main className="dashboard-bookings" id="bookings">
  <div className="booking-dash">
<h1 className="dashboard-title">📅 Bookings</h1>
<button onClick={() => setBookingIntegration(!bookingIntegration)} className="booking-info">How To Integrate</button>
  </div>
      

<BookingSettings />

      </main>
)}


      {bookingIntegration && (
        <div className="integration-popUp">
        <FaTimes onClick={() => setBookingIntegration(false)} className="close-inte" />
        <div className="inte-popUp">
          <div className="integration">
    
          <div className="integration-steps">
      <h2>⚙️Set-Up and integrate booking to your Website</h2>
      <p className="sub-heading">Seamlessly connect your AI-powered booking system to your website in just a few minutes.</p>
    
      <div className="steps-card">
        <div className="step-number">1</div>
        <div className="step-content">
          <h3>Set Up Business Hours</h3>
          <p>Set your operating hours to enable your AI chatbot to manage bookings on your behalf. Integrate easily with your website and deliver a seamless scheduling experience to your customers.</p>
          <div className="step-image">
            <img src={`${process.env.PUBLIC_URL}/img/working-hours.png`} alt="Train your support bot" />
          </div>
        </div>
      </div>
    
      <div className="steps-card">
        <div className="step-number">2</div>
        <div className="step-content">
          <h3>Add Your Services</h3>
          <p>List the services you offer so customers can book directly through your website and chatbot. Customize availability, pricing, and more!</p>
          <div className="step-image">
            <img src={`${process.env.PUBLIC_URL}/img/services.png`} alt="services" />
          </div>
        </div>
      </div>

      <div className="steps-card">
        <div className="step-number">3</div>
        <div className="step-content">
          <h3>Add Your Staff</h3>
          <p>Easily add team members, set services they offer, and let the system handle bookings with AI chatbot integration.</p>
          <div className="step-image">
            <img src={`${process.env.PUBLIC_URL}/img/staff.png`} alt="staff-members" />
          </div>
        </div>
      </div>
    
      <div className="steps-card">
        <div className="step-number">4</div>
        <div className="step-content">
          <h3>Select Your Code And Embed</h3>
          <p>Choose to embed the full booking system on your website for a seamless experience, or simply let the AI chatbot handle bookings without the integration. The choice is yours!</p>
          <div className="step-image">
            <img src={`${process.env.PUBLIC_URL}/img/booking-integrate.png`} alt="staff-members" />
          </div>
        </div>
      </div>
    
      <div className="steps-card">
        <div className="step-number">5</div>
        <div className="step-content">
          <h3>Start getting Appointments</h3>
          <p>Once everything is set up, you're ready to start receiving appointments! Let your AI-powered chatbot handle scheduling your booking process effortlessly.</p>
          <div className="step-image">
            <img src={`${process.env.PUBLIC_URL}/img/appointments.png`} alt="Enable Ai Button" />
          </div>
        </div>
      </div>
    
      <div className="step-final">
  <h3>🎉 All Set!</h3>
  <p>Your booking system is now live and ready to schedule appointments seamlessly. You can manage, track, and customize your settings anytime from your dashboard.</p>
</div>

    </div>
    
    
    
    
          </div>
        </div>
      </div>
      )}

    <main className="dashboard-train" id="botTraining">
    <h1 className="dashboard-title">
          <FaRobot  /> Bot Training
        </h1>
        <BotTraining />
    </main>

    <main className="dashboard-settings" id="settings">
    <h1 className="dashboard-title">
          <FaRobot  /> Settings
        </h1>
        <SettingsPage />
<Footer />

    </main>


      </div>
      
    </div>
  );
};

export default Dashboard;
