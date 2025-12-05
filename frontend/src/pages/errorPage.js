import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom"
import "../styling/error.css"
import { fetchWithAuth } from "../utils/initShopifyAppBridge";
import directory from '../directory';
import { useNavigate } from "react-router-dom";

const Error = () => {
    const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

/*
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchWithAuth("/auth-check");        
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

  
  useEffect(() => {
    if (loading) return;
    
    if (user?.shopify_access_token) {
      navigate("/shopify/dashboard");
      return;
    }
  
      if (user) {
       navigate(`/${user.username}/dashboard`)
      } 
      else {
        navigate("/"); 
      }
    
  }, [user, loading, navigate]);
  */
    return (
        <div className="error-div">
            <h2>Ooops, Error 404, Page Not Found</h2>
            <Link to={"/"}>Return to homepage</Link>
        </div>
    )
}
export default Error
