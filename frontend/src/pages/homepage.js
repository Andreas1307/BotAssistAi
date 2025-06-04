import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"
import "../styling/homepage.css";
import Header from "../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faHeartPulse,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import { FaTimesCircle, FaClock, FaDollarSign, FaRobot, FaBolt, FaChartLine, FaGlobe, FaUsers, FaCogs, FaQq } from "react-icons/fa";
import { FaStopCircle, FaTwitter, FaLinkedinIn, FaInstagram, FaChartBar, FaShieldAlt, FaUserPlus } from "react-icons/fa";
import Newsletter from "../components/newsletter";
import Footer from "../components/footer";
import HowItWorks from "../components/howItWorks"
import Faq from "../components/faq"
import directory from '../directory';
import axios from "axios";
import { Helmet } from "react-helmet";
const Homepage = () => {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 200; i++) {
      newStars.push({
        top: Math.random() * 100 + "vh",
        left: Math.random() * 100 + "vw",
        duration: 10 + Math.random() * 20,
        delay: Math.random() * 5,
      });
    }
    setStars(newStars);
  }, []);

  const location = useLocation()
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
        navigate(`/${user.username}/dashboard`);
      } else if (location.pathname !== "/") {
        navigate("/");
      }
    }
  }, [user, loading, navigate, location.pathname]);
  
  if (loading) {
    return null;
  }
  
  if (user) {
    return null;
  }



  return (

    <>
        <Helmet>
        <title>BotAssistAI - AI Support Chatbot for Websites</title>
        <meta 
          name="description" 
          content="BotAssistAI is an advanced AI chatbot that boosts customer support on your website, improving engagement and reducing response time." 
        />
        <meta 
          name="keywords" 
          content="AI chatbot, website support, customer service bot, live chat, automated support, BotAssistAI" 
        />
        <link rel="canonical" href="https://www.botassistai.com/" />
      </Helmet>

      {!loading ? (
      user ? (
        navigate(`/${user.username}/dashboard`) || null
      ) : (
        location.pathname !== "/" ? (
          navigate("/") || null
        ) : (
    <div>
      <Header />
      <div className="container">
        <section className="hero">
          <div className="stars">
          {stars.map((star, index) => (
    <div
      key={index}
      className="star"
      style={{
        top: star.top,
        left: star.left,
        animation: `moveStars ${star.duration}s linear ${star.delay}s infinite, twinkle 1s ease-in-out alternate infinite`,
      }}
    />
  ))}
          </div>
          <h1>Revolutionize Your Customer Support with AI</h1>
          <p>
            Automate customer interactions, boost satisfaction, and increase
            efficiency with BotAssistAI. Our intelligent chatbot seamlessly
            handles inquiries, resolves issues, and enhances customer
            experiences like never before.
          </p>
          <Link to={"/sign-up"}>
          <button className="cta">Start Now</button>
          </Link>
        </section>

        <section className="features">
          <h2>Why Choose BotAssistAI?</h2>
          <div className="feature-list">
            <div className="feature">
              <h3>24/7 Instant Support 🎧</h3>
              <p>
                {" "}
                Experience engaging, human-like interactions,
                ensuring clear, natural, and intelligent responses.
              </p>
            </div>
            <div className="feature">
              <h3>Seamless Integration ⚡</h3>
              <p>
                Effortlessly integrate with your website, creating a smooth and connected support experience.
              </p>
            </div>
            <div className="feature">
              <h3>Smart AI Conversations 🤖</h3>
              <p>
                Get real-time, round-the-clock assistance, so customers never
                have to wait or struggle to find answers.
              </p>
            </div>
          </div>
        </section>
<HowItWorks />




<section className="use-cases">
  <div className="outside-wrapp">
    <h2>
      Who Can Benefit from BotAssistAI?
    </h2>
    <p style={{ maxWidth: "700px", marginTop: "3px", fontSize: "16.8px", color: "#f8f8f8", lineHeight: "25px" }}>
      Whether you're running an online store, managing patient appointments, or offering financial services—BotAssistAI is built to supercharge customer support for <span style={{color: "#00f5d4"}}>every industry</span>. Here are just a few examples:
    </p>
    <div className="use-case-list">
      <div className="use-case">
        <h3>
          E-commerce{" "}
          <FontAwesomeIcon
            icon={faCashRegister}
            style={{ marginLeft: "10px" }}
          />
        </h3>
        <p>
          Handle product inquiries, track orders, offer personalized
          recommendations, and reduce cart abandonment rates.
        </p>
      </div>
      
      <div className="use-case">
        <h3>
          Finance{" "}
          <FontAwesomeIcon
            icon={faCoins}
            style={{ marginLeft: "10px" }}
          />
        </h3>
        <p>
          Deliver secure, AI-driven financial assistance, process
          transactions, and offer fraud detection alerts to customers.
        </p>
      </div>
    </div>
  </div>

  <img
    src={`${process.env.PUBLIC_URL}/img/benefitImg.png`}
    alt="Benefit Image from Ai"
  />
</section>

        
<section className="comparison">
  <h2>How We Compare</h2>
  <p>
    Say goodbye to outdated support. BotAssistAI is faster, smarter, and built to scale.
  </p>
  
  <div className="comparison-table">
    {/* Traditional Support */}
    <div className="comparison-item traditional">
      <h3><span style={{ fontSize: "25px", marginTop: "-5px"}}>🛑</span> Traditional Support</h3>
      <ul>
        <li><span><FaClock /> <strong>Limited Capacity:</strong></span> Agents handle only a few chats daily.</li>
        <li><span><FaTimesCircle /> <strong>Slow Responses:</strong></span> Long wait times frustrate users.</li>
        <li><span><FaDollarSign /> <strong>High Costs:</strong></span> Staff and training eat your budget.</li>
        <li><span>❌ <strong>Human Errors:</strong> </span>Mistakes and miscommunication happen often.</li>
        <li><span><FaGlobe /> <strong>Language Gaps:</strong></span> Multilingual support is limited.</li>
        <li><span><FaUsers /> <strong>Scalability Issues:</strong></span> Can't keep up with spikes in demand.</li>
        <li><span><FaCogs /> <strong>Repetitive Tasks:</strong></span> Agents repeat the same answers daily.</li>
      </ul>
    </div>

    {/* BotAssistAI */}
    <div className="comparison-item ai">
      <div className="diagonal-overlay"></div>
      <h3><span style={{ fontSize: "25px", marginTop: "-5px"}}>🚀</span> BotAssistAI</h3>
      <ul>
        <li><FaBolt /> <strong>Always On:</strong> 24/7 support, no delays.</li>
        <li>⚡ <strong>Instant Replies:</strong> Answers in real-time.</li>
        <li><FaChartLine /> <strong>Self-Learning:</strong> Improves with every chat.</li>
        <li>💰 <strong>Lower Costs:</strong> Save big on support expenses.</li>
        <li><FaGlobe /> <strong>Multilingual:</strong> Talk to users in any language.</li>
        <li><FaUsers /> <strong>Effortlessly Scalable:</strong> Handle thousands of users at once.</li>
        <li><FaCogs /> <strong>Fully Automated:</strong> No more repetitive work.</li>
      </ul>
    </div>
  </div>
</section>



<section className="demo">
  <h2>Powering Smarter Support</h2>
  <p>
    BotAssistAI is built for brands that demand efficiency, speed, and intelligence — no tour required.
  </p>
  <Link to={'/sign-up'}>
  <button className="cta-demo">Level Up with AI</button>
  </Link>
</section>

{/**
        <section className="case-studies">
          <h2>Success Stories</h2>
          <div className="case-study">
            <h3>How an E-commerce Store Increased Sales by 40%</h3>
            <p>
              By integrating BotAssistAI, this retailer improved customer
              engagement, reduced wait times, and boosted conversions
              significantly.
            </p>
          </div>
        </section>

        <section className="blog">
          <h2>Latest Insights</h2>
          <div className="blog-post">
            <h3>5 Ways AI is Transforming Customer Support</h3>
            <p>
              Discover how AI-driven solutions are redefining the industry with
              efficiency and innovation.
            </p>
          </div>
        </section>
 */}
        <div className="divs-wrapper">
      <div className="wrapp2">
        <section className="analytics">
          <h2>
            <FaChartBar className="icon" /> AI-Driven Analytics
          </h2>
          <p>
            Leverage AI insights to track customer interactions, identify
            trends, and make the best business decisions.
          </p>
          <ul>
            <li>📊 Monitor real-time user behavior and engagement.</li>
            <li>📈 Detect emerging trends and market shifts.</li>
            <li>🤖 AI-powered predictions for informed decisions.</li>
            <li>🔍 Actionable insights to optimize conversions.</li>
          </ul>
          <Link to={"/features"}>
          <button className="cta">Explore Features</button>
          </Link>
        </section>

        <div className="collap-two">
        <section className="security">
  <h2>
    <FaRobot className="icon" /> AI Chatbot Support
  </h2>
  <p>
    Our AI-driven chatbot enhances customer interactions with real-time, personalized support, ensuring faster, more accurate responses.
  </p>
</section>


          <section className="pricing">
            <h2>
              <FaDollarSign className="icon" /> Cheap Pricing Plans
            </h2>
            <p>
  Choose the plan that fits your business — Pro for growing teams or Enterprise for advanced needs.
</p>

           <Link to={"/pricing"}>
           <button className="cta">View Pricing</button>
           </Link> 
          </section>
        </div>
      </div>
    </div>
        
<Newsletter />


<Faq />

        <section className="contact">
          <h2>Get in Touch</h2>
          <p>
            Have more questions? Contact our expert support team, and we'll be
            happy to assist you.
          </p>
          <Link to={'/contact'}>
          <button className="cta">Contact Us</button>
          </Link>
        </section>

        <section className="cta-section">
          <h2>Start Automating Customer Support Today!</h2>
          <p>
            Sign up now and experience the future of AI-driven customer
            support—boost efficiency and delight customers effortlessly.
          </p>
          <Link to={"/sign-up"}>
          <button className="cta">Start Now</button>
          </Link>
          
        </section>

        <Footer />
      </div>
    </div>
)
)
) : null}

    </>
  
  );
};

export default Homepage;
