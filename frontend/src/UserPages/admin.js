import React, { useEffect, useState } from "react";
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
    const { key } = useParams();

  
    useEffect(() => {
      if (!key) {
        alert("Missing admin key.");
        return;
      }
    }
    )

    useEffect(() => {
        const fetchDaylyConversations = async () => {
            try {
                const response = await axios.get(`${directory}/admin-daily-conversations` , {params: {key: key}})
                   setDailyConversations(response.data.totalMessages)
            } catch (e) {
                console.log("An error occured fetching dayly conversations", e)
                setDailyConversations(0)
            }
        }
        fetchDaylyConversations()
    })

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const response = await axios.get(`${directory}/admin-users-count`, { params: { key: key }});
                setUsersCount(response.data.totalUsers)
            } catch(e) { 
                console.log("An error occured fetching dayly conversations", e)
                setUsersCount(0)
            }
        }
        fetchUserCount()
    })

    useEffect(() => {
        const fetchProAccounts = async () => {
            try {
                const response = await axios.get(`${directory}/admin-users-pro`, { params: { key: key }});
                setProAccounts(response.data.proUsers)
            } catch(e) { 
                console.log("An error occured fetching pro accounts", e)
                setProAccounts(0)
            }
        }
        fetchProAccounts()
    })

    useEffect(() => {
        const fetchFreeAccounts = async () => {
            try {
                const response = await axios.get(`${directory}/admin-users-free`, { params: { key: key }});
                setFreeAccounts(response.data.freeUsers)
            } catch(e) { 
                console.log("An error occured fetching free accounts", e)
                setFreeAccounts(0)
            }
        }
        fetchFreeAccounts()
    })

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.post(`${directory}/admin-messages`, { key: key });
                setMessgaes(response.data.messages)
            } catch(e) { 
                console.log("An error occured fetching free accounts", e)
                setMessgaes([])
            }
        }
        fetchMessages()
    })

    //sa vad daca merge, sa fac design, sa pot sa sterg conversatile pe care le-am vazut

    return (
        <div className="admin-page">
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
            <div className="admin-messages">
                <h2>Messages</h2>
                {messages.map((m, key) => (
                    <div className="admin-msg" key={key}>
                    <p><strong>Message id:</strong> {m.id}</p>
                    <p><strong>User Id:</strong> {m.user_id}</p>
                    <p><strong>User Email:</strong> {m.user_email}</p>
                    <p><strong>Message:</strong> {m.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default AdminPage;