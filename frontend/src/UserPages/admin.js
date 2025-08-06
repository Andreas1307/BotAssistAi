import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import "../styling/admin.css";
import directory from '../directory';
import axios from "axios";


const AdminPage = () => {
    const [dailyConversations, setDailyConversations] = useState(0)
    const [messages, setMessgaes] = useState([])
    const [usersCount, setUsersCount] = useState(0)
    const [proAccounts, setProAccounts] = useState(0);
    const [freeAccounts, setFreeAccounts] = useState(0)
    const [shopifyAccounts, setShopifyAccounts] = useState(0)
    const [unresolvedQueries, setUnresolvedQueries] = useState(0)
    const [totalConvs, setTotalConvs] = useState(0)
    const [membershipId, setMembershipId] = useState("")
    const [membershipEmail, setMembershipEmail] = useState("")
    const [membershipType, setMembershipType] = useState("");
    const [error, setError] = useState("")
    const [currentPage, setCurrentPage] = useState(1);
    const [latestUsers, setLatestUsers] = useState([])
    const [totalMessages, setTotalMessages] = useState(0);
    const [selectedOption, setSelectedOption] = useState("");
    const [selectedMeasure, setSelectedMeasure] = useState("")
    const [findInput, setFindInput] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [findData, setFindData] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [userId, setUserId] = useState([])
    const [email, setEmail] = useState("")
    const messagesPerPage = 20;
    const { key } = useParams();


    useEffect(() => {
      if (!key) {
        alert("Missing admin key.");
        return;
      }
    }
    ) 

   
    const fetchMessages = useCallback(async () => {
        try {
          const response = await axios.get(`${directory}/admin-messages`, {
            params: { key: key, page: currentPage, limit: messagesPerPage },
          });
          setMessgaes(response.data.messages);
          setTotalMessages(response.data.total);
        } catch (e) {
          console.log("An error occurred fetching messages", e);
          setMessgaes([]);
        }
      }, [key, currentPage]);
      
      const fetchDaylyConversations = useCallback(async () => {
        try {
          const response = await axios.get(`${directory}/admin-daily-conversations`, { params: { key } });
          setDailyConversations(response.data.totalMessages);
        } catch (e) {
          console.log("Error fetching daily conversations", e);
          setDailyConversations(0);
        }
      }, [key]);
      
      const fetchUserCount = useCallback(async () => {
        try {
          const response = await axios.get(`${directory}/admin-users-count`, { params: { key } });
          setUsersCount(response.data.totalUsers);
        } catch (e) {
          console.log("Error fetching user count", e);
          setUsersCount(0);
        }
      }, [key]);
      
      const fetchProAccounts = useCallback(async () => {
        try {
          const response = await axios.get(`${directory}/admin-users-pro`, { params: { key } });
          setProAccounts(response.data.proUsers);
        } catch (e) {
          console.log("Error fetching pro accounts", e);
          setProAccounts(0);
        }
      }, [key]);
      
      const fetchFreeAccounts = useCallback(async () => {
        try {
          const response = await axios.get(`${directory}/admin-users-free`, { params: { key } });
          setFreeAccounts(response.data.freeUsers);
        } catch (e) {
          console.log("Error fetching free accounts", e);
          setFreeAccounts(0);
        }
      }, [key]);

      const fetchLatestUsers = useCallback(async () => {
        try {
            const response = await axios.get(`${directory}/admin-latest-users`, { params: { key }})
            setLatestUsers(response.data.users)
        } catch (e) {
            console.log("An error occured fetching the latest users")
        }
      }, [key])

      const fetchshopifyUsers = useCallback(async () => {
        try {
          const response = await axios.get(`${directory}/get-shopify-users-count`)
          setShopifyAccounts(response.data.count)
        } catch (e) {
          console.log("An error occured while trying to get the shopify users count", e);
        }
      }, [key])

      const fetchUnresolvedQueries = useCallback(async () => {
        try{
          const response = await axios.get(`${directory}/admin-unresolved-queries`)
          setUnresolvedQueries(response.data.count)
        } catch (e) {
          console.log("An error occured fetching the resolved queries", e)
        }
      }, [key])

      const fetchTotalConvs = useCallback(async () => {
        try {
          const response = await axios.get(`${directory}/admin-convs`)
          setTotalConvs(response.data.count)
        } catch (e) {
          console.log("An error occured fetching the total num of conversations", e)
        }
       }, [key])

       const fetchSuggestions = useCallback(async () => {
        try {
          const response = await axios.get(`${directory}/admin-suggestions`)
          setSuggestions(response.data.suggestions)
        } catch(e) {
          console.log("Error occured trying to fetch suggetsions", e)
        }
       })
      
      
  

      const findDataFunc = async (e) => {
        e.preventDefault()
        try{
            if(selectedOption === "" || selectedOption === "-- Select an Option --") {
                alert("Select an option")
            }
            if(selectedMeasure === "" || selectedMeasure === "-- Select an Option --") {
                alert("Select an option")
            }
            if (findInput === "") {
                alert("Enter a user Id")
            }
            const response = await axios.get(`${directory}/find-admin-data`, { params: { id: findInput, selectedOption, selectedMeasure}})
            setFindData(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (e) {
            console.log("An error occured while trying to receive all the data", e)
        }
      }

    const deleteMessage = async (id) => {
        try {
            await axios.get(`${directory}/admin-delete-message`, { params: { key: key, id: id}})
            fetchMessages()
        } catch(e) {
            console.log("An error occured deleting the message")
        }
    } 

    const handleMemChange = async (e) => {
        e.preventDefault()
        if(membershipType === "") {
            return alert("You didnt select any Membership Type")
        }

        if (membershipType === "Pro" && !expiryDate) {
            return alert("Please select an expiry date for Pro membership");
          }

        try {
              const response = await axios.get(`${directory}/change-membership`, {
      params: {
        id: membershipId,
        email: membershipEmail,
        membershipType,
        expiryDate: membershipType === "Pro" ? expiryDate : null,
      },
    });
            setError(response.data.message)
        } catch(e) {
            console.log("An error occured changing the user membership", e)
            setError("An error occured changing the user membership")
        }
    }

    const deleteSuggestion = async (id) => {
      try {
        await axios.get(`${directory}/delete-suggestion`, {params: {id}})
        fetchSuggestions()
      } catch (e) {
        console.log("Error occured while trying to delete suggestion", e)
      }
    }

    const getUserId = async () => {
      try {
        const response = await axios.get(`${directory}/admin-user-id`, { params: { email }})
        setUserId(response.data.id)
      } catch(e) {
        console.log("Error occured fetching the userId", e)
      }
    }

    useEffect(() => {
        const interval = setInterval(() => {
          fetchMessages();
          fetchDaylyConversations();
          fetchUserCount();
          fetchProAccounts();
          fetchFreeAccounts();
          fetchLatestUsers();
          fetchshopifyUsers();
          fetchUnresolvedQueries();
          fetchTotalConvs();
          fetchSuggestions()
        }, 10000);
      
        return () => clearInterval(interval);
      }, [
        fetchMessages,
        fetchDaylyConversations,
        fetchUserCount,
        fetchProAccounts,
        fetchFreeAccounts,
        fetchLatestUsers,
        fetchshopifyUsers,
        fetchUnresolvedQueries,
        fetchTotalConvs,
        fetchSuggestions,
      ]);
      

    return (
        <div className="admin-box">
        <div className="admin-page">
            <div className="fHalf">
                 <div className="admin-boxes">
                <div className="admin-box">
                <h2>Daily Conversations</h2>
                <p>{dailyConversations}</p>
            </div>
            <div className="admin-box">
                <h2>Users Count</h2>
                <p>{usersCount}</p>
            </div>
            <div className="admin-box">
                <h2>Pro Accounts</h2>
                <p>{proAccounts}</p>
            </div>
            <div className="admin-box">
                <h2>Free Accounts</h2>
                <p>{freeAccounts}</p>
            </div>
            <div className="admin-box">
                <h2>Shopify Accounts</h2>
                <p>{shopifyAccounts}</p>
            </div>
            <div className="admin-box">
                <h2>Total Convs</h2>
                <p>{totalConvs}</p>
            </div>
            <div className="admin-box">
                <h2>Unresolved Queries</h2>
                <p>{unresolvedQueries}</p>
            </div>
            </div>
           
             <div className="admin-membership">
                <h2>Change Membership</h2>
                <form onSubmit={handleMemChange}> 
                <input type="text" placeholder="Enter Merchants Id" value={membershipId} onChange={(e) => setMembershipId(e.target.value)} required />
                <input type="text" placeholder="Enter Merchants Email" value={membershipEmail} onChange={(e) => setMembershipEmail(e.target.value)} required/>
                <div className="button-group">
  <button
    type="button"
    className={membershipType === "Pro" ? "selected" : ""}
    onClick={() => setMembershipType("Pro")}
  >
    Pro
  </button>
  <button
    type="button"
    className={membershipType === "Free" ? "selected" : ""}
    onClick={() => setMembershipType("Free")}
  >
    Default
  </button>
</div>
{membershipType === "Pro" && (
    <input
      type="date"
      value={expiryDate}
      onChange={(e) => setExpiryDate(e.target.value)}
      required
    />
  )} 
                <button className="saveMem" type="submit">Save</button>
                </form>
                {error}
             </div>
             <div className="getUserId">
              <input type="text"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={() => getUserId()}>Find</button>
              {userId.map((e, key) => (
                <div key={key}>
                  <p><strong>User Id:</strong>{e.user_id}</p>
                  <p><strong>Username:</strong>{e.username}</p>
                  <p><strong>Email:</strong>{e.email}</p>
                  <p><strong>Created Account:</strong>{e.created_at}</p>
                  <p><strong>Plan:</strong>{e.subscription_plan}</p>
                  <p><strong>Last Login:</strong>{e.last_login}</p>
                  <p><strong>Api Bot:</strong>{e.apiBot}</p>
                  <p><strong>Last Connected:</strong>{e.last_connected}</p>
                  <p><strong>Bookings:</strong>{e.booking}</p>
                  </div>
              ))}
             </div>
             <div className="admin-suggestions">
              <h2>Suggestions</h2>
              {suggestions.map((s, key) => (
                <div className="a-suggestion" key={key}>
                  <p><strong>Message:</strong> {s.message}</p>
                  <button onClick={() => deleteSuggestion(s.id)}>Delete</button>
                </div>
              ))}
             </div>

             <div className="adminNewsletter">
<h2>Newsletter</h2>
<button onClick={() => window.open(`${directory}/download-newsletter-emails`, '_blank')}>
  Get Emails
</button>

             </div>
             
            </div>
           
<div className="sHalf">
    <div className="latest-users">
        <h2>Latest Users</h2>
        {latestUsers.map((m, id) => (
            <div className="latestUser" key={id}>
                <p><strong>ID:</strong>{m.user_id}</p>
                <p><strong>Username:</strong>{m.username}</p>
                <p><strong>Email:</strong>{m.email}</p>
                <p><strong>Created At:</strong> {new Date(m.created_at).toLocaleString()}</p>
            </div>
        ))}
    </div>

    <div className="findUsers">
      <h2>Find About Users</h2>
        <form onSubmit={findDataFunc} className="findInputs"> 
            <input 
            placeholder="Enter User's Id"
            value={findInput}
            onChange={(e) => setFindInput(e.target.value)}
            />
            <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
            <option value="">-- Select a Table --</option>
            <option value="allowed_domains">allowed_domains</option>
            <option value="appointments">appointments </option>
            <option value="chat_messages">chat_messages</option>
            <option value="customer_feedback">customer_feedback</option>
            <option value="error_logs">error_logs</option>
            <option value="faq">faq</option>
            <option value="services">services</option>
            <option value="shopify_installs">shopify_installs</option>
            <option value="staff">staff</option>
            <option value="user_messages">user_messages</option>
            <option value="users">users</option>
            <option value="working_hours ">working_hours</option>
            </select>
            <select value={selectedMeasure} onChange={(e) => setSelectedMeasure(e.target.value)}>
                <option value="">-- Select quantity --</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="30">30</option>
                <option value="35">35</option>
                <option value="40">40</option>
                <option value="All">All</option>

            </select>
            <button type="submit">Find</button>
        </form>
        {findData.map((e, key) => (
            <div className="findData" key={key}>

            </div>
        ))}
    </div>
     <div className="admin-messages">
                <h2>Messages</h2>
                {messages.map((m, key) => (
                    <div className="admin-msg" key={key}>
                    <p><strong>Message id:</strong> {m.id}</p>
                    <p><strong>User Id:</strong> {m.user_id}</p>
                    <p><strong>User Email:</strong> {m.user_email}</p>
                    <p><strong>Message:</strong> {m.message}</p>
                    <button onClick={() => deleteMessage(m.id)}>Delete</button>
                    </div>
                ))}
                <div className="pagination-buttons">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
  >
    Previous
  </button>

  <span>Page {currentPage}</span>

  <button
    onClick={() =>
      setCurrentPage((prev) =>
        prev < Math.ceil(totalMessages / messagesPerPage) ? prev + 1 : prev
      )
    }
    disabled={currentPage >= Math.ceil(totalMessages / messagesPerPage)}
  >
    Next
  </button>
</div>

            </div>
</div>



        </div>
        </div>
    )
}
export default AdminPage;