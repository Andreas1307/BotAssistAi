import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styling/SignLog.css";
import Header from "../components/Header";
import Footer from "../components/footer";
import axios from "axios";
import directory from './src/directory';

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")
  const navigate = useNavigate();

  // Check if the user is authenticated
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${directory}/auth-check`, { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Redirect authenticated user to dashboard
  useEffect(() => {
    if (!loading && user) {
      if (window.location.pathname === "/login") {
        // Only redirect if the user is manually visiting /login
        navigate(`/${user.username}/dashboard`);
      }
    }
  }, [user, loading, navigate]);

  // Handle form submission
  const handleData = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${directory}/log-in`,
        { email, password },
        { withCredentials: true }
      );
      navigate(`/${response.data.user.username}/dashboard`);
    } catch (e) {
      console.error("Error logging in:", e);
      setError("Invalid Email")
    }
  };

  // Load Google Sign-In SDK
  useEffect(() => {
    if (!loading && !user) {
      const loadGoogleScript = () => {
        const existingScript = document.getElementById("google-signin-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.id = "google-signin-script"; // Important to give it an ID
          document.body.appendChild(script);
  
          script.onload = () => {
            console.log("Google Sign-In SDK loaded successfully.");
            initializeGoogleAuth();
          };
  
          script.onerror = () => {
            console.error("Failed to load Google Sign-In SDK.");
          };
        } else {
          console.log("Google script already in DOM.");
          initializeGoogleAuth();
        }
      };
  
      loadGoogleScript();
    }
  }, [loading, user]); 
  

  // Initialize Google Sign-In
  const initializeGoogleAuth = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: "850376293780-ajetv489mi9k6quklq6ltdjuo8oh7m4n.apps.googleusercontent.com",
        callback: handleGoogleResponse,
        ux_mode: "popup", // Use big popup
      });

      // Render Google Sign-In Button
      renderGoogleButton();
    } else {
      console.error("Google API not available. Please try again later.");
    }
  };

  // Render Google Sign-In Button
  const renderGoogleButton = () => {
    const buttonContainer = document.getElementById("google-signin-btn");
    if (buttonContainer) {
      buttonContainer.innerHTML = ""; // Clear any existing button
      window.google.accounts.id.renderButton(
        buttonContainer,
        { theme: "outline", size: "large", } // Customize button appearance
      );
    } else {
      console.error("Button container not found.");
    }
  };

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response) => {
    if (response.credential) {
      const token = response.credential;
      console.log("Sending token to backend:", token);
  
      try {
        const res = await axios.post(`${directory}/auth/google`, { token }, { withCredentials: true});
        console.log("Response from backend:", res.data);
  
        if (res.data.user) {
          // ✅ Delay navigation to prevent React crash
          setTimeout(() => {
            navigate(`/${res.data.user.username}/dashboard`);
          }, 100); // Delay allows React to process updates
        } else {
          console.error("No user found in backend response.");
        }
      } catch (error) {
        console.error("Error during Google login:", error);
        alert("Google login failed. Please try again.");
      }
    } else {
      console.error("No credential returned from Google Sign-In.");
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <Header />
      <div className="user-sign">
        <div className="sign-div">
          <h2> Log In</h2>
          <form onSubmit={handleData}>
          <div className="input-group">
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter email"
              required
            />
            </div>
            <div className="input-group">
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Enter password"
              required
            />
            </div>
            {error && (<span
            style={{
              color: "red",
              fontWeight: 500,
            }}
            >
              {error}
            </span>)}
            <button type="submit" className="signup-btn">Log In</button>
          </form>

          {/* Google Login Button */}
        
<p className="login-link">
Don't have an account yet? <Link to="/sign-up"> Sign Up Now</Link>
    </p>
        <div id="google-signin-btn"></div>
        </div>
      
      </div>
        <Footer />
    </div>
  );
};

export default LogIn;


// sa ma uit la ce response mi-a dat chat gpt ca primesc token-urile si imi scrie logged in
// dar nu imi da login 

