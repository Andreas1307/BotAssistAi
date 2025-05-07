import React from "react";
import "../styling/dashboard.css"
import { FaFacebook, FaInstagram, FaTiktok} from "react-icons/fa"

const Footer = () => {
    return (
        <footer className="dash-footer">
            <h2>Follow Us On:</h2>
            <div className="footer-icons">
                <a target="_blank" href=""><FaFacebook /></a>
                <a target="_blank" href="https://www.tiktok.com/@botassistai"><FaTiktok /></a>
                <a target="_blank" href="https://www.instagram.com/botassistai/"><FaInstagram /></a>
            </div>
        </footer>
    )
}
export default Footer