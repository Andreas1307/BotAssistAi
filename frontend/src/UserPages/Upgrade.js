import React, { useState, useEffect } from "react";
import { FaRocket, FaCheckCircle, FaTimesCircle, FaStar, FaBolt, FaShieldAlt } from "react-icons/fa";
import "../styling/upgrade.css"; // Make sure to style this with Tailwind or CSS
import axios from "axios";
import directory from "../directory";
import StripeCheckout from "../UserComponents/StripeCheckout";
import PaddleCheckout from "../UserComponents/PaddleCheckout";
import { Link } from "react-router-dom"
const UpgradeNow = ({ closePage }) => {
  const [timer, setTimer] = useState(60);
  const [user, setUser] = useState(null)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${directory}/auth-check`, { withCredentials: true })
        setUser(response.data.user)
      } catch (e) {
        console.log("Error fetching the user", e)
        //NOTIFY HERE
      }
    }
    fetchUser()
  }, [])



  
  return (
    <div className="upgrade">
      <div className="upgrade-wrapper">
    <div className="upgrade-container">
      {/* Header Section */}
      <div className="upgrade-header">
        <h1><FaRocket className="icon" /> Unlock AI's Full Power with Premium!</h1>
        <p>Supercharge your AI experience with **faster responses, advanced training, and exclusive tools.**</p>
      </div>

      {/* Urgency Offer 
      <div className="limited-offer">
        <FaStar className="icon gold" /> **Limited Offer:** Get 20% off **(Ends in {timer}s!)**
      </div>
*/}
      {/* Feature Comparison */}
      <div className="features-grid">
  <div className="feature-item">
    <FaCheckCircle className="icon green" />
    <p>Unlimited AI Chats – No daily limits</p>
  </div>
  <div className="feature-item">
    <FaCheckCircle className="icon green" />
    <p>Faster Responses – Instant answers</p>
  </div>
  <div className="feature-item">
    <FaCheckCircle className="icon green" />
    <p>Live Chat Analytics – Track in real time</p>
  </div>
  <div className="feature-item">
    <FaCheckCircle className="icon green" />
    <p>Conversation History – Keep all chats</p>
  </div>
  <div className="feature-item">
    <FaCheckCircle className="icon green" />
    <p>Advanced Settings – Customize with ease</p>
  </div>
  <div className="feature-item">
    <FaCheckCircle className="icon green" />
    <p>Smarter AI – More accurate replies</p>
  </div>
</div>


     
      <div className="checkout-section">
        <h3 className="price">$20.00 / month</h3>

    </div>

    <PaddleCheckout />
     <Link to={`${user?.username}/dashboard`}> <button  className="back-btn">⬅️ Back</button></Link>
     
    </div>
   
    </div>
    </div>
    
  );
};

export default UpgradeNow;
