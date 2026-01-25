import React, { useEffect, useRef, useState, useMemo } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "../styling/AnalyticsPage.css";
import { fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from '../directory';
import { Link } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
import { handleBilling } from "../utils/billing";

const AnalyticsPage = () => {
  const chartRefs = useRef([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [membership, setMembership] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resData, setResData] = useState([])
  const [time, setTime] = useState(null)
  const [dailyCount, setDailyCount] = useState(0)
  const [yestCount, setYestCount] = useState(0)
  const [activityData, setActivityData] = useState(new Array(6).fill(0));



  const [lastWeekData, setLastWeekData] = useState({
    labels: [],
    datasets: [{
      label: "Daily Count",
      data: [],
      borderColor: "#FF5722",
        backgroundColor: "rgba(255, 87, 34, 0.2)",
        tension: 0.4,
    }]
  });
  

  const showErrorNotification = ( ) => {
    toast.error("Something went wrong with charts. Please try again.", {
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
const [shopifyUser, setShopifyUser] = useState(false)


  const activatePlan = async () => {
    await handleBilling(user.user_id);
  };
  
  
  const [needsReconnect, setNeedsReconnect] = useState(false);
  useEffect(() => {

        const fetchUser = async () => {
          try {
            const res = await fetchWithAuth("/auth-check"); 
            setUser(res.user);
           
           if (res === null || res.needsReconnect) {
            setNeedsReconnect(true);
            return;
          }

          if(res.user.shopify_access_token){
            setShopifyUser(true)
          } else {
            setShopifyUser(false)
          }
    
          } catch (error) {
            setUser(null);
            showErrorNotification()
            setNeedsReconnect(true);
          } finally {
            setLoading(false);
          }
        };
        fetchUser();
        
      }, []);

  
  
  // FETCH MEMBERSHIP
  useEffect(() => {
    const fetchMembership = async () => {
      if (!user) return
      try{
        const userId = user?.user_id;
        const response = await fetchWithAuth(`/get-membership?userId=${userId}`, {
          method: "GET",
        });
        if(response.message.subscription_plan === "Pro") {
          setMembership(true)
        } else {
          setMembership(false)
        }
      } catch(e) {
        console.log("Error occured with retreiveing the membership status",e)
        //NOTIFY HERE
      }
    }
    fetchMembership()
  }, [user])

  //FETCH DAILY COUNT
  useEffect(() => {
    const fetchDaily = async () => {
      if(!user) return
      try {
        const userId = user?.user_id;
        const res = await fetchWithAuth(`/daily-messages?userId=${userId}`, {
          method: "GET",
        });
        setDailyCount(res.dailyMessages)
      } catch(e) {
        console.log("An error occured fetching daily conversations num", e)
        //NOTIFY HERE
      }
    }
    fetchDaily()
  }, [user])
//FETCH YESTERDAY COUNT
  useEffect(() => {
    const fetchYesterday = async () => {
      if(!user) return
      try {
        const userId = user?.user_id;
        const res = await fetchWithAuth(`/yesterday-messages?userId=${userId}`, {
          method: "GET",
        });
        setYestCount(res.yesterdayMessages)
      } catch(e) {
        console.log("❌ Error fetching yesterday's messages:", e);
        showErrorNotification()
      }
    }
    fetchYesterday()
  }, [user])
//FETCH RESPONSE TIME
  useEffect(() => {
    let intervalId;
    const fetchResTime = async () => {
      if(!user) return
      try {
        const userId = user?.user_id;
        const res = await fetchWithAuth(`/resTime-graph?userId=${userId}`, {
          method: "GET",
        });
        if (res === null) {
          if (intervalId) clearInterval(intervalId);
          return;
        }
        const arr = Array.isArray(res?.message) ? res.message : [];
      setResData(arr.slice(-5));
        
      } catch(e) {
        console.log("An error has occured with retreiving the response time for chart", e)
        showErrorNotification()
      }
    }
    fetchResTime()
   


    intervalId = setInterval(fetchResTime, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user])

  useEffect(() => {
    if (!user) return;
  
    const fetchLastWeekData = async () => {
      try {
        const userId = user.user_id;
        const res = await fetchWithAuth(`/chat-stats/last-7-days?userId=${userId}`, {
          method: "GET",
        });
  
        const counts = {};
        const rawData = Array.isArray(res) ? res : res.data || [];
        rawData.forEach(row => {
          const dateStr = new Date(row.date).toDateString(); // Get date without time
          counts[dateStr] = row.message_count; // Store message counts
        });
  
        const labels = [];
        const data = [];
  
        // Loop to create labels and data for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toDateString();
  
          // Create labels
          labels.push(i === 0 ? "Today" : `${i} Days Ago`); // Display "Today" for today's count
          data.push(counts[dateStr] || 0); // Get count or 0 if not present
        }
  
        setLastWeekData({
          labels,
          datasets: [{
            label: "Daily Count",
            data,
            backgroundColor: "#3F51B5",
          }]
        });
      } catch (e) {
        console.log("Error fetching last 7 days data:", e);
        showErrorNotification()
      }
    };
  
    fetchLastWeekData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
  
    const fetchChatData = async () => {
      try {
        const userId = user.user_id
        const res = await fetchWithAuth(`/chat-history?userId=${userId}`, {
          method: "GET",
        });
        if (res.messages) {
          const timeRanges = new Array(6).fill(0);
  
          res.messages.forEach((msg) => {
            const hour = new Date(msg.timestamp).getHours();
            const index = Math.floor(hour / 4); // Group hours into 4-hour slots
            timeRanges[index]++;
          });
  
          setActivityData(timeRanges);
        }
      } catch (error) {
        console.log("Error fetching chat history:", error);
        showErrorNotification()
      }
    };
  
    fetchChatData();
  }, [user]);
  
  const apiResponseData = useMemo(() => ({
    labels: resData
      ? resData.map((item) => {
          const now = Date.now();
          const timestamp = new Date(item.timestamp).getTime();
          const diffMs = now - timestamp;
  
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
          if (diffMinutes < 1) return "Just now";
          if (diffMinutes < 60) return `${diffMinutes} min ago`;
          if (diffHours < 24) return `${diffHours} hr ago`;
          return `${diffDays} days ago`;
        })
      : [],
    datasets: [
      {
        label: "Response Time (ms)",
        data: resData
          ? resData.map((item) => item.res_duration)
          : [],
        borderColor: "#FF5722",
        backgroundColor: "rgba(255, 87, 34, 0.2)",
        tension: 0.4,
      },
    ],
  }), [resData]);

 
  // Peak Activity Time
  const peakActivityData = {
    labels: [
      "12 AM - 4 AM",
      "4 AM - 8 AM",
      "8 AM - 12 PM",
      "12 PM - 4 PM",
      "4 PM - 8 PM",
      "8 PM - 12 AM"
    ],
    datasets: [
      {
        label: "Messages Per Time Range",
        data: activityData, // ✅ Now it's grouped into 6 slots
        borderColor: "#FF5722",
        backgroundColor: "rgba(255, 87, 34, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Chats Today & Active Chats
  const chatData = {
    labels: ["Chats Yesterday", "Today's Chats"],
    datasets: [
      {
        label: "Chat Activity",
        data: [yestCount, dailyCount],
        backgroundColor: ["#673AB7", "#3F51B5"],
      },
    ],
  };
  
 
  // Handle resize event to update windowWidth
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Resize charts when windowWidth changes
  useEffect(() => {
    chartRefs.current.forEach((chart) => {
      if (chart?.chart) {
        chart.chart.resize(); // Resize chart when windowWidth changes
      }
    });
  }, [windowWidth]);


 
  return (
<div className="analytics-container">
    <ToastContainer />
<div style={{opacity: !membership ? 0.5 : 1}} className="charts">
  <div className="chart-section">
    <h2>⚡ API Response Time</h2>
    <Line 
      ref={(el) => (chartRefs.current[0] = el)} 
      data={membership ? apiResponseData : { labels: [], datasets: [] }} 
    />
  </div>

  <div className="chart-section">
    <h2>📈 Peak Activity Time</h2>
    <Line 
      ref={(el) => (chartRefs.current[3] = el)} 
      data={membership ? peakActivityData : { labels: [], datasets: [] }} 
    />
  </div>
</div>
<div style={{opacity: !membership ? 0.5 : 1}} className="charts">
  <div className="chart-section">
    <h2>💬 Chats Today vs Yesterday</h2>
    <Bar 
      ref={(el) => (chartRefs.current[4] = el)} 
      data={membership ? chatData : { labels: [], datasets: [] }} 
    />
  </div>

  <div className="chart-section">
    <h2>💬 Last 7 Days</h2>
    <Line 
      ref={(el) => (chartRefs.current[5] = el)} 
      data={membership ? lastWeekData : { labels: [], datasets: [] }} 
    />
  </div>
  </div>


{shopifyUser && !membership ? (
  // 🟢 Case 1: Shopify user, not Pro yet → activate plan
  <div onClick={activatePlan} className="upgrade-div">
    <span>Upgrade Plan To See More</span>
  </div>
) : shopifyUser && membership ? null : (
  // 🟡 Case 2: Non-Shopify user → link to upgrade page
  <Link to={`/${user?.username}/upgrade-plan`}>
    <div className="upgrade-div">
      <span>Upgrade Plan To See More</span>
    </div>
  </Link>
)}

 
    </div>
  );
};

export default AnalyticsPage;
