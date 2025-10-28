import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaRobot, FaChartLine, FaUsers, FaGlobe, FaBrain, FaRocket, FaLightbulb, FaShieldAlt } from "react-icons/fa";
import "../styling/About.css"; 
import Header from "../components/Header";
import Newsletter from "../components/newsletter";
import Footer from "../components/footer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import directory from '../directory';
import { fetchWithAuth } from "../utils/initShopifyAppBridge";
import { Helmet } from "react-helmet";
const About = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation()


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchWithAuth("/auth-check"); // already parsed JSON
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
    if (!loading) {
      if (user) {
        navigate(`/${user.username}/dashboard`);
      } else if (location.pathname !== "/about") {
        navigate("/about");
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
  <title>About BotAssistAI - Your AI Support Chatbot for Websites</title>
  <meta 
    name="description" 
    content="Learn more about BotAssistAI, the intelligent AI chatbot designed to provide seamless customer support on your website and boost user engagement." 
  />
  <meta 
    name="keywords" 
    content="AI chatbot, customer support, website chatbot, BotAssistAI, AI support, live chat, automated support" 
  />
  <link 
    rel="canonical" 
    href="https://www.botassistai.com/about" 
  />
</Helmet>


{!loading ? (
      user ? (
        navigate(`/${user.username}/dashboard`) || null
      ) : (
        location.pathname !== "/about" ? (
          navigate("/about") || null
        ) : (
    <section className="about-container">
      <Header />
      <div className="features-hero">
        <h1>🚀 About BotAssistAI</h1>
        <p>
          Revolutionizing customer support with AI-driven automation. Our mission is to help
          businesses deliver faster, smarter, and more efficient customer interactions.
        </p>
      </div>

      {/* What We Do */}
      <div className="about-services">
        <h2>What We Offer</h2>
        <p>
          BotAssistAI empowers businesses with intelligent chatbot solutions, ensuring seamless 
          support, automated workflows, and enhanced customer satisfaction.
        </p>
        <div className="about-services-grid">
          <div className="service-card">
            <FaRobot className="service-icon" />
            <h3>AI-Powered Support</h3>
            <p>Always available, instantly responding to customer needs.</p>
          </div>
          <div className="service-card">
            <FaChartLine className="service-icon" />
            <h3>Data-Driven Insights</h3>
            <p>Understand customer behavior and optimize interactions.</p>
          </div>
          <div className="service-card">
            <FaUsers className="service-icon" />
            <h3>Scalability</h3>
            <p>Handle thousands of users simultaneously, no delays.</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="about-process">
        <h2>How BotAssistAI Works</h2>
        <div className="process-steps">
          <div className="step-card">
            <FaGlobe className="step-icon" />
            <h3>Seamless Integration</h3>
            <p>Connect with your website, CRM, and social platforms effortlessly.</p>
          </div>
          <div className="step-card">
            <FaBrain className="step-icon" />
            <h3>AI Learning & Automation</h3>
            <p>Continuously improving interactions for better customer experiences.</p>
          </div>
          <div className="step-card">
            <FaRocket className="step-icon" />
            <h3>Optimization & Growth</h3>
            <p>Scales with your business, providing smarter automation over time.</p>
          </div>
        </div>
      </div>

      {/* Our Vision */}
      <div className="about-vision">
      <div className="outer-vision">
<h2>The Future of <br /> AI-Powered Assistance</h2>
<p>
  At BotAssistAI, we believe the future of customer support is <strong>AI-powered, real-time, and deeply personalized</strong>.  
  Our mission is to replace outdated ticket-based systems with intelligent chatbots that provide <strong>instant, helpful responses — anytime, anywhere</strong>.
</p>
<p>
  We’re building a world where businesses of all sizes can deliver <strong>reliable, scalable, and human-like support 24/7</strong>,  
  without the cost and complexity of traditional support teams.
</p>

      </div>
        <img src={`${process.env.PUBLIC_URL}/img/vision.png`} />
      </div>

      {/* Core Values */}
      <div className="about-values">
        
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <FaLightbulb className="value-icon" />
            <h3>Innovation</h3>
            <p>We embrace cutting-edge AI technology to solve real-world customer support challenges.</p>
          </div>
          <div className="value-card">
            <FaShieldAlt className="value-icon" />
            <h3>Reliability</h3>
            <p>Our AI is built to ensure consistent, accurate, and efficient responses—anytime, anywhere.</p>
          </div>
          <div className="value-card">
            <FaUsers className="value-icon" />
            <h3>Customer-Centric</h3>
            <p>We prioritize the needs of businesses and their customers, making AI support easy to implement.</p>
          </div>
        </div>
      </div>

      {/* Why It Matters */}
      <div className="about-benefits">
        <h2>Why BotAssistAI Matters</h2>
        <p>Traditional customer support is slow and expensive. We change that.</p>
        <ul>
          <li><FaCheckCircle className="benefit-icon" /> 24/7 AI-driven customer support</li>
          <li><FaCheckCircle className="benefit-icon" /> Reduced response times</li>
          <li><FaCheckCircle className="benefit-icon" /> Cost-efficient automated workflows</li>
        </ul>
      </div>
<Newsletter />
      {/* Call to Action */}
      <div className="cta-section">
        <h2>🚀 Start Automating Customer Support Today</h2>
        <p>Join businesses using BotAssistAI to revolutionize their customer experience.</p>
        <Link to={'/sign-up'}>
        <button className="cta">Try for Free</button>
        </Link>
        
      </div>
      <Footer />
    </section>
     )
    )
  ) : null}
    </>
    
  );
};

export default About;
