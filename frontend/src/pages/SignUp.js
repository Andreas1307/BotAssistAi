import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styling/SignLog.css";
import Header from "../components/Header";
import Footer from "../components/footer";
import directory from "../directory";
import axios from "axios";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [error, setError] = useState("")
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${directory}/auth-check`, { withCredentials: true });
        if (res.data.user) {
          navigate(`/${res.data.user.username}/dashboard`);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [navigate]);
  

  useEffect(() => {
    if (!loading) {
      const loadGoogleScript = () => {
        if (window.google?.accounts) {
          console.log("✅ Google API already loaded.");
          setGoogleLoaded(true);
          initializeGoogleAuth();
          return;
        }
  
        const existingScript = document.getElementById("google-signin-script");
        if (existingScript) {
          console.log("✅ Google script already in DOM.");
          initializeGoogleAuth(); // <<-- very important to call
          return;
        }
  
        const script = document.createElement("script");
        script.id = "google-signin-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
  
        script.onload = () => {
          if (window.google?.accounts) {
            console.log("✅ Google API loaded successfully.");
            setGoogleLoaded(true);
            initializeGoogleAuth();
          } else {
            console.error("❌ Google API failed to load.");
          }
        };
  
        script.onerror = () => {
          console.error("❌ Failed to load Google API.");
        };
  
        document.body.appendChild(script);
      };
  
      loadGoogleScript();
    }
  }, [loading]); 
  




    
  const initializeGoogleAuth = () => {
    window.google.accounts.id.initialize({
      client_id: "850376293780-ajetv489mi9k6quklq6ltdjuo8oh7m4n.apps.googleusercontent.com",
      callback: handleGoogleResponse,
      ux_mode: "popup",
    });

    renderGoogleButton();
  };

  const renderGoogleButton = () => {
    const googleBtnContainer = document.getElementById("google-signin-btn");
    if (!googleBtnContainer) {
      console.error("❌ Google Sign-In button container not found.");
      return;
    }

    try {
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          logo_alignment: "left",
        }
      );
         
      console.log("✅ Google Sign-In button rendered.");
    } catch (error) {
      console.error("❌ Failed to render Google Sign-In button:", error);
      setTimeout(() => renderGoogleButton(), 1000); 
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false); // 👈 Add this
      return;
    }
    try {
      const res = await axios.post(
        `${directory}/register`,
        { username, email, password },
        { withCredentials: true }
      );
      
      if (res.data?.user?.username) {
        navigate(`/${res.data.user.username}/dashboard`);
      } else {
        setError("Something went wrong during signup.");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setError("Signup failed. Invalid username or email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    if (!response || !response.credential) {
      console.warn("⚠️ Google Sign-In aborted or dismissed.");
      return;
    }

    try {
      const res = await axios.post(`${directory}/auth/google`,
        { token: response.credential },
        { withCredentials: true }
      );
      console.log("✅ Google Login Successful:", res.data);
      navigate(`/${res.data.user.username}/dashboard`);
    } catch (error) {
      console.error("❌ Google Sign-In failed:", error);
      alert("Google Sign-In failed. Please try again.");
    }
  };

  // ✅ Force BIG Google Popup
  const handleGoogleSignUpClick = () => {
    if (!googleLoaded) {
      console.error("❌ Google API not loaded yet.");
      return;
    }

    window.google.accounts.id.prompt();
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <Header />
      <div className="user-sign">
  <div className="sign-div">
    <h2>Create an Account</h2>
    <form onSubmit={handleSignUp}>
      <div className="input-group">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a username"
          required
        />
      </div>
      <div className="input-group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a password"
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
      <button type="submit" className="signup-btn">Sign Up</button>
    </form>
    <p className="login-link">
      Already have an account? <Link to="/log-in">Log in Now</Link>
    </p>

    {/* Google Sign-In Button */}
    <div id="google-signin-btn"></div>
  </div>
</div>
      <Footer />
    </div>
  );
};

export default SignUp;
