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
    const [membershipId, setMembershipId] = useState("")
    const [membershipEmail, setMembershipEmail] = useState("")
    const [membershipType, setMembershipType] = useState("");
    const [error, setError] = useState("")
    const [currentPage, setCurrentPage] = useState(1);
    const [latestUsers, setLatestUsers] = useState([])
const [totalMessages, setTotalMessages] = useState(0);
const [expiryDate, setExpiryDate] = useState("")
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
            console.log("LATEST USERS", latestUsers)
        } catch (e) {
            console.log("An error occured fetching the latest users")
        }
      }, [key])
      
    
      





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


    useEffect(() => {
        const interval = setInterval(() => {
          fetchMessages();
          fetchDaylyConversations();
          fetchUserCount();
          fetchProAccounts();
          fetchFreeAccounts();
          fetchLatestUsers();
        }, 10000); // every 10 seconds
      
        return () => clearInterval(interval); // cleanup
      }, [
        fetchMessages,
        fetchDaylyConversations,
        fetchUserCount,
        fetchProAccounts,
        fetchFreeAccounts,
        fetchLatestUsers,
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
            </div>
           
<div className="sHalf">
    <div className="latest-users">
        <h2>Latest Users</h2>

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