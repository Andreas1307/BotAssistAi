import React, { useEffect, useState } from "react";
import directory from "../directory";
import axios from "axios";

const PaddleIntegration = () => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
          try {
            const response = await axios.get(`${directory}/auth-check`, { withCredentials: true })
            setUser(response.data.user)
          } catch (e) {
            console.log("Error fetching the user", e)
          }
        }
        fetchUser()  
      }, [])

  useEffect(() => {
    // Create a script element for Paddle.js
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;

    document.body.appendChild(script);

    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Initialize({   
          token: process.env.PADDLE_TOKEN,
        });
        console.log("Paddle initialized successfully");
      } else {
        console.error("Paddle failed to initialize.");
      }
    };
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openCheckout = () => {
    if (window.Paddle) {
      console.log("Opening checkout...");

      try {
        window.Paddle.Checkout.open({
          items: [
            {
              priceId: "pri_01jtj2k0wftmmr59x8fgd4sad1", 
              quantity: 1, 
            },
          ],
          customData: {
            userId: user.user_id, 
          },
          successUrl: `https://botassistai.com/${user.username}/dashboard`, // Replace with the URL to redirect to on successful checkout
          theme: "dark", // Replace with your desired theme
          locale: "en", // Replace with your desired locale
          frameStyle: "min-width: 312px;", // Custom CSS to style the checkout frame
          displayMode: "overlay", // or 'inline' based on your design
          frameInitialHeight: 450, // Recommended height for the checkout frame
        });
      } catch (error) {
        console.error("Error opening Paddle checkout:", error);
      }
    } else {
      console.error("Paddle is not ready yet!");
    }
  };

  return (
    <div>
      {/* Your component JSX here */}
      <button onClick={openCheckout} style={{
        padding: "10px 26px",
        fontWeight: "600",
        borderRadius: "13px",
        color: "#fff",
        fontFamily: '"Space Grotesk", sans-serif',
        background: "linear-gradient(90deg, #0077ff, #9b00ff, #ff007a)",
        border: 0,
        cursor: "pointer",
        fontSize: "17px",
        margin: "10px 0"
      }}>Open Checkout</button>
    </div>
  );
};

export default PaddleIntegration;
