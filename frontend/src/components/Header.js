import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styling/Header.css";
import {
  FaBars,
  FaTimes,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";

const Header = () => {
  const [collap, setCollap] = useState(false);
  return (
    <header className={`header`}>
      <div className="logo-container">
        <Link to="/">
         
          <div className="logo-text">
            <h1>BotAssistAI</h1>
          </div>
        </Link>
      </div>
      <nav className={`navbar ${collap ? "active" : ""}`}>
        <ul>
          <li>
            <Link to="/features">Features</Link>
          </li>
          <li>
            <Link to="/pricing">Pricing</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <FaTimes onClick={() => setCollap(false)} className="close-icon" />
          <div className="scl-media-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.instagram.com/botassistai/ "
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.tiktok.com/@botassistai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok />
            </a>
          </div>
        </ul>
      </nav>

      <div className="auth-buttons">
        <FaBars onClick={() => setCollap(!collap)} className="bars-icon" />
        <Link to="/sign-up">
          <button className="sign-in">Sign Up</button>
        </Link>
        <Link to="/log-in">
          <button className="log-in">Log In</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
