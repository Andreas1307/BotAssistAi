import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom"
import "../styling/error.css"
import axios from "axios";
import directory from "../directory";
import { useNavigate } from "react-router-dom";

const Error = () => {
    const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


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
  useEffect(() => {
    if (!loading) {
      if (user) {
       navigate(`/${user.username}/dashboard`)
      } else {
        navigate("*"); 
      }
    }
  }, [user, loading, navigate]);
    return (
        <div className="error-div">
            <h2>Ooops, Error 404, Page Not Found</h2>
            <Link to={"/"}>Return to homepage</Link>
        </div>
    )
}
export default Error