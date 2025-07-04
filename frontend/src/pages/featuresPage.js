import React, {useState, useEffect} from "react";
import { FaRobot, FaClock, FaChartLine, FaGlobe, FaShieldAlt, FaBolt, FaUsers, FaCogs, FaComments, FaCheck, FaTimes } from "react-icons/fa";
import "../styling/featuresPage.css";
import Header from "../components/Header";
import Newsletter from "../components/newsletter";
import Footer from "../components/footer";
import HowItWorks from "../components/howItWorks";
import { Link, useNavigate, useLocation } from "react-router-dom";
import directory from '../directory';
import { Helmet } from "react-helmet";
import axios from "axios";
const FeaturesPage = () => {
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
      } else if (location.pathname !== "/features") {
        navigate("/features");
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
  <title> Features - BotAssist AI | AI Support Chatbot for Websites</title>
  <meta name="description" content="Discover the powerful features of BotAssist AI — the smart chatbot that boosts customer support, automates FAQs, and improves website engagement." />
  <meta name="keywords" content="AI chatbot, website chatbot, customer support AI, live chat automation, FAQ bot, BotAssist AI features" />
  <link rel="canonical" href="https://www.botassistai.com/features" />
</Helmet>

{!loading ? (
      user ? (
        navigate(`/${user.username}/dashboard`) || null
      ) : (
        location.pathname !== "/features" ? (
          navigate("/features") || null
        ) : (
     <div className="features-page">
      <Header />
      {/* Hero Section */}
      <section className="features-hero">
        <h1>🚀 AI-Powered Customer Support</h1>
        <p>Smarter, Faster, and More Efficient – Enhance customer experiences with AI automation.</p>
        <Link to={"/sign-up"}>
        <button className="cta">Get Started</button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="features-section">
  <h2 className="features-title">Why Choose Our AI Solution?</h2>
  <p className="features-description">
    Empower your business with AI technology that enhances interactions, automates workflows, and ensures security.
</p>
  <div className="features-grid2">
    <div className="feature-item1">
      <FaClock className="feature-icon" />
      <h3>24/7 AI Support</h3>
      <p>Always available, no wait times, and instant responses.</p>
    </div>
    <div className="feature-item1">
      <FaRobot className="feature-icon" />
      <h3>Smart AI Conversations</h3>
      <p>Understands customer intent, provides real-time solutions.</p>
    </div>
    <div className="feature-item1">
      <FaGlobe className="feature-icon" />
      <h3>Multilingual Support</h3>
      <p>Communicate with customers in multiple languages effortlessly.</p>
    </div>
    <div className="feature-item1">
      <FaChartLine className="feature-icon" />
      <h3>AI-Driven Analytics</h3>
      <p>Track performance, customer behavior, and optimize interactions.</p>
    </div>
    <div className="feature-item1">
      <FaCogs className="feature-icon" />
      <h3>Automated Workflows</h3>
      <p>Reduce repetitive tasks and streamline customer support.</p>
    </div>
    <div className="feature-item1">
      <FaShieldAlt className="feature-icon" />
      <h3>Enterprise-Grade Security</h3>
      <p>Secure and compliant with industry standards.</p>
    </div>
    <div className="feature-item1">
      <FaBolt className="feature-icon" />
      <h3>Fast & Scalable</h3>
      <p>Handle thousands of customers simultaneously with ease.</p>
    </div>
    <div className="feature-item1">
      <FaUsers className="feature-icon" />
      <h3>Customizable AI Chatbot</h3>
      <p>Personalize conversations to match your brand's voice.</p>
    </div>
  </div>
</section>


      {/* Video Section */}
      <section className="video-section">
        <h2>🎥 See BotAssistAI in Action</h2>
        <p>Watch how AI transforms customer interactions.</p>
        <video controls>
          <source src="your-video-url.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <p>Or you can check out the live <a href="">demo</a></p>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Comparison Table */}
      <section className="comparison-section">
  <h2>🤖 AI vs. Traditional Support</h2>
  <table>
    <thead>
      <tr>
        <th>Feature</th>
        <th>Traditional Support</th>
        <th>BotAssistAI</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="Feature">Availability</td>
        <td data-label="Traditional Support"><FaTimes className="red-icon" /> Limited hours</td>
        <td data-label="BotAssistAI"><FaCheck className="green-icon" /> 24/7 Instant</td>
      </tr>
      <tr>
        <td data-label="Feature">Response Time</td>
        <td data-label="Traditional Support"><FaTimes className="red-icon" /> Slow (minutes to hours)</td>
        <td data-label="BotAssistAI"><FaCheck className="green-icon" /> Instant (milliseconds)</td>
      </tr>
      <tr>
        <td data-label="Feature">Cost Efficiency</td>
        <td data-label="Traditional Support"><FaTimes className="red-icon" /> High operational costs</td>
        <td data-label="BotAssistAI"><FaCheck className="green-icon" /> Low & scalable</td>
      </tr>
    </tbody>
  </table>
</section>

     <Newsletter />
     
      <section className="cta-section">
        <h2>🚀 Get Started with BotAssistAI Today!</h2>
        <p>Sign up now and automate customer support effortlessly.</p>
        <Link to={"/sign-up"}>
        <button className="cta">Try for Free</button>
        </Link>
        
      </section>

<Footer />
    </div>
  )
)
) : null}

    </>


   
  );
};

export default FeaturesPage;
