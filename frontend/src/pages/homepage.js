import React, { useEffect, useState, useRef } from "react";
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
import { FaTimes, FaStar, FaFire, FaTwitter, FaLinkedinIn, FaInstagram, FaChartBar, FaShieldAlt, FaUserPlus } from "react-icons/fa";
import Newsletter from "../components/newsletter";
import Footer from "../components/footer";
import HowItWorks from "../components/howItWorks"
import Faq from "../components/faq"
import directory from '../directory';
import axios from "../utils/axiosShopify";
import { safeRedirect, initShopifyAppBridge, fetchWithAuth } from "../utils/initShopifyAppBridge";
import { Helmet } from "react-helmet";

const Homepage = () => {
  const [stars, setStars] = useState([]);
  const [showModal, setShowModal] = useState(false)
  const [shop, setShop] = useState(null);
  const [installed, setInstalled] = useState(null);
  const [colors, setColors] = useState({
    background: '#f2f2f2',
    chatbotBackground: '#092032',
    chatBoxBackground: '#112B3C',
    chatInputBackground: '#ffffff',        
    chatInputTextColor: '#000000',
    chatBtn: '#00F5D4',
    websiteChatBtn: '#00F5D4',
    websiteQuestion: '#ffffff',
    needHelpTextColor: '#00F5D4',
    textColor: '#cccccc',
    borderColor: '#00F5D4'
  });

  const [appBridgeReady, setAppBridgeReady] = useState(false);

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

  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");
    const hostParam = params.get("host");
  
    // If shop param missing, stop
    if (!shopParam) {
      console.warn("❌ Missing shop parameter in URL");
      return;
    }
  
    // If top-level cookie missing, redirect to /auth (sets top-level cookie)
    if (!document.cookie.includes("shopify_toplevel")) {
      window.top.location.href = `${directory}/shopify/auth?shop=${shopParam}`;
      return;
    }
  
    // Initialize Shopify App Bridge
    (async () => {
      const app = await initShopifyAppBridge();
      if (!app) {
        // If App Bridge init fails, fallback to OAuth install
        safeRedirect(`${directory}/shopify/install?shop=${shopParam}&host=${hostParam}`);
        return;
      }
      
      setAppBridgeReady(true);
      window.appBridge = app;
      try {
        // No /api/ping anymore — just assume App Bridge works
        console.log("✅ Shopify App Bridge initialized and embedded app session confirmed");
  
        // Optionally, you can trigger install if shop is not installed yet
        // safeRedirect(`${directory}/install?shop=${shopParam}&host=${hostParam}`);
      } catch (err) {
        console.error("❌ Shopify App Bridge init error:", err);
        safeRedirect(`${directory}/shopify/install?shop=${shopParam}&host=${hostParam}`);
      }
    })();
  }, []);
  
  

  

  useEffect(() => {

    if (!appBridgeReady) return; 

    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");
    const hostParam = params.get("host");
  
    if (!shopParam || !hostParam) {
      console.warn("❌ Not running inside Shopify context.");
      setLoading(false);
      return;
    }
  
    setShop(shopParam);
  
    const checkShop = async () => {
      try {
        const res = await fetchWithAuth(`/check-shopify-store?shop=${encodeURIComponent(shopParam)}`);
        const data = await res.json();
  
        if (!data.installed) {
          safeRedirect(`${directory}/shopify/install?shop=${shopParam}&host=${hostParam}`);
  
          await fetchWithAuth(`/chatbot-config-shopify`, {
            method: "POST",
            body: JSON.stringify({
              shop: shopParam,
              colors,
            }),
            headers: { "Content-Type": "application/json" },
          });
  
          return; 
        }
  
        if (!data.hasBilling) {
          console.warn("⚠️ Store installed but missing billing setup.");
          return;
        }
  
        console.log("✅ Shopify store ready");
        setInstalled(true);

        if (user?.username) {
          safeRedirect(`/${user.username}/dashboard?shop=${shopParam}&host=${hostParam}`);
        }
  
      } catch (err) {
        console.error("❌ Shopify flow failed:", err);
        setInstalled(false);
      } finally {
        setLoading(false);
      }
    };
  
    checkShop();
  }, [appBridgeReady]); 
  
  
  
  

  /*
  const redirectToInstall = async (shop) => {
    if (!shop) return;
    try {
      const response = await axios.post(`/chatbot-config-shopify`, {
        shop,
        colors,
      });
      if (response.data.data === true) {
        window.location.href = `https://api.botassistai.com/shopify/install?shop=${shop}`;
      }
    } catch (e) {
      console.log("An error occured while trying to send the chatbot config", e)
    }
   
  };
  */
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

  if (shop && installed === null) {
    return <div>Checking install status...</div>; 
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
        ) : location.pathname !== "/" ? (
          navigate("/") || null
        ) : (
          <div>
            <Header />
            {/*
            {shop && installed === false && (
              <div className="shopify-welcomeDiv">
                <span
                  onClick={() => setInstalled(true)}
                  className="shopify-prompt"
                >
                  <FaTimes />
                </span>
                <div className="shopify-welcome">
                  <h1>Welcome to BotAssistAI</h1>
                  <p>
                    Click the button below to install the app on your store.
                  </p>
                  <div className="chatbotConfigDiv">
                    <div className="chabotConfig">
                      <div className="config homepage">
                        <h2>Customize Your Chatbot</h2>
                        <span>
                          <div>
                            <p>Chatbot Background:</p>
                            <input
                              type="color"
                              value={colors.chatbotBackground}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  chatbotBackground: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <p>ChatBox Background:</p>
                            <input
                              type="color"
                              value={colors.chatBoxBackground}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  chatBoxBackground: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <p>Chat Input:</p>
                            <input
                              type="color"
                              value={colors.chatInputBackground}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  chatInputBackground: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <p>Chat Input Color:</p>
                            <input
                              type="color"
                              value={colors.chatInputTextColor}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  chatInputTextColor: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <p>Chat Btn:</p>
                            <input
                              type="color"
                              value={colors.chatBtn}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  chatBtn: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <p>Website Chat Btn:</p>
                            <input
                              type="color"
                              value={colors.websiteChatBtn}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  websiteChatBtn: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <p>Website question:</p>
                            <input
                              type="color"
                              value={colors.websiteQuestion}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  websiteQuestion: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <p>Need Help Text Color:</p>
                            <input
                              type="color"
                              value={colors.needHelpTextColor}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  needHelpTextColor: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <p>Text Color:</p>
                            <input
                              type="color"
                              value={colors.textColor}
                              onChange={(e) =>
                                setColors({
                                  ...colors,
                                  textColor: e.target.value,
                                })
                              }
                            />
                          </div>
                        </span>
                      </div>

                      <div
                        className="chatbot"
                        style={{ backgroundColor: colors.background }}
                      >
                        <div
                          className="chatbot-div"
                          style={{ backgroundColor: colors.chatbotBackground }}
                        >
                          <img
                            draggable="false"
                            src={`${process.env.PUBLIC_URL}/img/BigLogo.png`}
                          />
                          <div className="chat-div">
                            <div
                              className="chat-1"
                              style={{
                                color: colors.textColor,
                                backgroundColor: colors.chatBoxBackground,
                              }}
                            >
                              Hey, can you help me ?
                            </div>
                            <div
                              className="chat-2"
                              style={{
                                color: colors.textColor,
                                backgroundColor: colors.chatBoxBackground,
                              }}
                            >
                              Yes, sure . Let me know about what product
                            </div>
                          </div>
                          <div
                            className="chat-inputs homepage"
                            style={{
                              backgroundColor: colors.chatInputBackground,
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Enter your question"
                              readOnly
                              style={{
                                backgroundColor: colors.chatInputBackground,
                                color: colors.chatInputTextColor,
                                borderColor: colors.borderColor,
                              }}
                            />
                            <button
                              style={{
                                backgroundColor: colors.chatBtn,
                                color: colors.textColor,
                              }}
                            >
                              Send
                            </button>
                          </div>
                        </div>
                        <div
                          className="div-chatbot"
                          style={{
                            color: colors.needHelpTextColor,
                            borderColor: colors.borderColor,
                          }}
                        >
                          <div
                            style={{
                              background: colors.websiteQuestion,
                            }}
                          >
                            <p
                              style={{
                                color: colors.needHelpTextColor,
                                marginTop: "1.3px"
                              }}
                            >
                              Need Help?
                            </p>
                          </div>
                          <span
                            style={{ backgroundColor: colors.websiteChatBtn }}
                          >
                            💬
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button>
                    Install App
                  </button>
                </div>
              </div>
            )}
              */}
            <div className="container">
              <section className="hero">
                <div className="hero-text">
                  <h1>
                    The <span>24/7 AI</span> Support
                  </h1>
                  <h2>
                    Install, train, & automate 1000s of customer replies — all
                    on autopilot.
                  </h2>
                  <p>
                    Turn missed questions into sales with an AI chatbot that
                    replies instantly, 24/7. Easy setup in just 30 seconds, no
                    technical skills required. Boost customer engagement and
                    never miss a sale again.
                  </p>
                  <Link to={"/sign-up"}>
                    <button
                      style={{ background: "#00f5d4", color: "#fff" }}
                      className="hero-btn"
                    >
                      Try It Free – No Credit Card
                    </button>
                  </Link>
                  <a target="_blank" href={"https://shop-ease2.netlify.app/"}>
                    <button className="hero-btn aaaa">See Demo</button>
                  </a>
                  <div className="icon-hero">
                    <div>
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar className="hero-icon" />
                      5.0 reviews
                    </div>
                    <div>
                      <FaUsers className="hero-icon" />
                      100+ customers
                    </div>
                    <div>
                      <FaFire className="hero-icon" /> Founded 2025
                    </div>
                  </div>
                  <div className="hero-logos">
                    <img
                      className="first-hero"
                      src={`${process.env.PUBLIC_URL}/img/shopify.png`}
                      alt="Benefit Image from Ai"
                    />
                    <img
                      className="first-hero"
                      src={`${process.env.PUBLIC_URL}/img/nextJs.png`}
                      alt="Benefit Image from Ai"
                    />
                    <img
                      className="first-hero"
                      src={`${process.env.PUBLIC_URL}/img/php.png`}
                      alt="Benefit Image from Ai"
                    />
                    <img
                      className="first-hero"
                      src={`${process.env.PUBLIC_URL}/img/java.png`}
                      alt="Benefit Image from Ai"
                    />
                    <img
                      className="first-hero"
                      src={`${process.env.PUBLIC_URL}/img/reactLogo.png`}
                      alt="Benefit Image from Ai"
                    />
                    <img
                      className="first-hero"
                      src={`${process.env.PUBLIC_URL}/img/vue.png`}
                      alt="Benefit Image from Ai"
                    />
                    <img
                      className="first-hero"
                      src={`${process.env.PUBLIC_URL}/img/python.png`}
                      alt="Benefit Image from Ai"
                    />
                  </div>
                </div>
                <div className="hero-proof">
                  <img
                    className="first-hero"
                    src={`${process.env.PUBLIC_URL}/img/chat3.png`}
                    alt="Benefit Image from Ai"
                  />
                  <span>
                    <img
                      src={`${process.env.PUBLIC_URL}/img/chat2.png`}
                      alt="Benefit Image from Ai"
                    />
                    <img
                      src={`${process.env.PUBLIC_URL}/img/chat1.png`}
                      alt="Benefit Image from Ai"
                    />
                  </span>
                </div>
              </section>

              <section className="features">
                <h2>Why Choose BotAssistAI?</h2>
                <div className="feature-list">
                  <div className="feature">
                    <h3>24/7 Instant Support 🎧</h3>
                    <p>
                      {" "}
                      Experience engaging, human-like interactions, ensuring
                      clear, natural, and intelligent responses.
                    </p>
                  </div>
                  <div className="feature">
                    <h3>Seamless Integration ⚡</h3>
                    <p>
                      Effortlessly integrate with your website, creating a
                      smooth and connected support experience.
                    </p>
                  </div>
                  <div className="feature">
                    <h3>Smart AI Conversations 🤖</h3>
                    <p>
                      Get real-time, round-the-clock assistance, so customers
                      never have to wait or struggle to find answers.
                    </p>
                  </div>
                </div>
              </section>

              <section className="use-cases">
                <div className="outside-wrapp">
                  <h2>Who Can Benefit from BotAssistAI?</h2>
                  <p
                    style={{
                      maxWidth: "700px",
                      marginTop: "3px",
                      fontSize: "16.8px",
                      color: "#444",
                      lineHeight: "25px",
                      fontWeight: 500,
                    }}
                  >
                    Whether you're running an online store, managing patient
                    appointments, or offering financial services—BotAssistAI is
                    built to supercharge customer support for{" "}
                    <span style={{ color: "#00f5d4" }}>every industry</span>.
                    Here are just a few examples:
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
                        Handle product inquiries, track orders, offer
                        personalized recommendations, and reduce cart
                        abandonment rates.
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
                        transactions, and offer fraud detection alerts to
                        customers.
                      </p>
                    </div>
                  </div>
                </div>

                <img
                  src={`${process.env.PUBLIC_URL}/img/benefitImg.png`}
                  alt="Benefit Image from Ai"
                />
              </section>

              <HowItWorks />

              <section className="comparison">
                <h2>How We Compare</h2>
                <p>
                  Say goodbye to outdated support. BotAssistAI is faster,
                  smarter, and built to scale.
                </p>

                <div className="comparison-table">
                  {/* Traditional Support */}
                  <div className="comparison-item traditional">
                    <h3>
                      <span style={{ fontSize: "25px", marginTop: "-5px" }}>
                        🛑
                      </span>{" "}
                      Traditional Support
                    </h3>
                    <ul>
                      <li>
                        <span>
                          <FaClock /> <strong>Limited Capacity:</strong>
                        </span>{" "}
                        Agents handle only a few chats daily.
                      </li>
                      <li>
                        <span>
                          <FaTimesCircle /> <strong>Slow Responses:</strong>
                        </span>{" "}
                        Long wait times frustrate users.
                      </li>
                      <li>
                        <span>
                          <FaDollarSign /> <strong>High Costs:</strong>
                        </span>{" "}
                        Staff and training eat your budget.
                      </li>
                      <li>
                        <span>
                          ❌ <strong>Human Errors:</strong>{" "}
                        </span>
                        Mistakes and miscommunication happen often.
                      </li>
                      <li>
                        <span>
                          <FaGlobe /> <strong>Language Gaps:</strong>
                        </span>{" "}
                        Multilingual support is limited.
                      </li>
                      <li>
                        <span>
                          <FaUsers /> <strong>Scalability Issues:</strong>
                        </span>{" "}
                        Can't keep up with spikes in demand.
                      </li>
                      <li>
                        <span>
                          <FaCogs /> <strong>Repetitive Tasks:</strong>
                        </span>{" "}
                        Agents repeat the same answers daily.
                      </li>
                    </ul>
                  </div>

                  {/* BotAssistAI */}
                  <div className="comparison-item ai">
                    <div className="diagonal-overlay"></div>
                    <h3>
                      <span style={{ fontSize: "25px", marginTop: "-5px" }}>
                        🚀
                      </span>{" "}
                      BotAssistAI
                    </h3>
                    <ul>
                      <li>
                        <FaBolt /> <strong>Always On:</strong> 24/7 support, no
                        delays.
                      </li>
                      <li>
                        ⚡ <strong>Instant Replies:</strong> Answers in
                        real-time.
                      </li>
                      <li>
                        <FaChartLine /> <strong>Self-Learning:</strong> Improves
                        with every chat.
                      </li>
                      <li>
                        💰 <strong>Lower Costs:</strong> Save big on support
                        expenses.
                      </li>
                      <li>
                        <FaGlobe /> <strong>Multilingual:</strong> Talk to users
                        in any language.
                      </li>
                      <li>
                        <FaUsers /> <strong>Effortlessly Scalable:</strong>{" "}
                        Handle thousands of users at once.
                      </li>
                      <li>
                        <FaCogs /> <strong>Fully Automated:</strong> No more
                        repetitive work.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="demo">
                <h2>Powering Smarter Support</h2>
                <p>
                  BotAssistAI is built for brands that demand efficiency, speed,
                  and intelligence — no tour required.
                </p>
                <Link to={"/sign-up"}>
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
                      Leverage AI insights to track customer interactions,
                      identify trends, and make the best business decisions.
                    </p>
                    <ul>
                      <li>
                        📊 Monitor real-time user behavior and engagement.
                      </li>
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
                        Our AI-driven chatbot enhances customer interactions
                        with real-time, personalized support, ensuring faster,
                        more accurate responses.
                      </p>
                    </section>

                    <section className="pricing">
                      <h2>
                        <FaDollarSign className="icon" /> Cheap Pricing Plans
                      </h2>
                      <p>
                        Choose the plan that fits your business — Pro for
                        growing teams or Enterprise for advanced needs.
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
                  Have more questions? Contact our expert support team, and
                  we'll be happy to assist you.
                </p>
                <Link to={"/contact"}>
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
      ) : null}
    </>
  );
};

export default Homepage;
