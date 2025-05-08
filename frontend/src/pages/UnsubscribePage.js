import React, { useEffect, useState } from 'react';
import '../styling/UnsubscribePage.css';
import axios from 'axios';
import directory from './src/directory';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.get(`${directory}/unsubscribe`, {
            params: { email }
        })
        window.close()
    } catch (e) {
       console.log("Error occured with unsubscribing", e)
    }
  };

  return (
    <div className="unsubscribe-container">
      <div className="unsubscribe-box">
        <h1>🔕 Unsubscribe</h1>
        <p>We're sorry to see you go. Confirm your email to unsubscribe.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            placeholder="Email address"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Unsubscribe</button>
        </form>
      </div>
    </div>
  );
}
