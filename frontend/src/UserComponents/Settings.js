import React, { useState, useEffect } from "react";
import { FaCog } from "react-icons/fa";
import "../styling/Settings.css";
import { FaKey } from "react-icons/fa";
import { fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from '../directory';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
const LogoutConfirmToast = ({ closeToast, onConfirm, reason = "Are you sure you want to log out?" }) => (
  <div>
    <p>⚠️ {reason}</p> {/* Fallback to default message */}
    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
      <button
        onClick={() => {
          onConfirm();
          closeToast();
        }}
        style={{
          padding: "9px 18px",
          backgroundColor: "#d9534f",
          border: "none",
          fontWeight: 700,
          color: "white",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Yes, Log Out
      </button>
      <button
        onClick={closeToast}
        style={{
          padding: "9px 18px",
          fontWeight: 700,
          backgroundColor: "#6c757d",
          border: "none",
          color: "white",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  </div>
);


const showLogoutConfirm = (onConfirm, reason) => {
  try {
    toast.info(({ closeToast }) => (
      <LogoutConfirmToast closeToast={closeToast} onConfirm={onConfirm} reason={reason} />
    ), {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
      toastId: "logout-confirm",
    });
  } catch (error) {
    console.log("Error displaying logout confirmation toast:", error);
  }
};


const SettingsPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState("Credit Card");
  const [membershipType] = useState("Premium");
  const [membershipStatus] = useState("Active");
  const [membershipExpiry] = useState("December 31, 2023");
  const [google, setGoogle] = useState(true);

  const handleResetSettings = () => {
    setPaymentType("Credit Card");
    alert("Settings have been reset!");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await fetchWithAuth("/auth-check");        
        setUser(data.user);
      } catch (error) {
        console.error("❌ Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, []);


  const formattedDate = new Date(user.created_at).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // Change to false for 24-hour format
  });

  


  const saveData = async () => {
    try {
      await fetchWithAuth(
        `/change-password`,{
          method: "POST",
          body: { oldPassword, newPassword, userId: user.user_id },
        }
      );
      //Notify here
      setNewPassword("");
      setOldPassword("");
    } catch (e) {
      
      console.log("Error occured with changing the password");
    }
  };

  const handleLogout = async () => {
    try {
      await fetchWithAuth(`/logout`);
      navigate("/");
    } catch (error) {
      console.log("Logout failed", error);
    }
  };

  useEffect(() => {
    const checkGoogle = async () => {
      if (!user) return;
      try {
        const userId = user.user_id;
        const res = await fetchWithAuth(`/check-google_id?${userId}`, {
          method: "GET",
        });

        if (res.data.user.google_id === null) {
          return setGoogle(true);
        } else {
          setGoogle(false);
        }
      } catch (e) {
        console.log("An error occured with checking the google id", e);
      }
    };
    checkGoogle();
  }, [user]);

  const handleRenewMembership = () => {
    alert("Membership has been renewed!");
  };

  return (
    <div className="settings-container">
      <ToastContainer />
      <h2 className="settings-header">
        <FaCog className="icon" /> General Settings
      </h2>

      <div className="settings-form">
        {/* User Details */}
        <div className="form-group">
          <label>Username:</label>
          <input type="text" value={user.username} readOnly />
        </div>

        <div className="form-group">
          <label>Account Created:</label>
          <input type="text" value={formattedDate} readOnly />
        </div>

        {/* Editable Payment Type */}
        <div className="form-group">
          <label>Payment Type:</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)} // Handle payment type change
          >
            <option value="Credit Card">Credit Card</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cryptocurrency">Cryptocurrency</option>
          </select>
        </div>

        {/* Membership Details */}
        <div className="form-group">
          <label>Membership Type:</label>
          <input type="text" value={user.subscription_plan} readOnly />
        </div>

        <div className="form-group">
          <label>Membership Status:</label>
          <input type="text" value={membershipStatus} readOnly />
        </div>

        <div className="form-group">
  <label>Membership Expiry:</label>
  <input
    type="text"
    value={
      user?.subscription_expiry
        ? new Date(user.subscription_expiry).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Never"
    }
    readOnly
  />
</div>

       

        {google && (
          <div>
            <h3>
              <FaKey className="pass-icon" />
              Want to change password?
            </h3>

            <div className="form-group pass">
              <label>Old Password:</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password"
              />
            </div>

            {/* Password Change */}
            <div className="form-group pass">
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>
        )}

        {/* Save & Reset Buttons */}
        <div className="button-group">
          <button className="save-btn" onClick={() => saveData()}>
            Save Password
          </button>
          <button className="reset-btn" onClick={handleResetSettings}>
            Reset Settings
          </button>
        </div>

        {/* Log Out Button */}
        <div className="log-out">
          <button className="logout-btn" onClick={() => showLogoutConfirm(handleLogout)}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
