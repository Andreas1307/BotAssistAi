import React, { useState } from "react";
import "../styling/newsletter.css";
import axios from "axios";
import directory from '../directory'; 
const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");


  const submitEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${directory}/newsletter`,
        { email: email },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setMessage(response.data);
    } catch (e) {
      console.log("An error has occurred with sending the email");
      setError("Error occurred with subscribing");
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter-text">
        <h2>📩 Stay Updated with BotAssistAI</h2>
        <p>
  Stay updated with AI-driven customer support insights and exclusive offers. Join businesses optimizing support with AI!
</p>

      </div>

      <div className="newsletter-form-container">
        <form onSubmit={submitEmail} className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">🚀 Subscribe</button>
        </form>
        {message && <p style={{color: "#00f5d4", fontSize: "16px", fontWeight: 600, marginBottom: "-10px"}} className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <p className="small-text">No spam, just valuable insights. Unsubscribe anytime.</p>
      </div>
    </section>
  ); 
};

export default Newsletter;
