import React from "react";
import { Link } from "react-router-dom"
import "../styling/footer.css"
import { FaFacebookF, FaTiktok, FaInstagram} from "react-icons/fa"

const Footer = () => {
    return (
        <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h2>BotAssistAI</h2>
          <p>
            Revolutionizing customer support with AI-powered automation. Fast, reliable, and available 24/7.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/About">about</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <Link to="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </Link>
            <Link to="https://www.tiktok.com/@botassistai" target="_blank" rel="noopener noreferrer">
              <FaTiktok />
            </Link>
            <Link to="https://www.instagram.com/botassistai/" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BotAssistAI. All rights reserved.</p>
      </div>
    </footer>
    )
}

export default Footer